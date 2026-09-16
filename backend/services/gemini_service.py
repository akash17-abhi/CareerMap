from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Iterable, Sequence

from google import genai
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from core.config import get_settings
from schemas.analyzer import (
    AnalyzerResult,
    GeminiEnhancement,
    GeminiValidation,
    GeminiValidationIssue,
    LocalAnalyzerResult,
    MissingSkill,
    SkillMatch,
    SkillStatus,
)


# ============================================================================
# Configuration
# ============================================================================

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "gemini-3.6-flash"

MAX_EVIDENCE_PER_SKILL = 3
MAX_EVIDENCE_TEXT_LENGTH = 500
MAX_VALIDATION_ISSUES = 12

VALIDATION_TIMEOUT_SECONDS = 90

VALID_SEVERITIES = {
    "high",
    "medium",
    "low",
}


# ============================================================================
# Exceptions
# ============================================================================

class GeminiServiceError(RuntimeError):
    """
    Raised when Gemini validation/enhancement cannot be completed safely.
    """


class GeminiConfigurationError(GeminiServiceError):
    """
    Raised when Gemini configuration is unavailable.
    """


class GeminiResponseError(GeminiServiceError):
    """
    Raised when Gemini returns an invalid or unusable response.
    """


# ============================================================================
# Internal Response Models
# ============================================================================

class GeminiValidationIssuePayload(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
    )

    id: str = Field(
        min_length=1,
        max_length=100,
    )

    severity: str = Field(
        min_length=1,
        max_length=20,
    )

    area: str = Field(
        min_length=1,
        max_length=100,
    )

    issue: str = Field(
        min_length=1,
        max_length=1000,
    )

    suggested_review: str = Field(
        min_length=1,
        max_length=1000,
    )


class GeminiValidationPayload(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
    )

    is_consistent: bool

    confidence: str = Field(
        min_length=1,
        max_length=20,
    )

    issues: list[
        GeminiValidationIssuePayload
    ] = Field(
        default_factory=list,
        max_length=MAX_VALIDATION_ISSUES,
    )

    summary: str = Field(
        min_length=1,
        max_length=2000,
    )


class GeminiEnhancementPayload(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
    )

    summary: str = Field(
        min_length=1,
        max_length=2500,
    )

    match_explanation: str = Field(
        min_length=1,
        max_length=2500,
    )

    strengths_explanation: str = Field(
        min_length=1,
        max_length=2500,
    )

    gaps_explanation: str = Field(
        min_length=1,
        max_length=2500,
    )

    recommendations_summary: str = Field(
        min_length=1,
        max_length=2500,
    )

    next_steps_summary: str = Field(
        min_length=1,
        max_length=2500,
    )


class GeminiAnalyzerPayload(BaseModel):
    """
    Single structured Gemini response.

    Gemini returns validation + enhancement together so the service makes
    exactly one model request.
    """
    model_config = ConfigDict(
        extra="ignore",
    )

    validation: GeminiValidationPayload

    enhancement: GeminiEnhancementPayload


# ============================================================================
# Internal Models
# ============================================================================

@dataclass(frozen=True)
class GeminiServiceResult:
    validation: GeminiValidation
    enhancement: GeminiEnhancement


# ============================================================================
# Client
# ============================================================================

def _get_api_key() -> str | None:
    settings = get_settings()

    api_key = settings.gemini_api_key

    if api_key is None:
        return None

    api_key = api_key.strip()

    return api_key or None


def _get_model() -> str:
    """
    Read a future model override from the environment/config when available.

    Current default remains gemini-3.6-flash.
    """
    settings = get_settings()

    configured_model = getattr(
        settings,
        "gemini_model",
        None,
    )

    if configured_model:
        configured_model = str(
            configured_model
        ).strip()

        if configured_model:
            return configured_model

    return DEFAULT_MODEL


