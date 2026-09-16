from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import Iterable, Sequence

from schemas.analyzer import (
    EducationMatch,
    EvidenceRecord,
    ExperienceMatch,
    GapPriority,
    Improvement,
    KeywordAnalysis,
    LocalAnalyzerResult,
    MissingSkill,
    ResumeStrength,
    ScoreBreakdown,
    SemanticAnalysis,
    SkillMatch,
    SkillStatus,
)
from services.education_matcher import match_education
from services.experience_matcher import match_experience
from services.jd_extractor import JDProfile, extract_jd_profile
from services.keyword_matcher import match_keywords
from services.resume_extractor import ResumeProfile, extract_resume_profile
from services.similarity_engine import calculate_semantic_similarity
from services.ats_scorer import score_ats
from services.skill_extractor import (
    DetectedSkill,
    detect_skills,
    get_skill_definition_by_name,
    normalize_skill_name,
)


# ============================================================================
# Configuration
# ============================================================================

SKILL_WEIGHT = 0.40
KEYWORD_WEIGHT = 0.20
EXPERIENCE_WEIGHT = 0.20
EDUCATION_WEIGHT = 0.10
SEMANTIC_WEIGHT = 0.10

MIN_SCORE = 0.0
MAX_SCORE = 100.0


# Evidence hierarchy:
#
# project implementation
# > experience/work implementation
# > internship implementation
# > detailed experience bullet
# > coursework
# > certification/training
# > skills section only
# > simple keyword mention
#
# These are engineering heuristics and should be benchmarked/tuned later.
EVIDENCE_STRENGTH = {
    "project": 95.0,
    "experience": 90.0,
    "internship": 85.0,
    "coursework": 65.0,
    "certification": 55.0,
    "course": 50.0,
    "skills_section": 40.0,
    "keyword": 30.0,
    "other": 20.0,
}


# Strong / partial / missing thresholds.
STRONG_SKILL_THRESHOLD = 75.0
PARTIAL_SKILL_THRESHOLD = 40.0


# Required skill matching receives more influence than preferred skills.
REQUIRED_SKILL_WEIGHT = 0.75
PREFERRED_SKILL_WEIGHT = 0.25


# Improvement thresholds.
HIGH_PRIORITY_GAP_THRESHOLD = 75.0
MEDIUM_PRIORITY_GAP_THRESHOLD = 50.0


# ============================================================================
# Internal Models
# ============================================================================

@dataclass(frozen=True)
class CandidateSkillEvidence:
    skill_id: str
    skill_name: str
    evidence: tuple[EvidenceRecord, ...]
    evidence_strength: float
    confidence: str
    mentioned: bool


@dataclass(frozen=True)
class JDSkillRequirement:
    skill_id: str
    skill_name: str
    required: bool
    source_text: str


@dataclass(frozen=True)
class SkillMatchCalculation:
    skill_id: str
    skill_name: str
    required_by_role: bool
    mentioned: bool
    evidence: tuple[EvidenceRecord, ...]
    evidence_strength: float
    confidence: str
    score: float
    status: SkillStatus


# ============================================================================
# Generic Helpers
# ============================================================================

def _safe_text(value: object) -> str:
    if value is None:
        return ""

    return str(value).strip()


def _get_attr(
    obj: object,
    name: str,
    default: object = None,
) -> object:
    return getattr(
        obj,
        name,
        default,
    )