def _create_client() -> genai.Client:
    api_key = _get_api_key()

    if not api_key:
        raise GeminiConfigurationError(
            "GEMINI_API_KEY is not configured."
        )

    try:
        return genai.Client(
            api_key=api_key,
        )

    except Exception as exc:
        logger.exception(
            "Failed to initialize Gemini client."
        )

        raise GeminiConfigurationError(
            "Could not initialize Gemini client."
        ) from exc


# ============================================================================
# Serialization
# ============================================================================

def _model_dump(
    model: Any,
) -> dict[str, Any]:
    """
    Pydantic v2-compatible model serialization.
    """
    if hasattr(
        model,
        "model_dump",
    ):
        return model.model_dump(
            mode="json"
        )

    if hasattr(
        model,
        "dict",
    ):
        return model.dict()

    if isinstance(
        model,
        dict,
    ):
        return model

    raise TypeError(
        f"Unsupported object for serialization: {type(model)!r}"
    )


def _compact_json(
    value: Any,
) -> str:
    """
    Compact JSON for Gemini input.

    This reduces unnecessary prompt size while keeping the complete
    structured local result.
    """
    return json.dumps(
        _model_dump(value),
        ensure_ascii=False,
        separators=(
            ",",
            ":",
        ),
    )


# ============================================================================
# Local Result Preparation
# ============================================================================

def _sanitize_evidence_text(
    value: str,
) -> str:
    text = str(
        value or ""
    ).strip()

    if len(text) <= MAX_EVIDENCE_TEXT_LENGTH:
        return text

    return (
        text[:MAX_EVIDENCE_TEXT_LENGTH].rstrip()
        + "…"
    )


def _sanitize_local_analysis(
    local_analysis: LocalAnalyzerResult,
) -> dict[str, Any]:
    """
    Prepare the local result for Gemini.

    Important:
        - Scores/statuses/facts remain unchanged.
        - We do not send raw CV/JD.
        - Only the structured analysis and derived evidence are sent.
        - Very large evidence blocks are capped.
    """
    data = _model_dump(
        local_analysis
    )

    skills = data.get(
        "skills",
        [],
    )

    for skill in skills:
        evidence = skill.get(
            "evidence",
            [],
        )

        if isinstance(
            evidence,
            list,
        ):
            skill["evidence"] = [
                {
                    "source_type": item.get(
                        "source_type",
                        "other",
                    ),
                    "section": item.get(
                        "section",
                        "unknown",
                    ),
                    "text": _sanitize_evidence_text(
                        item.get(
                            "text",
                            "",
                        )
                    ),
                    "strength": item.get(
                        "strength",
                        0,
                    ),
                    "confidence": item.get(
                        "confidence",
                        "low",
                    ),
                }
                for item in evidence[
                    :MAX_EVIDENCE_PER_SKILL
                ]
            ]

    return data


# ============================================================================
# Ground Truth Extraction
# ============================================================================

def _local_skill_map(
    local_analysis: LocalAnalyzerResult,
) -> dict[str, SkillMatch]:
    return {
        skill.id: skill
        for skill in local_analysis.skills
    }


def _local_gap_map(
    local_analysis: LocalAnalyzerResult,
) -> dict[str, MissingSkill]:
    return {
        gap.id: gap
        for gap in local_analysis.missing_skills
    }


def _allowed_skill_statuses(
    local_analysis: LocalAnalyzerResult,
) -> dict[str, SkillStatus]:
    return {
        skill.id: skill.status
        for skill in local_analysis.skills
    }


def _local_fact_index(
    local_analysis: LocalAnalyzerResult,
) -> dict[str, Any]:
    """
    Create a compact immutable-style index of facts Gemini is allowed to use.
    """
    return {
        "role": local_analysis.role,
        "overall_match_score": (
            local_analysis
            .score_breakdown
            .overall_match_score
        ),
        "skill_match_score": (
            local_analysis
            .score_breakdown
            .skill_match_score
        ),
        "keyword_match_score": (
            local_analysis
            .score_breakdown
            .keyword_match_score
        ),
        "experience_match_score": (
            local_analysis
            .score_breakdown
            .experience_match_score
        ),
        "education_match_score": (
            local_analysis
            .score_breakdown
            .education_match_score
        ),
        "semantic_similarity_score": (
            local_analysis
            .score_breakdown
            .semantic_similarity_score
        ),
        "ats_score": (
            local_analysis
            .ats
            .score
        ),
        "required_keywords": (
            local_analysis
            .keywords
            .required_keywords
        ),
        "matched_required_keywords": (
            local_analysis
            .keywords
            .matched_required_keywords
        ),
        "skill_statuses": _allowed_skill_statuses(
            local_analysis
        ),
        "gap_ids": list(
            _local_gap_map(
                local_analysis
            ).keys()
        ),
    }


# ============================================================================
# Prompt Construction
# ============================================================================

SYSTEM_INSTRUCTION = """
You are the explanation and validation layer of CareerMap, a
privacy-first AI career assistant.

The application has already completed a deterministic local analysis of a
candidate resume against a job description.

You will receive ONLY that structured local analysis.

STRICT SOURCE-OF-TRUTH RULES:

1. The local analysis is authoritative for scores, statuses, counts, extracted
   facts, evidence, and classifications.

2. Never change or reinterpret:
   - overall_match_score
   - skill_match_score
   - keyword_match_score
   - experience_match_score
   - education_match_score
   - semantic_similarity_score
   - ATS score
   - skill status
   - required/preferred status
   - evidence
   - experience facts
   - education facts
   - missing-skill facts

3. Never invent:
   - skills
   - experience
   - years of experience
   - projects
   - education
   - certifications
   - employers
   - job titles
   - achievements
   - technologies
   - candidate capabilities

4. A skill marked "partial" is NOT missing knowledge.
   Explain it as insufficient or weaker resume evidence.

5. A skill marked "missing" means no reliable supporting evidence was found
   by the local analyzer. Do not claim the candidate does not know the skill.

6. Projects and internships must not be silently converted into full-time
   professional experience.

7. ATS readiness and job-fit are different concepts.
   Do not describe a high ATS score as proof of high job fit.

8. TF-IDF/cosine similarity is textual alignment, not proof of expertise.

9. Do not use external knowledge to add candidate-specific facts.

10. Validation means checking whether the structured analysis appears internally
    coherent. If there is a possible concern, flag it explicitly rather than
    silently changing the local result.

11. Enhancement means improving explanation, prioritization, readability, and
    actionable recommendations while remaining completely grounded in the
    local result.

12. If evidence is insufficient for a statement, use cautious language.

13. Keep the final explanation useful to an entry-level candidate and avoid
    unnecessary jargon.

Return valid JSON matching the supplied schema.
""".strip()


def _build_user_prompt(
    local_analysis: LocalAnalyzerResult,
) -> str:
    sanitized = _sanitize_local_analysis(
        local_analysis
    )

    fact_index = _local_fact_index(
        local_analysis
    )

    return (
        "Below is the authoritative local CareerMap analysis.\n\n"
        "LOCAL_FACT_INDEX:\n"
        f"{json.dumps(fact_index, ensure_ascii=False)}\n\n"
        "LOCAL_ANALYSIS:\n"
        f"{json.dumps(sanitized, ensure_ascii=False)}\n\n"
        "TASK:\n"
        "1. Validate internal consistency without modifying local facts.\n"
        "2. Flag only meaningful possible inconsistencies or ambiguities.\n"
        "3. Write a concise grounded summary.\n"
        "4. Explain the match using the existing local scores/signals.\n"
        "5. Explain strengths using only existing strong evidence.\n"
        "6. Explain gaps using only existing partial/missing skills and ATS issues.\n"
        "7. Give practical recommendations grounded in the existing gaps.\n"
        "8. Give sensible next steps based only on the local analysis.\n"
        "9. Never output a changed score or changed skill status.\n"
    )