def _normalize_text(value: str) -> str:
    if not value:
        return ""

    text = unicodedata.normalize(
        "NFKC",
        str(value),
    ).lower().strip()

    text = text.replace(
        "–",
        "-",
    ).replace(
        "—",
        "-",
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def _canonical_text(value: str) -> str:
    text = _normalize_text(value)

    if not text:
        return ""

    text = re.sub(
        r"[(),:;]+",
        " ",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def _unique_keep_order(
    values: Iterable[str],
) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []

    for value in values:
        normalized = _canonical_text(
            value
        )

        if not normalized or normalized in seen:
            continue

        seen.add(normalized)
        result.append(
            value.strip()
        )

    return result


def _clamp_score(
    value: float,
) -> float:
    return round(
        max(
            MIN_SCORE,
            min(
                MAX_SCORE,
                float(value),
            ),
        ),
        2,
    )


def _confidence_rank(
    confidence: str,
) -> int:
    return {
        "high": 3,
        "medium": 2,
        "low": 1,
    }.get(
        _normalize_text(confidence),
        1,
    )


def _strongest_confidence(
    values: Iterable[str],
) -> str:
    normalized_values = [
        _normalize_text(value)
        for value in values
        if value
    ]

    if not normalized_values:
        return "low"

    strongest = max(
        normalized_values,
        key=_confidence_rank,
    )

    return strongest


# ============================================================================
# Evidence Helpers
# ============================================================================

def _source_strength(
    source_type: str,
) -> float:
    normalized = _normalize_text(
        source_type
    )

    return EVIDENCE_STRENGTH.get(
        normalized,
        EVIDENCE_STRENGTH["other"],
    )


def _skill_section_name(
    evidence_item: object,
) -> str:
    return _safe_text(
        _get_attr(
            evidence_item,
            "section",
            _get_attr(
                evidence_item,
                "section_name",
                "",
            ),
        )
    )


def _build_evidence_record(
    evidence_item: object,
    default_source_type: str = "other",
) -> EvidenceRecord | None:
    text = _safe_text(
        _get_attr(
            evidence_item,
            "text",
            _get_attr(
                evidence_item,
                "evidence",
                _get_attr(
                    evidence_item,
                    "description",
                    "",
                ),
            ),
        )
    )

    if not text:
        return None

    source_type = _safe_text(
        _get_attr(
            evidence_item,
            "source_type",
            default_source_type,
        )
    ).lower()

    if source_type not in {
        "project",
        "experience",
        "internship",
        "education",
        "certification",
        "coursework",
        "skills_section",
        "keyword",
        "course",
        "other",
    }:
        source_type = default_source_type

    section = _skill_section_name(
        evidence_item
    )

    explicit_strength = _get_attr(
        evidence_item,
        "strength",
        None,
    )

    if isinstance(
        explicit_strength,
        (int, float),
    ):
        strength = _clamp_score(
            float(explicit_strength)
        )

    else:
        strength = _source_strength(
            source_type
        )

    explicit_confidence = _safe_text(
        _get_attr(
            evidence_item,
            "confidence",
            "",
        )
    ).lower()

    if explicit_confidence in {
        "high",
        "medium",
        "low",
    }:
        confidence = explicit_confidence

    else:
        if strength >= 80:
            confidence = "high"

        elif strength >= 50:
            confidence = "medium"

        else:
            confidence = "low"

    return EvidenceRecord(
        source_type=source_type,
        section=section or "unknown",
        text=text,
        strength=strength,
        confidence=confidence,
    )


def _evidence_from_skill(
    skill: object,
) -> tuple[EvidenceRecord, ...]:
    """
    Convert resume_extractor skill evidence into final schema records.
    """
    result: list[EvidenceRecord] = []

    evidence_items = _get_attr(
        skill,
        "evidence",
        [],
    ) or []

    for evidence_item in evidence_items:
        if isinstance(
            evidence_item,
            str,
        ):
            record = EvidenceRecord(
                source_type="skills_section",
                section="skills",
                text=evidence_item.strip(),
                strength=EVIDENCE_STRENGTH["skills_section"],
                confidence="medium",
            )

        else:
            record = _build_evidence_record(
                evidence_item,
                default_source_type="skills_section",
            )

        if record is not None:
            result.append(record)

    return tuple(result)


def _evidence_for_skill_from_resume(
    resume: ResumeProfile,
    target_skill_id: str,
    target_skill_name: str,
) -> CandidateSkillEvidence:
    """
    Search the structured resume profile for a target skill and all available
    evidence.
    """
    target_id = _canonical_text(
        target_skill_id
    )

    target_name = _canonical_text(
        target_skill_name
    )

    matched_records: list[EvidenceRecord] = []
    strongest_strength = 0.0

    skills = _get_attr(
        resume,
        "skills",
        [],
    ) or []

    mentioned = False
    confidence_values: list[str] = []

    for skill in skills:
        # ResumeSkillEvidence stores the canonical DetectedSkill under
        # ``skill.skill`` while keeping evidence on the wrapper object.
        # Support that structure as the primary contract, while remaining
        # backward-compatible with direct skill objects.
        skill_identity = _get_attr(
            skill,
            "skill",
            skill,
        )

        skill_name = _safe_text(
            _get_attr(
                skill_identity,
                "name",
                "",
            )
        )

        skill_id = _safe_text(
            _get_attr(
                skill_identity,
                "id",
                "",
            )
        )

        candidate_id = _canonical_text(
            skill_id
        )

        candidate_name = _canonical_text(
            normalize_skill_name(
                skill_name
            )
            if skill_name
            else ""
        )

        same_id = (
            bool(target_id)
            and bool(candidate_id)
            and target_id == candidate_id
        )

        same_name = (
            bool(target_name)
            and bool(candidate_name)
            and (
                target_name == candidate_name
                or target_name in candidate_name
                or candidate_name in target_name
            )
        )

        if not (
            same_id
            or same_name
        ):
            continue

        mentioned = True

        skill_records = _evidence_from_skill(
            skill
        )

        if skill_records:
            matched_records.extend(
                skill_records
            )

            strongest_strength = max(
                strongest_strength,
                max(
                    record.strength
                    for record in skill_records
                ),
            )

            confidence_values.extend(
                record.confidence
                for record in skill_records
            )

        else:
            # A skill can be mentioned in a skills section without a detailed
            # evidence object.
            fallback_record = EvidenceRecord(
                source_type="skills_section",
                section="skills",
                text=skill_name,
                strength=EVIDENCE_STRENGTH["skills_section"],
                confidence="medium",
            )

            matched_records.append(
                fallback_record
            )

            strongest_strength = max(
                strongest_strength,
                fallback_record.strength,
            )

            confidence_values.append(
                fallback_record.confidence
            )

    # Additional project / experience evidence can exist even if the skill
    # extractor did not attach all of it to the skill record.
    structured_sources = (
        (
            "projects",
            "project",
        ),
        (
            "experience",
            "experience",
        ),
        (
            "internships",
            "internship",
        ),
        (
            "education",
            "education",
        ),
        (
            "certifications",
            "certification",
        ),
    )

    for collection_name, source_type in structured_sources:
        items = _get_attr(
            resume,
            collection_name,
            [],
        ) or []

        for item in items:
            item_text = _structured_item_text(
                item
            )

            if not item_text:
                continue

            if not _skill_name_in_text(
                target_skill_name,
                item_text,
            ):
                continue

            record = EvidenceRecord(
                source_type=source_type,
                section=collection_name,
                text=_extract_target_skill_evidence(
                    target_skill_name,
                    item_text,
                ),
                strength=_source_strength(
                    source_type
                ),
                confidence=(
                    "high"
                    if source_type in {
                        "project",
                        "experience",
                    }
                    else "medium"
                ),
            )

            # Avoid duplicate evidence records.
            duplicate = any(
                _canonical_text(
                    existing.text
                )
                == _canonical_text(
                    record.text
                )
                and existing.source_type
                == record.source_type
                for existing in matched_records
            )

            if duplicate:
                continue

            matched_records.append(
                record
            )

            strongest_strength = max(
                strongest_strength,
                record.strength,
            )

            confidence_values.append(
                record.confidence
            )

    confidence = _strongest_confidence(
        confidence_values
    )

    if not matched_records and mentioned:
        strongest_strength = (
            EVIDENCE_STRENGTH["skills_section"]
        )
        confidence = "medium"

    return CandidateSkillEvidence(
        skill_id=target_skill_id,
        skill_name=target_skill_name,
        evidence=tuple(
            matched_records
        ),
        evidence_strength=_clamp_score(
            strongest_strength
        ),
        confidence=confidence,
        mentioned=mentioned,
    )


def _structured_item_text(
    item: object,
) -> str:
    if isinstance(
        item,
        str,
    ):
        return item.strip()

    parts: list[str] = []

    for field_name in (
        "name",
        "title",
        "role",
        "position",
        "company",
        "organization",
        "description",
        "degree",
        "field",
        "institution",
        "text",
    ):
        value = _safe_text(
            _get_attr(
                item,
                field_name,
                "",
            )
        )

        if value:
            parts.append(
                value
            )

    for field_name in (
        "bullets",
        "responsibilities",
        "technologies",
        "evidence",
    ):
        values = _get_attr(
            item,
            field_name,
            [],
        ) or []

        for value in values:
            if isinstance(
                value,
                str,
            ):
                if value.strip():
                    parts.append(
                        value.strip()
                    )
                continue

            nested_text = _safe_text(
                _get_attr(
                    value,
                    "text",
                    _get_attr(
                        value,
                        "name",
                        "",
                    ),
                )
            )

            if nested_text:
                parts.append(
                    nested_text
                )

    return "\n".join(
        part
        for part in parts
        if part
    )


def _skill_name_in_text(
    skill_name: str,
    text: str,
) -> bool:
    target = _canonical_text(
        skill_name
    )

    source = _canonical_text(
        text
    )

    if not target or not source:
        return False

    # Direct phrase.
    if target in source:
        return True

    # Common technical aliases.
    aliases = {
        "machine learning": (
            "machine learning",
            "ml",
        ),
        "artificial intelligence": (
            "artificial intelligence",
            "ai",
        ),
        "scikit learn": (
            "scikit learn",
            "scikit-learn",
            "sklearn",
        ),
        "natural language processing": (
            "natural language processing",
            "nlp",
        ),
        "object oriented programming": (
            "object oriented programming",
            "oop",
            "object-oriented programming",
        ),
        "database management system": (
            "database management system",
            "dbms",
        ),
    }

    candidates = aliases.get(
        target,
        (),
    )

    for candidate in candidates:
        if _canonical_text(
            candidate
        ) in source:
            return True

    return False


def _extract_target_skill_evidence(
    skill_name: str,
    text: str,
) -> str:
    """
    Keep evidence readable rather than returning the entire potentially large
    project/experience record.
    """
    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    matching_lines = [
        line
        for line in lines
        if _skill_name_in_text(
            skill_name,
            line,
        )
    ]

    if matching_lines:
        return " ".join(
            matching_lines[:2]
        )

    return text[:500]


# ============================================================================
# JD Skill Extraction
# ============================================================================

def _jd_skill_requirements(
    jd: JDProfile,
) -> list[JDSkillRequirement]:
    """
    Build normalized JD skill requirements from the parsed JD profile.

    Supports the current JD extractor and remains defensive around minor
    internal field-name differences.
    """
    raw_skills = _get_attr(
        jd,
        "skills",
        _get_attr(
            jd,
            "skill_requirements",
            [],
        ),
    ) or []

    result: list[JDSkillRequirement] = []

    for item in raw_skills:
        if isinstance(
            item,
            str,
        ):
            skill_name = item.strip()
            required = True
            source_text = item.strip()

        else:
            skill_name = ""

            for field_name in (
                "name",
                "skill",
                "skill_name",
                "keyword",
                "text",
            ):
                value = _safe_text(
                    _get_attr(
                        item,
                        field_name,
                        "",
                    )
                )

                if value:
                    skill_name = value
                    break

            source_text = _safe_text(
                _get_attr(
                    item,
                    "text",
                    _get_attr(
                        item,
                        "description",
                        skill_name,
                    ),
                )
            )

            required_value = _get_attr(
                item,
                "required_by_role",
                _get_attr(
                    item,
                    "required",
                    None,
                ),
            )

            if isinstance(
                required_value,
                bool,
            ):
                required = required_value

            else:
                importance = _normalize_text(
                    _safe_text(
                        _get_attr(
                            item,
                            "importance",
                            _get_attr(
                                item,
                                "priority",
                                "",
                            ),
                        )
                    )
                )

                required = importance not in {
                    "preferred",
                    "medium",
                    "optional",
                    "nice to have",
                    "nice-to-have",
                    "bonus",
                    "desired",
                }

        if not skill_name:
            continue

        # Normalize through the local skill vocabulary when possible.
        skill_definition = get_skill_definition_by_name(
            skill_name
        )

        if skill_definition is not None:
            normalized_name = _safe_text(
                _get_attr(
                    skill_definition,
                    "name",
                    skill_name,
                )
            )

            skill_id = _safe_text(
                _get_attr(
                    skill_definition,
                    "id",
                    "",
                )
            )

        else:
            normalized_name = skill_name
            skill_id = _canonical_text(
                skill_name
            ).replace(
                " ",
                "_",
            )

        result.append(
            JDSkillRequirement(
                skill_id=skill_id,
                skill_name=normalized_name,
                required=required,
                source_text=source_text or skill_name,
            )
        )

    # Fallback: detect skills directly from full JD text.
    if not result:
        raw_text = _safe_text(
            _get_attr(
                jd,
                "raw_text",
                "",
            )
        )

        if raw_text:
            detected = detect_skills(
                raw_text
            )

            for skill in detected:
                skill_name = _safe_text(
                    _get_attr(
                        skill,
                        "name",
                        "",
                    )
                )

                skill_id = _safe_text(
                    _get_attr(
                        skill,
                        "id",
                        "",
                    )
                )

                if not skill_name:
                    continue

                result.append(
                    JDSkillRequirement(
                        skill_id=skill_id,
                        skill_name=skill_name,
                        required=True,
                        source_text=skill_name,
                    )
                )

    # Deduplicate while preserving required status if any occurrence is
    # required.
    merged: dict[str, JDSkillRequirement] = {}

    for item in result:
        key = _canonical_text(
            item.skill_id
            or item.skill_name
        )

        if not key:
            continue

        current = merged.get(
            key
        )

        if current is None:
            merged[key] = item
            continue

        merged[key] = JDSkillRequirement(
            skill_id=current.skill_id or item.skill_id,
            skill_name=current.skill_name or item.skill_name,
            required=(
                current.required
                or item.required
            ),
            source_text=(
                current.source_text
                if current.source_text
                else item.source_text
            ),
        )

    return list(
        merged.values()
    )


# ============================================================================
# Skill Scoring
# ============================================================================

def _skill_score_from_evidence(
    *,
    mentioned: bool,
    evidence_strength: float,
    evidence: Sequence[EvidenceRecord],
) -> float:
    """
    Convert evidence into a deterministic skill score.

    A simple keyword mention is intentionally low.
    Practical project/experience evidence is substantially stronger.
    """
    if not mentioned:
        return 0.0

    if not evidence:
        return 35.0

    weighted_evidence: list[float] = []

    source_bonus = {
        "project": 10.0,
        "experience": 8.0,
        "internship": 6.0,
        "coursework": 2.0,
        "certification": 1.0,
        "course": 1.0,
        "skills_section": 0.0,
        "keyword": 0.0,
        "education": 1.0,
        "other": 0.0,
    }

    for record in evidence:
        base = float(
            record.strength
        )

        bonus = source_bonus.get(
            record.source_type,
            0.0,
        )

        weighted_evidence.append(
            min(
                100.0,
                base + bonus,
            )
        )

    strongest = max(
        weighted_evidence
    )

    # Multiple independent evidence records provide extra support, but are
    # deliberately capped so repeated wording cannot inflate the score.
    evidence_count_bonus = min(
        10.0,
        max(
            0,
            len(evidence) - 1,
        ) * 2.5,
    )

    return _clamp_score(
        strongest
        + evidence_count_bonus
    )


def _skill_status(
    score: float,
) -> SkillStatus:
    if score >= STRONG_SKILL_THRESHOLD:
        return "strong"

    if score >= PARTIAL_SKILL_THRESHOLD:
        return "partial"

    return "missing"


def _skill_confidence(
    evidence: Sequence[EvidenceRecord],
    score: float,
) -> str:
    if not evidence:
        return "low"

    evidence_confidence = max(
        (
            record.confidence
            for record in evidence
        ),
        key=_confidence_rank,
        default="low",
    )

    if (
        score >= STRONG_SKILL_THRESHOLD
        and evidence_confidence == "high"
    ):
        return "high"

    if score >= PARTIAL_SKILL_THRESHOLD:
        return "medium"

    return "low"


def _calculate_skill_match(
    requirement: JDSkillRequirement,
    candidate: CandidateSkillEvidence,
) -> SkillMatchCalculation:
    score = _skill_score_from_evidence(
        mentioned=candidate.mentioned,
        evidence_strength=candidate.evidence_strength,
        evidence=candidate.evidence,
    )

    status = _skill_status(
        score
    )

    confidence = _skill_confidence(
        candidate.evidence,
        score,
    )

    return SkillMatchCalculation(
        skill_id=requirement.skill_id,
        skill_name=requirement.skill_name,
        required_by_role=requirement.required,
        mentioned=candidate.mentioned,
        evidence=candidate.evidence,
        evidence_strength=candidate.evidence_strength,
        confidence=confidence,
        score=score,
        status=status,
    )


# ============================================================================
# Skill Match Analysis
# ============================================================================

def _build_skill_matches(
    resume: ResumeProfile,
    jd: JDProfile,
) -> list[SkillMatchCalculation]:
    requirements = _jd_skill_requirements(
        jd
    )

    results: list[SkillMatchCalculation] = []

    for requirement in requirements:
        candidate = _evidence_for_skill_from_resume(
            resume=resume,
            target_skill_id=requirement.skill_id,
            target_skill_name=requirement.skill_name,
        )

        calculation = _calculate_skill_match(
            requirement=requirement,
            candidate=candidate,
        )

        results.append(
            calculation
        )

    return results


def _skill_match_score(
    matches: Sequence[SkillMatchCalculation],
) -> float:
    if not matches:
        return 0.0

    required = [
        item
        for item in matches
        if item.required_by_role
    ]

    preferred = [
        item
        for item in matches
        if not item.required_by_role
    ]

    required_score = (
        sum(
            item.score
            for item in required
        )
        / len(required)
        if required
        else 100.0
    )

    preferred_score = (
        sum(
            item.score
            for item in preferred
        )
        / len(preferred)
        if preferred
        else 100.0
    )

    if required and preferred:
        return _clamp_score(
            required_score
            * REQUIRED_SKILL_WEIGHT
            + preferred_score
            * PREFERRED_SKILL_WEIGHT
        )

    if required:
        return _clamp_score(
            required_score
        )

    return _clamp_score(
        preferred_score
    )


# ============================================================================
# Missing Skills
# ============================================================================

def _gap_importance(
    match: SkillMatchCalculation,
) -> GapPriority:
    """
    Convert skill mismatch into a useful action priority.

    High priority means the requirement is required by the role and has
    no reliable resume support.

    Partial evidence is actionable, but it is not equivalent to a missing
    skill. It receives medium priority so the UI can distinguish "prove it"
    from "add/build it".
    """
    if match.required_by_role:
        if match.status == "missing":
            return "high"

        if match.status == "partial":
            return "medium"

        return "low"

    if match.status == "missing":
        return "medium"

    if match.status == "partial":
        return "low"

    return "low"


def _skill_gap_reason(
    match: SkillMatchCalculation,
) -> str:
    if match.status == "missing":
        return (
            f"{match.skill_name} is required or relevant to the target role, "
            "but no reliable resume evidence was found."
        )

    if match.status == "partial":
        if match.evidence:
            strongest_source = max(
                match.evidence,
                key=lambda item: item.strength,
            )

            return (
                f"{match.skill_name} is mentioned or partially supported, "
                f"but the strongest available evidence is "
                f"{strongest_source.source_type}, so practical depth is not "
                "fully demonstrated."
            )

        return (
            f"{match.skill_name} appears in the resume but does not have "
            "enough supporting evidence for a strong match."
        )

    return (
        f"{match.skill_name} has strong supporting evidence in the resume."
    )


def _skill_gap_action(
    match: SkillMatchCalculation,
) -> str:
    if match.status == "missing":
        if match.required_by_role:
            return (
                f"Add practical evidence for {match.skill_name} through a "
                "relevant project or demonstrated work before presenting it "
                "as a core strength."
            )

        return (
            f"Build or document practical exposure to {match.skill_name} "
            "if it is relevant to the target role."
        )

    if match.status == "partial":
        return (
            f"Strengthen {match.skill_name} evidence with a concrete project, "
            "internship task, measurable implementation, or detailed resume bullet."
        )

    return (
        f"Keep the existing {match.skill_name} evidence clear and specific."
    )


def _build_missing_skills(
    matches: Sequence[SkillMatchCalculation],
) -> list[MissingSkill]:
    result: list[MissingSkill] = []

    for match in matches:
        if match.status == "strong":
            continue

        priority = _gap_importance(
            match
        )

        # The schema allows low-priority gaps too, but the analyzer UI can
        # choose whether to show them.
        evidence_summary = None

        if match.evidence:
            evidence_summary = (
                "Evidence found: "
                + "; ".join(
                    f"{item.source_type}: {item.text}"
                    for item in match.evidence[:3]
                )
            )

        result.append(
            MissingSkill(
                id=match.skill_id,
                name=match.skill_name,
                importance=priority,
                reason=_skill_gap_reason(
                    match
                ),
                action=_skill_gap_action(
                    match
                ),
                evidence_summary=evidence_summary,
            )
        )

    priority_order = {
        "high": 0,
        "medium": 1,
        "low": 2,
    }

    result.sort(
        key=lambda item: (
            priority_order.get(
                item.importance,
                3,
            ),
            item.name.lower(),
        )
    )

    return result


# ============================================================================
# Strengths
# ============================================================================

def _strength_description(
    match: SkillMatchCalculation,
) -> str:
    evidence_sources = _unique_keep_order(
        item.source_type
        for item in match.evidence
    )

    if evidence_sources:
        source_text = ", ".join(
            evidence_sources
        )

        return (
            f"{match.skill_name} is supported by {source_text} evidence, "
            f"with a local skill score of {match.score:.0f}/100."
        )

    return (
        f"{match.skill_name} is strongly represented in the resume "
        f"with a local skill score of {match.score:.0f}/100."
    )


def _strength_evidence_text(
    match: SkillMatchCalculation,
) -> str:
    if match.evidence:
        strongest = max(
            match.evidence,
            key=lambda item: item.strength,
        )

        return (
            f"{strongest.source_type}: "
            f"{strongest.text}"
        )

    return (
        f"{match.skill_name} is explicitly listed in the resume."
    )


def _build_resume_strengths(
    matches: Sequence[SkillMatchCalculation],
) -> list[ResumeStrength]:
    result: list[ResumeStrength] = []

    strong_matches = [
        match
        for match in matches
        if match.status == "strong"
    ]

    # Prioritize stronger evidence over just raw score.
    strong_matches.sort(
        key=lambda item: (
            item.evidence_strength,
            item.score,
        ),
        reverse=True,
    )

    for index, match in enumerate(
        strong_matches[:6],
        start=1,
    ):
        result.append(
            ResumeStrength(
                id=f"strength-{index}",
                title=f"Strong {match.skill_name} alignment",
                description=_strength_description(
                    match
                ),
                evidence=_strength_evidence_text(
                    match
                ),
                confidence=match.confidence,
            )
        )

    return result


# ============================================================================
# Improvements
# ============================================================================

def _improvement_for_gap(
    gap: MissingSkill,
    index: int,
) -> Improvement:
    return Improvement(
        id=f"improvement-{index}",
        title=f"Strengthen {gap.name}",
        priority=gap.importance,
        problem=gap.reason,
        why_it_matters=(
            "This can affect how clearly your resume demonstrates "
            "alignment with the target role."
        ),
        action=gap.action,
    )


def _build_improvements(
    missing_skills: Sequence[MissingSkill],
    ats_issues: Sequence[str],
) -> list[Improvement]:
    result: list[Improvement] = []

    # Skill improvements first.
    for gap in missing_skills:
        if gap.importance == "low":
            continue

        result.append(
            _improvement_for_gap(
                gap,
                len(result) + 1,
            )
        )

    # Add ATS improvements only when there are actual detected issues.
    for issue in ats_issues:
        normalized = _normalize_text(
            issue
        )

        if (
            "section" in normalized
            or "heading" in normalized
        ):
            title = "Improve resume section structure"

        elif (
            "keyword" in normalized
            or "terminology" in normalized
        ):
            title = "Improve keyword coverage"

        elif (
            "format" in normalized
            or "punctuation" in normalized
            or "table" in normalized
        ):
            title = "Simplify resume formatting"

        else:
            title = "Improve resume organization"

        duplicate = any(
            _canonical_text(
                item.title
            )
            == _canonical_text(
                title
            )
            for item in result
        )

        if duplicate:
            continue

        result.append(
            Improvement(
                id=f"improvement-{len(result) + 1}",
                title=title,
                priority="medium",
                problem=issue,
                why_it_matters=(
                    "Clear, machine-readable resume structure can help "
                    "ATS systems interpret the document more reliably."
                ),
                action=(
                    "Apply a clean structure with recognizable sections, "
                    "readable terminology, and simple formatting."
                ),
            )
        )

    priority_rank = {
        "high": 0,
        "medium": 1,
        "low": 2,
    }

    result.sort(
        key=lambda item: (
            priority_rank.get(
                item.priority,
                3,
            ),
            item.title.lower(),
        )
    )

    return result[:8]


# ============================================================================
# Next Steps
# ============================================================================

def _build_next_step_labels(
    role: str,
    missing_skills: Sequence[MissingSkill],
    improvements: Sequence[Improvement],
) -> list[str]:
    steps: list[str] = []

    high_priority_skills = [
        gap.name
        for gap in missing_skills
        if gap.importance == "high"
    ]

    if high_priority_skills:
        steps.append(
            "Strengthen: "
            + ", ".join(
                high_priority_skills[:3]
            )
        )

    if improvements:
        steps.append(
            "Improve the highest-priority resume evidence and clarity."
        )

    if role:
        steps.append(
            f"Tailor the resume specifically for {role}."
        )

    if not steps:
        steps.append(
            "Keep building role-relevant evidence and maintain a clear resume structure."
        )

    return steps[:4]


# ============================================================================
# Overall Score
# ============================================================================

def _calculate_overall_score(
    skill_score: float,
    keyword_score: float,
    experience_score: float,
    education_score: float,
    semantic_score: float,
) -> float:
    """
    Deterministic overall role-fit score.

    Initial engineering weights:
        Skill Match       40%
        Keyword Match     20%
        Experience Match  20%
        Education Match   10%
        Semantic Match    10%

    These values are starting weights and should be benchmarked/tuned later.
    """
    return _clamp_score(
        skill_score * SKILL_WEIGHT
        + keyword_score * KEYWORD_WEIGHT
        + experience_score * EXPERIENCE_WEIGHT
        + education_score * EDUCATION_WEIGHT
        + semantic_score * SEMANTIC_WEIGHT
    )


def _build_score_breakdown(
    skill_score: float,
    keyword_score: float,
    experience_score: float,
    education_score: float,
    semantic_score: float,
) -> ScoreBreakdown:
    overall = _calculate_overall_score(
        skill_score=skill_score,
        keyword_score=keyword_score,
        experience_score=experience_score,
        education_score=education_score,
        semantic_score=semantic_score,
    )

    # ScoreBreakdown currently stores score values as integers.
    # Keep the deterministic calculation above at full float precision,
    # then normalize values only at the Pydantic model boundary.
    return ScoreBreakdown(
        skill_match_score=int(
            round(
                _clamp_score(
                    skill_score
                )
            )
        ),
        keyword_match_score=int(
            round(
                _clamp_score(
                    keyword_score
                )
            )
        ),
        experience_match_score=int(
            round(
                _clamp_score(
                    experience_score
                )
            )
        ),
        education_match_score=int(
            round(
                _clamp_score(
                    education_score
                )
            )
        ),
        semantic_similarity_score=int(
            round(
                _clamp_score(
                    semantic_score
                )
            )
        ),
        overall_match_score=int(
            round(
                _clamp_score(
                    overall
                )
            )
        ),
        skill_weight=SKILL_WEIGHT,
        keyword_weight=KEYWORD_WEIGHT,
        experience_weight=EXPERIENCE_WEIGHT,
        education_weight=EDUCATION_WEIGHT,
        semantic_weight=SEMANTIC_WEIGHT,
    )


# ============================================================================
# Evidence / Consistency Checks
# ============================================================================

def _validate_skill_consistency(
    matches: Sequence[SkillMatchCalculation],
    missing_skills: Sequence[MissingSkill],
) -> None:
    """
    Enforce the core skill consistency rules.
    """
    missing_ids = {
        _canonical_text(
            gap.id
        )
        for gap in missing_skills
    }

    for match in matches:
        # This validator is used with both the internal SkillMatchCalculation
        # objects and the final Pydantic SkillMatch objects.
        #
        # Internal object: skill_id / skill_name
        # Final schema:     id / name
        match_id = _canonical_text(
            _safe_text(
                getattr(
                    match,
                    "skill_id",
                    getattr(
                        match,
                        "id",
                        "",
                    ),
                )
            )
        )

        match_name = _safe_text(
            getattr(
                match,
                "skill_name",
                getattr(
                    match,
                    "name",
                    "unknown skill",
                ),
            )
        )

        if match.status == "strong":
            if match_id in missing_ids:
                raise ValueError(
                    "Strong skill cannot appear as a missing skill: "
                    f"{match_name}"
                )

        if match.status in {
            "partial",
            "missing",
        }:
            if match_id not in missing_ids:
                raise ValueError(
                    "Partial/missing skill must have a MissingSkill record: "
                    f"{match_name}"
                )

        # A skill classified as "missing" may still have weak evidence.
        # "Missing" means the available evidence is not sufficient to support
        # even a partial practical match; it does not mean that the skill was
        # completely absent from the resume.


def _validate_score_integrity(
    score_breakdown: ScoreBreakdown,
) -> None:
    calculated = int(
        round(
            _calculate_overall_score(
                skill_score=score_breakdown.skill_match_score,
                keyword_score=score_breakdown.keyword_match_score,
                experience_score=score_breakdown.experience_match_score,
                education_score=score_breakdown.education_match_score,
                semantic_score=score_breakdown.semantic_similarity_score,
            )
        )
    )

    if calculated != score_breakdown.overall_match_score:
        raise ValueError(
            "Overall match score is inconsistent with score breakdown."
        )


def _validate_analysis_contract(
    analysis: LocalAnalyzerResult,
) -> None:
    """
    Final local-analysis validation before the result is allowed to leave
    the backend.
    """
    _validate_score_integrity(
        analysis.score_breakdown
    )

    _validate_skill_consistency(
        analysis.skills,
        analysis.missing_skills,
    )

    if not 0 <= analysis.ats.score <= 100:
        raise ValueError(
            "ATS score must be between 0 and 100."
        )

    if not 0 <= analysis.semantic.score <= 100:
        raise ValueError(
            "Semantic score must be between 0 and 100."
        )

    if not 0 <= analysis.semantic.similarity_value <= 1:
        raise ValueError(
            "Semantic similarity value must be between 0 and 1."
        )


# ============================================================================
# Profile Summaries
# ============================================================================

def _extract_role_from_jd(
    jd: JDProfile,
) -> str:
    for field_name in (
        "job_title",
        "role",
        "title",
        "position",
    ):
        value = _safe_text(
            _get_attr(
                jd,
                field_name,
                "",
            )
        )

        if value:
            return value

    return "Target role"


def _normalize_role_for_display(
    role: str,
) -> str:
    """
    Keep the role label clean and presentation-safe.

    Defensive cleanup is applied here as a final boundary check so stale
    JD extraction data cannot leak metadata such as "Location: ..." into
    the displayed role.
    """
    role = _safe_text(role)

    if not role:
        return "Target role"

    role = re.split(
        r"\s*(?:\||\n)\s*(?=(?:location|job\s*type|employment\s*type|experience|salary|department|remote|work\s*mode)\s*:)",
        role,
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0]

    role = re.sub(
        r"\s+(?=Location\s*:)",
        "",
        role,
        flags=re.IGNORECASE,
    )

    role = re.sub(
        r"\s+(?=Job\s*Type\s*:)",
        "",
        role,
        flags=re.IGNORECASE,
    )

    role = role.strip(" -|,;:")

    # A source-code line is never a valid displayed job title.
    lowered = role.casefold()
    if lowered.startswith(
        "from __future__ import"
    ) or lowered.startswith(
        "import "
    ) or lowered.startswith(
        "def "
    ) or lowered.startswith(
        "class "
    ):
        return "Target role"

    return role or "Target role"


# ============================================================================
# Main Analysis
# ============================================================================

def analyze_local_profiles(
    resume: ResumeProfile,
    jd: JDProfile,
) -> LocalAnalyzerResult:
    """
    Run the complete deterministic local analyzer.

    This function is the main source-of-truth layer before Gemini.
    """
    role = _normalize_role_for_display(
        _extract_role_from_jd(
            jd
        )
    )

    # ------------------------------------------------------------------------
    # 1. Skill analysis
    # ------------------------------------------------------------------------

    skill_calculations = _build_skill_matches(
        resume=resume,
        jd=jd,
    )

    skill_score = _skill_match_score(
        skill_calculations
    )

    skill_results = [
        SkillMatch(
            id=match.skill_id,
            name=match.skill_name,
            mentioned=match.mentioned,
            required_by_role=match.required_by_role,
            evidence_found=bool(
                match.evidence
            ),
            evidence=list(
                match.evidence
            ),
            evidence_strength=match.evidence_strength,
            confidence=match.confidence,
            score=int(round(match.score)),
            status=match.status,
        )
        for match in skill_calculations
    ]

    missing_skills = _build_missing_skills(
        skill_calculations
    )

    _validate_skill_consistency(
        skill_calculations,
        missing_skills,
    )

    # ------------------------------------------------------------------------
    # 2. Keyword analysis
    # ------------------------------------------------------------------------

    keyword_analysis = match_keywords(
        resume=resume,
        jd=jd,
    )

    # ------------------------------------------------------------------------
    # 3. Experience analysis
    # ------------------------------------------------------------------------

    experience_analysis = match_experience(
        resume=resume,
        jd=jd,
    )

    # ------------------------------------------------------------------------
    # 4. Education analysis
    # ------------------------------------------------------------------------

    education_analysis = match_education(
        resume=resume,
        jd=jd,
    )

    # ------------------------------------------------------------------------
    # 5. TF-IDF / cosine similarity
    # ------------------------------------------------------------------------

    semantic_analysis = calculate_semantic_similarity(
        resume=resume,
        jd=jd,
    )

    # ------------------------------------------------------------------------
    # 6. ATS
    # ------------------------------------------------------------------------

    ats_analysis = score_ats(
        resume=resume,
        jd=jd,
    )

    # ------------------------------------------------------------------------
    # 7. Overall deterministic score
    # ------------------------------------------------------------------------

    score_breakdown = _build_score_breakdown(
        skill_score=skill_score,
        keyword_score=keyword_analysis.score,
        experience_score=experience_analysis.score,
        education_score=education_analysis.score,
        semantic_score=semantic_analysis.score,
    )

    # ------------------------------------------------------------------------
    # 8. Strengths
    # ------------------------------------------------------------------------

    strengths = _build_resume_strengths(
        skill_calculations
    )

    # ------------------------------------------------------------------------
    # 9. Improvements
    # ------------------------------------------------------------------------

    improvements = _build_improvements(
        missing_skills=missing_skills,
        ats_issues=ats_analysis.detected_issues,
    )

    # ------------------------------------------------------------------------
    # 10. Final object
    # ------------------------------------------------------------------------

    result = LocalAnalyzerResult(
        role=role,
        score_breakdown=score_breakdown,
        ats=ats_analysis,
        skills=skill_results,
        missing_skills=missing_skills,
        keywords=keyword_analysis,
        semantic=semantic_analysis,
        experience=experience_analysis,
        education=education_analysis,
        strengths=strengths,
        improvements=improvements,
    )

    _validate_analysis_contract(
        result
    )

    return result


# ============================================================================
# Main Text/File-Level API
# ============================================================================

def analyze_local(
    resume_text: str,
    job_description: str,
    *,
    resume_filename: str = "resume.pdf",
) -> LocalAnalyzerResult:
    """
    Run the complete local analyzer from already extracted text.

    Useful for unit tests and local development.
    """
    resume_profile = extract_resume_profile(
        resume_text
    )

    jd_profile = extract_jd_profile(
        job_description
    )

    return analyze_local_profiles(
        resume=resume_profile,
        jd=jd_profile,
    )


# ============================================================================
# Raw Document-Level API
# ============================================================================

def analyze_local_document(
    resume_bytes: bytes,
    resume_filename: str,
    job_description: str,
    *,
    content_type: str | None = None,
) -> LocalAnalyzerResult:
    """
    Analyze a resume document locally.

    document_parser.py owns document-to-text conversion.
    This function owns everything after extraction.
    """
    from services.document_parser import extract_document_text

    resume_text = extract_document_text(
        file_bytes=resume_bytes,
        filename=resume_filename,
        content_type=content_type,
    )

    return analyze_local(
        resume_text=resume_text,
        job_description=job_description,
        resume_filename=resume_filename,
    )


# ============================================================================
# Analysis Summary Helpers
# ============================================================================

def get_analysis_summary(
    analysis: LocalAnalyzerResult,
) -> dict[str, object]:
    """
    Return compact diagnostic information without exposing the full internal
    structures.
    """
    strong_count = sum(
        1
        for skill in analysis.skills
        if skill.status == "strong"
    )

    partial_count = sum(
        1
        for skill in analysis.skills
        if skill.status == "partial"
    )

    missing_count = sum(
        1
        for skill in analysis.skills
        if skill.status == "missing"
    )

    return {
        "role": analysis.role,
        "overall_match_score": analysis.score_breakdown.overall_match_score,
        "skill_match_score": analysis.score_breakdown.skill_match_score,
        "keyword_match_score": analysis.score_breakdown.keyword_match_score,
        "experience_match_score": analysis.score_breakdown.experience_match_score,
        "education_match_score": analysis.score_breakdown.education_match_score,
        "semantic_similarity_score": analysis.score_breakdown.semantic_similarity_score,
        "ats_score": analysis.ats.score,
        "strong_skills": strong_count,
        "partial_skills": partial_count,
        "missing_skills": missing_count,
        "required_keywords": analysis.keywords.required_keywords,
        "matched_required_keywords": analysis.keywords.matched_required_keywords,
        "semantic_method": analysis.semantic.method,
        "semantic_confidence": analysis.semantic.confidence,
    }


def get_high_priority_gaps(
    analysis: LocalAnalyzerResult,
) -> list[MissingSkill]:
    return [
        gap
        for gap in analysis.missing_skills
        if gap.importance == "high"
    ]


def get_actionable_improvements(
    analysis: LocalAnalyzerResult,
) -> list[Improvement]:
    return [
        improvement
        for improvement in analysis.improvements
        if improvement.priority in {
            "high",
            "medium",
        }
    ]


# ============================================================================
# Explanation Helpers
# ============================================================================

def _score_label(
    score: float,
) -> str:
    if score >= 85:
        return "excellent"

    if score >= 70:
        return "strong"

    if score >= 55:
        return "moderate"

    if score >= 40:
        return "partial"

    return "limited"


def build_local_explanation(
    analysis: LocalAnalyzerResult,
) -> str:
    """
    Generate a deterministic high-level explanation.

    Gemini will later be allowed to improve presentation, but this local
    explanation remains grounded in local scores.
    """
    score = analysis.score_breakdown.overall_match_score

    label = _score_label(
        score
    )

    strong_count = sum(
        1
        for skill in analysis.skills
        if skill.status == "strong"
    )

    partial_count = sum(
        1
        for skill in analysis.skills
        if skill.status == "partial"
    )

    missing_count = sum(
        1
        for skill in analysis.skills
        if skill.status == "missing"
    )

    return (
        f"The resume shows a {label} local fit for {analysis.role}, "
        f"with an overall deterministic match score of {score:.1f}/100. "
        f"The skill analysis found {strong_count} strong, "
        f"{partial_count} partial, and {missing_count} missing skill signals. "
        f"Keyword match is {analysis.score_breakdown.keyword_match_score:.1f}, "
        f"experience match is {analysis.score_breakdown.experience_match_score:.1f}, "
        f"education match is {analysis.score_breakdown.education_match_score:.1f}, "
        f"semantic similarity is "
        f"{analysis.score_breakdown.semantic_similarity_score:.1f}, "
        f"and ATS readiness is {analysis.ats.score:.1f}/100."
    )


# ============================================================================
# Benchmarking Helpers
# ============================================================================

def compare_component_contributions(
    analysis: LocalAnalyzerResult,
) -> dict[str, float]:
    """
    Show how much each weighted component contributes to the final score.

    Useful during later benchmark/tuning work.
    """
    breakdown = analysis.score_breakdown

    return {
        "skill_match_contribution": round(
            breakdown.skill_match_score
            * breakdown.skill_weight,
            2,
        ),
        "keyword_match_contribution": round(
            breakdown.keyword_match_score
            * breakdown.keyword_weight,
            2,
        ),
        "experience_match_contribution": round(
            breakdown.experience_match_score
            * breakdown.experience_weight,
            2,
        ),
        "education_match_contribution": round(
            breakdown.education_match_score
            * breakdown.education_weight,
            2,
        ),
        "semantic_similarity_contribution": round(
            breakdown.semantic_similarity_score
            * breakdown.semantic_weight,
            2,
        ),
        "overall_match_score": breakdown.overall_match_score,
    }


def validate_local_analyzer_result(
    analysis: LocalAnalyzerResult,
) -> None:
    """
    Public validation entry point.

    Call this before passing local analysis to Gemini.
    """
    _validate_analysis_contract(
        analysis
    )