# ============================================================================
# Response Schema
# ============================================================================

def _response_schema() -> dict[str, Any]:
    """
    Build the JSON schema sent to Gemini.

    Pydantic v2 provides the schema through model_json_schema().
    """
    return GeminiAnalyzerPayload.model_json_schema()


# ============================================================================
# Gemini Response Text Extraction
# ============================================================================

def _strip_code_fences(
    text: str,
) -> str:
    """
    Remove accidental markdown JSON fences.
    """
    cleaned = str(
        text or ""
    ).strip()

    if not cleaned:
        return ""

    cleaned = re.sub(
        r"^\s*```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"\s*```\s*$",
        "",
        cleaned,
    )

    return cleaned.strip()


def _extract_output_text(
    interaction: Any,
) -> str:
    """
    Extract the generated JSON text from the Interactions API response.

    Current SDK responses expose output_text; the fallback path handles
    older/variant response objects where text may live in steps.
    """
    output_text = getattr(
        interaction,
        "output_text",
        None,
    )

    if output_text:
        return str(
            output_text
        ).strip()

    steps = getattr(
        interaction,
        "steps",
        None,
    )

    if steps:
        for step in reversed(
            list(steps)
        ):
            content = getattr(
                step,
                "content",
                None,
            )

            if not content:
                continue

            for content_item in reversed(
                list(content)
            ):
                text = getattr(
                    content_item,
                    "text",
                    None,
                )

                if text:
                    return str(
                        text
                    ).strip()

    raise GeminiResponseError(
        "Gemini returned no text output."
    )


def _parse_json_response(
    text: str,
) -> GeminiAnalyzerPayload:
    cleaned = _strip_code_fences(
        text
    )

    if not cleaned:
        raise GeminiResponseError(
            "Gemini returned an empty response."
        )

    try:
        parsed = json.loads(
            cleaned
        )

    except json.JSONDecodeError as exc:
        # Sometimes the model may surround valid JSON with extra text.
        first_brace = cleaned.find(
            "{"
        )
        last_brace = cleaned.rfind(
            "}"
        )

        if (
            first_brace >= 0
            and last_brace > first_brace
        ):
            possible_json = cleaned[
                first_brace:last_brace + 1
            ]

            try:
                parsed = json.loads(
                    possible_json
                )

            except json.JSONDecodeError:
                raise GeminiResponseError(
                    "Gemini returned invalid JSON."
                ) from exc

        else:
            raise GeminiResponseError(
                "Gemini returned invalid JSON."
            ) from exc

    try:
        return GeminiAnalyzerPayload.model_validate(
            parsed
        )

    except ValidationError as exc:
        raise GeminiResponseError(
            "Gemini response did not match the expected schema."
        ) from exc


# ============================================================================
# Gemini API Call
# ============================================================================

def _create_interaction(
    client: genai.Client,
    local_analysis: LocalAnalyzerResult,
) -> Any:
    """
    Make the single stateless Gemini request.

    No raw resume or JD is passed here.
    """
    prompt = _build_user_prompt(
        local_analysis
    )

    model = _get_model()

    response_format = {
        "type": "text",
        "mime_type": "application/json",
        "schema": _response_schema(),
    }

    try:
        interaction = client.interactions.create(
            model=model,
            store=False,
            system_instruction=SYSTEM_INSTRUCTION,
            input=prompt,
            response_format=response_format,
            generation_config={
                "thinking_level": "low",
            },
        )

    except TypeError:
        # Compatibility fallback for SDK revisions that may not accept
        # thinking_level in generation_config.
        try:
            interaction = client.interactions.create(
                model=model,
                store=False,
                system_instruction=SYSTEM_INSTRUCTION,
                input=prompt,
                response_format=response_format,
            )

        except Exception as exc:
            logger.exception(
                "Gemini interaction failed."
            )

            raise GeminiServiceError(
                "Gemini analysis request failed."
            ) from exc

    except Exception as exc:
        logger.exception(
            "Gemini interaction failed."
        )

        raise GeminiServiceError(
            "Gemini analysis request failed."
        ) from exc

    return interaction


# ============================================================================
# Response Conversion
# ============================================================================

def _normalize_validation_severity(
    value: str,
) -> str:
    normalized = str(
        value or ""
    ).strip().lower()

    if normalized not in VALID_SEVERITIES:
        return "low"

    return normalized


def _normalize_validation_confidence(
    value: str,
) -> str:
    normalized = str(
        value or ""
    ).strip().lower()

    if normalized in {
        "high",
        "medium",
        "low",
    }:
        return normalized

    return "medium"


def _convert_validation(
    payload: GeminiValidationPayload,
) -> GeminiValidation:
    issues: list[GeminiValidationIssue] = []

    for issue in payload.issues:
        issues.append(
            GeminiValidationIssue(
                id=issue.id,
                severity=_normalize_validation_severity(
                    issue.severity
                ),
                area=issue.area,
                issue=issue.issue,
                suggested_review=issue.suggested_review,
            )
        )

    return GeminiValidation(
        is_consistent=payload.is_consistent,
        confidence=_normalize_validation_confidence(
            payload.confidence
        ),
        issues=issues,
        summary=payload.summary.strip(),
    )


def _convert_enhancement(
    payload: GeminiEnhancementPayload,
) -> GeminiEnhancement:
    return GeminiEnhancement(
        summary=payload.summary.strip(),
        match_explanation=payload.match_explanation.strip(),
        strengths_explanation=(
            payload.strengths_explanation.strip()
        ),
        gaps_explanation=(
            payload.gaps_explanation.strip()
        ),
        recommendations_summary=(
            payload.recommendations_summary.strip()
        ),
        next_steps_summary=(
            payload.next_steps_summary.strip()
        ),
    )


# ============================================================================
# Post-Generation Grounding Validation
# ============================================================================

def _contains_number(
    text: str,
    value: int | float,
) -> bool:
    """
    Check whether a numeric fact is explicitly represented.

    This is diagnostic only; the service does NOT require every score to be
    repeated in the prose.
    """
    number_variants = {
        str(value),
        f"{float(value):.1f}",
        f"{float(value):.2f}",
    }

    return any(
        variant in text
        for variant in number_variants
    )


def _validate_enhancement_against_local(
    enhancement: GeminiEnhancement,
    local_analysis: LocalAnalyzerResult,
) -> list[str]:
    """
    Post-generation safety checks.

    We look for obvious contradictions. We do not attempt to infer arbitrary
    natural-language contradictions because that would risk changing the
    source-of-truth policy.
    """
    issues: list[str] = []

    combined_text = " ".join(
        [
            enhancement.summary,
            enhancement.match_explanation,
            enhancement.strengths_explanation,
            enhancement.gaps_explanation,
            enhancement.recommendations_summary,
            enhancement.next_steps_summary,
        ]
    )

    # ------------------------------------------------------------------------
    # Check forbidden strength claims around missing/partial skills.
    # ------------------------------------------------------------------------

    for skill in local_analysis.skills:
        name = skill.name.strip()

        if not name:
            continue

        if skill.status in {
            "missing",
            "partial",
        }:
            strong_claim_patterns = (
                rf"\b{name}\s+(?:is|are)\s+(?:strong|excellent|expert)",
                rf"\bexpert(?:ise)?\s+(?:in|with)\s+{re.escape(name)}",
                rf"\badvanced\s+{re.escape(name)}",
            )

            for pattern in strong_claim_patterns:
                if re.search(
                    pattern,
                    combined_text,
                    flags=re.IGNORECASE,
                ):
                    issues.append(
                        f"Gemini may overstate the {skill.status} "
                        f"{name} evidence."
                    )
                    break

    # ------------------------------------------------------------------------
    # Check obvious claim of "no experience" when relevant evidence exists.
    # ------------------------------------------------------------------------

    experience = local_analysis.experience

    has_relevant_experience = bool(
        experience.relevant_roles_found
        or experience.relevant_projects_found
        or experience.relevant_internships_found
    )

    if (
        has_relevant_experience
        and re.search(
            r"\bno\s+(?:relevant\s+)?experience\b",
            combined_text,
            flags=re.IGNORECASE,
        )
    ):
        issues.append(
            "Gemini may incorrectly describe the candidate as having no "
            "relevant experience despite local evidence."
        )

    # ------------------------------------------------------------------------
    # Check ATS/job-fit conflation.
    # ------------------------------------------------------------------------

    ats_score = local_analysis.ats.score
    overall_score = (
        local_analysis
        .score_breakdown
        .overall_match_score
    )

    if (
        ats_score >= 80
        and overall_score < 60
        and re.search(
            r"\bATS\b.{0,60}\b(?:excellent fit|strong fit|high fit|perfect fit)\b",
            combined_text,
            flags=re.IGNORECASE,
        )
    ):
        issues.append(
            "Gemini may be conflating ATS readiness with job fit."
        )

    return _unique_strings(
        issues
    )


def _unique_strings(
    values: Iterable[str],
) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []

    for value in values:
        normalized = str(
            value
        ).strip().lower()

        if not normalized or normalized in seen:
            continue

        seen.add(
            normalized
        )

        result.append(
            str(value).strip()
        )

    return result


def _merge_validation_warnings(
    validation: GeminiValidation,
    grounding_issues: Sequence[str],
) -> GeminiValidation:
    if not grounding_issues:
        return validation

    current_issues = list(
        validation.issues
    )

    existing_issue_text = {
        issue.issue.strip().lower()
        for issue in current_issues
    }

    for index, issue_text in enumerate(
        grounding_issues,
        start=1,
    ):
        if issue_text.lower() in existing_issue_text:
            continue

        current_issues.append(
            GeminiValidationIssue(
                id=f"grounding-{index}",
                severity="high",
                area="grounding",
                issue=issue_text,
                suggested_review=(
                    "Review this explanation before displaying it. "
                    "The local analysis remains authoritative."
                ),
            )
        )

    is_consistent = (
        validation.is_consistent
        and not grounding_issues
    )

    confidence = (
        "low"
        if grounding_issues
        else validation.confidence
    )

    summary = validation.summary

    if grounding_issues:
        summary = (
            summary.rstrip()
            + " Additional grounding checks found wording "
              "that should be reviewed against the local analysis."
        )

    return GeminiValidation(
        is_consistent=is_consistent,
        confidence=confidence,
        issues=current_issues[
            :MAX_VALIDATION_ISSUES
        ],
        summary=summary,
    )


# ============================================================================
# Public Gemini Service
# ============================================================================

def enhance_local_analysis(
    local_analysis: LocalAnalyzerResult,
) -> GeminiServiceResult:
    """
    Validate and enhance a complete local analysis with Gemini.

    Gemini is used only after local analysis has finished.

    Raises:
        GeminiConfigurationError
        GeminiServiceError
        GeminiResponseError
    """
    if local_analysis is None:
        raise ValueError(
            "local_analysis cannot be None."
        )

    client = _create_client()

    interaction = _create_interaction(
        client=client,
        local_analysis=local_analysis,
    )

    output_text = _extract_output_text(
        interaction
    )

    payload = _parse_json_response(
        output_text
    )

    validation = _convert_validation(
        payload.validation
    )

    enhancement = _convert_enhancement(
        payload.enhancement
    )

    grounding_issues = (
        _validate_enhancement_against_local(
            enhancement=enhancement,
            local_analysis=local_analysis,
        )
    )

    validation = _merge_validation_warnings(
        validation=validation,
        grounding_issues=grounding_issues,
    )

    return GeminiServiceResult(
        validation=validation,
        enhancement=enhancement,
    )


def analyze_with_gemini(
    local_analysis: LocalAnalyzerResult,
) -> AnalyzerResult:
    """
    Return final AnalyzerResult by combining authoritative local analysis
    with Gemini validation/enhancement.

    The local analysis object itself is never replaced.
    """
    result = enhance_local_analysis(
        local_analysis
    )

    return AnalyzerResult(
        local_analysis=local_analysis,
        gemini_validation=result.validation,
        gemini_enhancement=result.enhancement,
    )


# ============================================================================
# Safe/Fallback API
# ============================================================================

def try_enhance_local_analysis(
    local_analysis: LocalAnalyzerResult,
) -> AnalyzerResult:
    """
    Production-safe wrapper.

    If Gemini is unavailable, the deterministic local analysis is still
    returned as the source of truth.

    Gemini fields remain None rather than fabricating AI output.
    """
    if local_analysis is None:
        raise ValueError(
            "local_analysis cannot be None."
        )

    if not _get_api_key():
        logger.warning(
            "Gemini API key is not configured. "
            "Returning local analysis only."
        )

        return AnalyzerResult(
            local_analysis=local_analysis,
            gemini_validation=None,
            gemini_enhancement=None,
        )

    try:
        return analyze_with_gemini(
            local_analysis
        )

    except GeminiServiceError:
        logger.exception(
            "Gemini enhancement failed. "
            "Falling back to local analysis."
        )

        return AnalyzerResult(
            local_analysis=local_analysis,
            gemini_validation=None,
            gemini_enhancement=None,
        )


# ============================================================================
# Prompt / Payload Diagnostics
# ============================================================================

def build_gemini_payload_preview(
    local_analysis: LocalAnalyzerResult,
) -> dict[str, Any]:
    """
    Return the exact structured local payload shape that would be sent to
    Gemini, without making an API request.

    Useful for debugging privacy boundaries.
    """
    return {
        "system_instruction": SYSTEM_INSTRUCTION,
        "model": _get_model(),
        "store": False,
        "response_format": {
            "type": "text",
            "mime_type": "application/json",
            "schema": _response_schema(),
        },
        "input": _build_user_prompt(
            local_analysis
        ),
    }


def count_candidate_factual_records(
    local_analysis: LocalAnalyzerResult,
) -> dict[str, int]:
    """
    Simple diagnostics showing how much structured information exists before
    the Gemini call.
    """
    return {
        "skills": len(
            local_analysis.skills
        ),
        "missing_skills": len(
            local_analysis.missing_skills
        ),
        "keyword_matches": len(
            local_analysis.keywords.keywords
        ),
        "strengths": len(
            local_analysis.strengths
        ),
        "improvements": len(
            local_analysis.improvements
        ),
        "experience_roles": len(
            local_analysis.experience.relevant_roles_found
        ),
        "experience_projects": len(
            local_analysis.experience.relevant_projects_found
        ),
        "experience_internships": len(
            local_analysis.experience.relevant_internships_found
        ),
        "ats_issues": len(
            local_analysis.ats.detected_issues
        ),
    }


# ============================================================================
# Validation
# ============================================================================

def validate_gemini_service_result(
    result: GeminiServiceResult,
) -> None:
    """
    Validate the service-level Gemini result.
    """
    if result is None:
        raise ValueError(
            "Gemini service result cannot be None."
        )

    if result.validation is None:
        raise ValueError(
            "Gemini validation is required."
        )

    if result.enhancement is None:
        raise ValueError(
            "Gemini enhancement is required."
        )

    if not result.validation.confidence:
        raise ValueError(
            "Gemini validation confidence cannot be empty."
        )

    if not result.validation.summary.strip():
        raise ValueError(
            "Gemini validation summary cannot be empty."
        )

    if not result.enhancement.summary.strip():
        raise ValueError(
            "Gemini enhancement summary cannot be empty."
        )