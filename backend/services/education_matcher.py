from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import Iterable, Sequence

from schemas.analyzer import EducationMatch
from services.jd_extractor import JDProfile
from services.resume_extractor import ResumeProfile


# ============================================================================
# Internal Models
# ============================================================================

@dataclass(frozen=True)
class EducationRequirement:
    text: str
    degree_level: str | None
    fields: tuple[str, ...]
    required: bool


@dataclass(frozen=True)
class EducationEvidence:
    degree: str
    field: str
    institution: str
    text: str
    level: str | None
    relevance_score: float


# ============================================================================
# Normalization
# ============================================================================

def normalize_education_text(
    value: str,
) -> str:
    """
    Normalize education-related text for deterministic matching.
    """
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

    # Common degree punctuation normalization.
    text = text.replace(
        "&",
        " and ",
    )

    # Normalize separators.
    text = re.sub(
        r"[/|]+",
        " ",
        text,
    )

    text = re.sub(
        r"[_]+",
        " ",
        text,
    )

    # Normalize hyphen spacing.
    text = re.sub(
        r"\s*-\s*",
        "-",
        text,
    )

    # Collapse whitespace.
    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def canonical_education_text(
    value: str,
) -> str:
    """
    Return a stable canonical representation.
    """
    text = normalize_education_text(
        value
    )

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


def _safe_text(
    value: object,
) -> str:
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


def _unique_keep_order(
    values: Iterable[str],
) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []

    for value in values:
        normalized = canonical_education_text(
            value
        )

        if (
            not normalized
            or normalized in seen
        ):
            continue

        seen.add(
            normalized
        )

        result.append(
            value.strip()
        )

    return result


# ============================================================================
# Degree Level Detection
# ============================================================================

DEGREE_LEVEL_ALIASES: dict[str, set[str]] = {
    "doctorate": {
        "phd",
        "ph.d",
        "doctorate",
        "doctoral",
        "doctor of philosophy",
        "doctor of engineering",
        "d.sc",
    },
    "masters": {
        "masters",
        "master",
        "m.tech",
        "mtech",
        "m.e",
        "me",
        "m.s",
        "ms",
        "m.sc",
        "msc",
        "mba",
        "mca",
        "ma",
        "m.com",
        "mcom",
    },
    "bachelors": {
        "bachelors",
        "bachelor",
        "b.tech",
        "btech",
        "b.e",
        "be",
        "b.s",
        "bs",
        "b.sc",
        "bsc",
        "bca",
        "bba",
        "b.com",
        "bcom",
        "ba",
        "bachelor of engineering",
        "bachelor of technology",
        "bachelor of science",
        "bachelor of computer applications",
    },
    "diploma": {
        "diploma",
        "polytechnic",
        "advanced diploma",
    },
    "higher_secondary": {
        "12th",
        "class 12",
        "higher secondary",
        "higher-secondary",
        "senior secondary",
        "hsc",
        "intermediate",
    },
    "secondary": {
        "10th",
        "class 10",
        "secondary",
        "ssc",
        "matriculation",
        "matric",
    },
}


def detect_degree_level(
    text: str,
) -> str | None:
    """
    Detect the broadest degree level explicitly present in text.
    """
    normalized = normalize_education_text(
        text
    )

    if not normalized:
        return None

    # Most advanced levels should be checked first.
    detection_order = (
        "doctorate",
        "masters",
        "bachelors",
        "diploma",
        "higher_secondary",
        "secondary",
    )

    for level in detection_order:
        aliases = DEGREE_LEVEL_ALIASES[
            level
        ]

        for alias in aliases:
            alias_normalized = normalize_education_text(
                alias
            )

            if not alias_normalized:
                continue

            # Handle punctuation/spacing variants safely.
            pattern = re.escape(
                alias_normalized
            )

            if re.search(
                rf"(?<![a-z0-9]){pattern}(?![a-z0-9])",
                normalized,
            ):
                return level

    return None


def degree_level_rank(
    level: str | None,
) -> int:
    """
    Education hierarchy used only for comparison.

    doctorate > masters > bachelors > diploma > higher secondary > secondary
    """
    ranks = {
        "secondary": 1,
        "higher_secondary": 2,
        "diploma": 3,
        "bachelors": 4,
        "masters": 5,
        "doctorate": 6,
    }

    return ranks.get(
        level or "",
        0,
    )


# ============================================================================
# Field Detection
# ============================================================================

FIELD_GROUPS: dict[str, set[str]] = {
    "computer_science": {
        "computer science",
        "computer science and engineering",
        "cse",
        "cs",
        "computing",
        "computer engineering",
        "computer applications",
    },
    "artificial_intelligence": {
        "artificial intelligence",
        "ai",
        "artificial intelligence and machine learning",
        "ai and ml",
        "ai/ml",
        "artificial intelligence & machine learning",
    },
    "machine_learning": {
        "machine learning",
        "ml",
        "artificial intelligence and machine learning",
        "ai and ml",
        "ai/ml",
        "artificial intelligence & machine learning",
    },
    "data_science": {
        "data science",
        "data analytics",
        "data science and analytics",
    },
    "information_technology": {
        "information technology",
        "it",
        "information systems",
    },
    "software_engineering": {
        "software engineering",
        "software development",
    },
    "electronics": {
        "electronics",
        "electronics and communication",
        "ece",
        "electronic engineering",
        "electronics engineering",
    },
    "electrical": {
        "electrical engineering",
        "electrical and electronics engineering",
        "eee",
    },
    "mechanical": {
        "mechanical engineering",
        "mechanical",
    },
    "civil": {
        "civil engineering",
        "civil",
    },
    "business": {
        "business administration",
        "business management",
        "management",
        "mba",
    },
    "mathematics": {
        "mathematics",
        "applied mathematics",
        "math",
    },
    "statistics": {
        "statistics",
        "applied statistics",
    },
    "physics": {
        "physics",
        "applied physics",
    },
    "chemistry": {
        "chemistry",
        "applied chemistry",
    },
}


def canonical_field(
    value: str,
) -> str | None:
    """
    Map a field into a stable local category.
    """
    normalized = normalize_education_text(
        value
    )

    if not normalized:
        return None

    for canonical, aliases in FIELD_GROUPS.items():
        normalized_aliases = {
            normalize_education_text(alias)
            for alias in aliases
        }

        if normalized in normalized_aliases:
            return canonical

    # Direct substring handling for compound fields.
    for canonical, aliases in FIELD_GROUPS.items():
        for alias in aliases:
            alias_normalized = normalize_education_text(
                alias
            )

            if (
                alias_normalized
                and alias_normalized in normalized
            ):
                return canonical

    return None


def detect_fields(
    text: str,
) -> tuple[str, ...]:
    """
    Detect one or more academic field categories from text.
    """
    normalized = normalize_education_text(
        text
    )

    if not normalized:
        return ()

    matches: list[str] = []

    for canonical, aliases in FIELD_GROUPS.items():
        for alias in aliases:
            alias_normalized = normalize_education_text(
                alias
            )

            if not alias_normalized:
                continue

            pattern = re.escape(
                alias_normalized
            )

            if re.search(
                rf"(?<![a-z0-9]){pattern}(?![a-z0-9])",
                normalized,
            ):
                matches.append(
                    canonical
                )
                break

    return tuple(
        _unique_keep_order(matches)
    )


# ============================================================================
# Requirement Parsing
# ============================================================================

def _requirement_text(
    requirement: object,
) -> str:
    """
    Read the textual content from a JD requirement object.
    """
    for field_name in (
        "text",
        "description",
        "requirement",
        "name",
        "title",
    ):
        value = _get_attr(
            requirement,
            field_name,
            "",
        )

        if value:
            return _safe_text(
                value
            )

    return ""


def _requirement_is_required(
    requirement: object,
    text: str,
) -> bool:
    """
    Determine whether the requirement is mandatory.
    """
    importance = _safe_text(
        _get_attr(
            requirement,
            "importance",
            _get_attr(
                requirement,
                "priority",
                "",
            ),
        )
    ).lower()

    if importance in {
        "preferred",
        "nice to have",
        "nice-to-have",
        "optional",
        "desired",
        "plus",
        "bonus",
    }:
        return False

    if importance in {
        "required",
        "must",
        "mandatory",
        "essential",
        "high",
    }:
        return True

    normalized = normalize_education_text(
        text
    )

    preferred_markers = (
        "preferred",
        "nice to have",
        "nice-to-have",
        "plus",
        "bonus",
        "desired",
        "optional",
    )

    if any(
        marker in normalized
        for marker in preferred_markers
    ):
        return False

    required_markers = (
        "required",
        "must have",
        "must-have",
        "mandatory",
        "essential",
        "minimum",
        "at least",
    )

    if any(
        marker in normalized
        for marker in required_markers
    ):
        return True

    return True


def _build_education_requirements(
    jd: JDProfile,
) -> list[EducationRequirement]:
    """
    Extract structured education requirements from the JD profile.
    """
    result: list[EducationRequirement] = []

    explicit_requirements = _get_attr(
        jd,
        "education_requirements",
        [],
    ) or []

    for requirement in explicit_requirements:
        text = _requirement_text(
            requirement
        )

        if not text:
            continue

        result.append(
            EducationRequirement(
                text=text,
                degree_level=detect_degree_level(
                    text
                ),
                fields=detect_fields(
                    text
                ),
                required=_requirement_is_required(
                    requirement,
                    text,
                ),
            )
        )

    # Fallback to generic JD requirements when education-specific records
    # were not created by jd_extractor.py.
    if not result:
        generic_requirements = _get_attr(
            jd,
            "requirements",
            [],
        ) or []

        for requirement in generic_requirements:
            requirement_type = normalize_education_text(
                _safe_text(
                    _get_attr(
                        requirement,
                        "requirement_type",
                        _get_attr(
                            requirement,
                            "type",
                            "",
                        ),
                    )
                )
            )

            if "education" not in requirement_type:
                continue

            text = _requirement_text(
                requirement
            )

            if not text:
                continue

            result.append(
                EducationRequirement(
                    text=text,
                    degree_level=detect_degree_level(
                        text
                    ),
                    fields=detect_fields(
                        text
                    ),
                    required=_requirement_is_required(
                        requirement,
                        text,
                    ),
                )
            )

    # If no structured requirement exists, inspect the raw education field
    # provided by the JD extractor.
    if not result:
        raw_education = _get_attr(
            jd,
            "education",
            _get_attr(
                jd,
                "education_requirements_text",
                "",
            ),
        )

        if (
            isinstance(
                raw_education,
                str,
            )
            and raw_education.strip()
        ):
            text = raw_education.strip()

            result.append(
                EducationRequirement(
                    text=text,
                    degree_level=detect_degree_level(
                        text
                    ),
                    fields=detect_fields(
                        text
                    ),
                    required=True,
                )
            )

        elif isinstance(
            raw_education,
            Sequence,
        ):
            for item in raw_education:
                text = _safe_text(
                    item
                )

                if not text:
                    continue

                result.append(
                    EducationRequirement(
                        text=text,
                        degree_level=detect_degree_level(
                            text
                        ),
                        fields=detect_fields(
                            text
                        ),
                        required=True,
                    )
                )

    return _deduplicate_requirements(
        result
    )


def _deduplicate_requirements(
    requirements: Sequence[EducationRequirement],
) -> list[EducationRequirement]:
    seen: set[str] = set()
    result: list[EducationRequirement] = []

    for requirement in requirements:
        key = canonical_education_text(
            requirement.text
        )

        if not key or key in seen:
            continue

        seen.add(
            key
        )

        result.append(
            requirement
        )

    return result


# ============================================================================
# Resume Education Extraction
# ============================================================================

def _education_item_text(
    item: object,
) -> str:
    parts: list[str] = []

    for field_name in (
        "degree",
        "field",
        "specialization",
        "major",
        "program",
        "institution",
        "university",
        "college",
        "school",
        "description",
        "dates",
        "date_range",
        "duration",
        "grade",
        "cgpa",
        "percentage",
    ):
        value = _get_attr(
            item,
            field_name,
            "",
        )

        if value:
            parts.append(
                _safe_text(
                    value
                )
            )

    return "\n".join(
        part
        for part in parts
        if part
    )


def _resume_education_evidence(
    resume: ResumeProfile,
) -> list[EducationEvidence]:
    education_items = _get_attr(
        resume,
        "education",
        [],
    ) or []

    result: list[EducationEvidence] = []

    for item in education_items:
        text = _education_item_text(
            item
        )

        if not text:
            continue

        degree = _safe_text(
            _get_attr(
                item,
                "degree",
                _get_attr(
                    item,
                    "program",
                    "",
                ),
            )
        )

        field = _safe_text(
            _get_attr(
                item,
                "field",
                _get_attr(
                    item,
                    "major",
                    _get_attr(
                        item,
                        "specialization",
                        "",
                    ),
                ),
            )
        )

        institution = _safe_text(
            _get_attr(
                item,
                "institution",
                _get_attr(
                    item,
                    "university",
                    _get_attr(
                        item,
                        "college",
                        "",
                    ),
                ),
            )
        )

        level = detect_degree_level(
            f"{degree} {field} {text}"
        )

        result.append(
            EducationEvidence(
                degree=degree,
                field=field,
                institution=institution,
                text=text,
                level=level,
                relevance_score=0.0,
            )
        )

    return result


# ============================================================================
# Related Field Logic
# ============================================================================

RELATED_FIELDS: dict[str, set[str]] = {
    "computer_science": {
        "computer_science",
        "artificial_intelligence",
        "machine_learning",
        "data_science",
        "information_technology",
        "software_engineering",
        "computer_applications",
    },
    "artificial_intelligence": {
        "artificial_intelligence",
        "machine_learning",
        "computer_science",
        "data_science",
        "software_engineering",
    },
    "machine_learning": {
        "machine_learning",
        "artificial_intelligence",
        "computer_science",
        "data_science",
    },
    "data_science": {
        "data_science",
        "machine_learning",
        "artificial_intelligence",
        "computer_science",
        "statistics",
        "mathematics",
    },
    "information_technology": {
        "information_technology",
        "computer_science",
        "software_engineering",
        "computer_applications",
    },
    "software_engineering": {
        "software_engineering",
        "computer_science",
        "information_technology",
    },
    "statistics": {
        "statistics",
        "mathematics",
        "data_science",
        "computer_science",
    },
    "mathematics": {
        "mathematics",
        "statistics",
        "data_science",
        "computer_science",
    },
}


def fields_are_exact_match(
    candidate_fields: Sequence[str],
    required_fields: Sequence[str],
) -> bool:
    if (
        not candidate_fields
        or not required_fields
    ):
        return False

    return bool(
        set(candidate_fields)
        & set(required_fields)
    )


def fields_are_related_match(
    candidate_fields: Sequence[str],
    required_fields: Sequence[str],
) -> bool:
    if (
        not candidate_fields
        or not required_fields
    ):
        return False

    for required in required_fields:
        related = RELATED_FIELDS.get(
            required,
            {required},
        )

        if set(candidate_fields) & related:
            return True

    return False


# ============================================================================
# Education Relevance
# ============================================================================

def _education_relevance_score(
    evidence: EducationEvidence,
    requirement: EducationRequirement,
) -> float:
    candidate_text = normalize_education_text(
        evidence.text
    )

    required_text = normalize_education_text(
        requirement.text
    )

    if (
        not candidate_text
        or not required_text
    ):
        return 0.0

    candidate_level = evidence.level
    required_level = requirement.degree_level

    score = 0.0

    # ------------------------------------------------------------------------
    # Degree level
    # ------------------------------------------------------------------------

    if required_level:
        candidate_rank = degree_level_rank(
            candidate_level
        )

        required_rank = degree_level_rank(
            required_level
        )

        if candidate_level == required_level:
            score += 55.0

        elif (
            candidate_rank > 0
            and required_rank > 0
            and candidate_rank > required_rank
        ):
            # Higher degree usually satisfies lower minimum level.
            score += 48.0

        elif (
            candidate_rank > 0
            and required_rank > 0
            and candidate_rank == required_rank - 1
        ):
            score += 18.0

        else:
            score += 0.0

    else:
        # If the JD only mentions a field without a level, do not penalize
        # the candidate simply because a degree level could not be inferred.
        score += 25.0

    # ------------------------------------------------------------------------
    # Academic field
    # ------------------------------------------------------------------------

    candidate_fields = detect_fields(
        f"{evidence.degree} "
        f"{evidence.field} "
        f"{evidence.text}"
    )

    required_fields = requirement.fields

    if required_fields:
        if fields_are_exact_match(
            candidate_fields,
            required_fields,
        ):
            score += 45.0

        elif fields_are_related_match(
            candidate_fields,
            required_fields,
        ):
            score += 34.0

        else:
            score += 0.0

    else:
        # Requirement did not specify a particular field.
        score += 45.0

    return round(
        min(
            max(
                score,
                0.0,
            ),
            100.0,
        ),
        2,
    )


def _score_requirements(
    evidence: Sequence[EducationEvidence],
    requirements: Sequence[EducationRequirement],
) -> list[float]:
    scores: list[float] = []

    for requirement in requirements:
        best_score = 0.0

        for item in evidence:
            score = _education_relevance_score(
                item,
                requirement,
            )

            best_score = max(
                best_score,
                score,
            )

        scores.append(
            round(
                best_score,
                2,
            )
        )

    return scores


# ============================================================================
# Match Classification
# ============================================================================

def _classify_overall(
    requirements: Sequence[EducationRequirement],
    requirement_scores: Sequence[float],
    has_evidence: bool,
) -> tuple[bool, float, str]:
    """
    Return:
        matched, score, confidence
    """
    if not requirements:
        if has_evidence:
            return True, 85.0, "medium"

        return True, 70.0, "low"

    required_pairs = [
        (
            requirement,
            score,
        )
        for requirement, score in zip(
            requirements,
            requirement_scores,
        )
        if requirement.required
    ]

    preferred_pairs = [
        (
            requirement,
            score,
        )
        for requirement, score in zip(
            requirements,
            requirement_scores,
        )
        if not requirement.required
    ]

    # Required requirements dominate.
    if required_pairs:
        required_score = (
            sum(
                score
                for _, score in required_pairs
            )
            / len(required_pairs)
        )

    else:
        required_score = 100.0

    if preferred_pairs:
        preferred_score = (
            sum(
                score
                for _, score in preferred_pairs
            )
            / len(preferred_pairs)
        )

    else:
        preferred_score = 100.0

    final_score = (
        required_score * 0.75
        + preferred_score * 0.25
    )

    final_score = round(
        max(
            0.0,
            min(
                100.0,
                final_score,
            ),
        ),
        2,
    )

    required_matched = all(
        score >= 70.0
        for _, score in required_pairs
    )

    if not required_pairs:
        required_matched = True

    matched = (
        required_matched
        and final_score >= 65.0
    )

    if final_score >= 85.0:
        confidence = "high"

    elif final_score >= 65.0:
        confidence = "medium"

    else:
        confidence = "low"

    return (
        matched,
        final_score,
        confidence,
    )


# ============================================================================
# Explanations
# ============================================================================

def _candidate_education_summary(
    evidence: Sequence[EducationEvidence],
) -> str:
    if not evidence:
        return (
            "No structured education record was "
            "extracted from the resume."
        )

    summaries: list[str] = []

    for item in evidence:
        degree_parts = [
            item.degree,
            item.field,
        ]

        degree_text = " ".join(
            part
            for part in degree_parts
            if part
        ).strip()

        if item.institution:
            if degree_text:
                summaries.append(
                    f"{degree_text} at {item.institution}"
                )

            else:
                summaries.append(
                    item.institution
                )

        elif degree_text:
            summaries.append(
                degree_text
            )

    summaries = _unique_keep_order(
        summaries
    )

    if not summaries:
        return (
            "Education records were detected, but detailed "
            "degree or institution information was limited."
        )

    return "; ".join(
        summaries
    ) + "."


def _required_education_summary(
    requirements: Sequence[EducationRequirement],
) -> str:
    if not requirements:
        return (
            "No explicit education requirement was extracted "
            "from the job description."
        )

    texts = _unique_keep_order(
        requirement.text
        for requirement in requirements
    )

    return "; ".join(
        texts
    ) + "."


def _build_explanation(
    requirements: Sequence[EducationRequirement],
    evidence: Sequence[EducationEvidence],
    scores: Sequence[float],
    final_score: float,
    matched: bool,
) -> str:
    if not requirements:
        if evidence:
            return (
                "The resume contains structured education evidence, "
                "while the job description does not state a clear "
                "minimum education requirement."
            )

        return (
            "No explicit education requirement or structured "
            "education evidence was extracted."
        )

    if (
        matched
        and final_score >= 85.0
    ):
        return (
            "The candidate's extracted education closely aligns "
            "with the stated degree level and field requirements."
        )

    if (
        matched
        and final_score >= 65.0
    ):
        return (
            "The candidate's education is broadly aligned with "
            "the role, with at least partial support for the stated "
            "degree/field requirements."
        )

    if final_score >= 40.0:
        return (
            "The resume contains some education evidence, but the "
            "alignment with the stated degree or field requirements "
            "is only partial."
        )

    if not evidence:
        return (
            "No reliable education evidence was extracted from "
            "the resume to support the stated requirement."
        )

    return (
        "The extracted education does not sufficiently support "
        "the job description's stated education requirement."
    )


# ============================================================================
# Public API
# ============================================================================

def match_education(
    resume: ResumeProfile,
    jd: JDProfile,
) -> EducationMatch:
    """
    Deterministically compare resume education against JD education needs.

    Important principles:
        - Degree level and academic field are considered separately.
        - Related fields may satisfy a broad 'related field' requirement.
        - A higher degree can satisfy a lower minimum degree level.
        - Certificates/training are not silently treated as degrees.
        - No semantic AI reasoning happens here.
    """
    requirements = _build_education_requirements(
        jd
    )

    evidence = _resume_education_evidence(
        resume
    )

    requirement_scores = _score_requirements(
        evidence,
        requirements,
    )

    (
        matched,
        final_score,
        confidence,
    ) = _classify_overall(
        requirements=requirements,
        requirement_scores=requirement_scores,
        has_evidence=bool(evidence),
    )

    candidate_summary = _candidate_education_summary(
        evidence
    )

    required_summary = _required_education_summary(
        requirements
    )

    explanation = _build_explanation(
        requirements=requirements,
        evidence=evidence,
        scores=requirement_scores,
        final_score=final_score,
        matched=matched,
    )

    # ------------------------------------------------------------------------
    # IMPORTANT SCHEMA BOUNDARY
    #
    # EducationMatch.score is an integer in schemas.analyzer.
    # Internal calculations intentionally keep decimal precision, but the
    # value must be converted to an integer before constructing the Pydantic
    # model.
    # ------------------------------------------------------------------------

    final_score_int = int(
        round(final_score)
    )

    return EducationMatch(
        candidate_education=candidate_summary,
        required_education=required_summary,
        matched=matched,
        score=final_score_int,
        confidence=confidence,
        explanation=explanation,
    )


# ============================================================================
# Utility Functions
# ============================================================================

def extract_resume_degree_levels(
    resume: ResumeProfile,
) -> list[str]:
    """
    Return detected degree levels from the resume.
    """
    evidence = _resume_education_evidence(
        resume
    )

    levels = [
        item.level
        for item in evidence
        if item.level
    ]

    return _unique_keep_order(
        levels
    )


def extract_resume_fields(
    resume: ResumeProfile,
) -> list[str]:
    """
    Return detected academic field categories.
    """
    evidence = _resume_education_evidence(
        resume
    )

    fields: list[str] = []

    for item in evidence:
        fields.extend(
            detect_fields(
                f"{item.degree} "
                f"{item.field} "
                f"{item.text}"
            )
        )

    return _unique_keep_order(
        fields
    )


def education_requirement_exists(
    jd: JDProfile,
) -> bool:
    """
    Return whether an explicit education requirement is available.
    """
    return bool(
        _build_education_requirements(
            jd
        )
    )


def validate_education_match(
    analysis: EducationMatch,
) -> None:
    """
    Lightweight consistency checks.
    """
    if not 0 <= analysis.score <= 100:
        raise ValueError(
            "Education score must be between 0 and 100."
        )

    if not isinstance(
        analysis.matched,
        bool,
    ):
        raise ValueError(
            "Education matched must be a boolean."
        )

    if not analysis.confidence:
        raise ValueError(
            "Education confidence must not be empty."
        )

    if not isinstance(
        analysis.score,
        int,
    ):
        raise ValueError(
            "Education score must be an integer."
        )

    if not isinstance(
        analysis.candidate_education,
        str,
    ):
        raise ValueError(
            "candidate_education must be a string."
        )

    if not isinstance(
        analysis.required_education,
        str,
    ):
        raise ValueError(
            "required_education must be a string."
        )

    if not isinstance(
        analysis.explanation,
        str,
    ):
        raise ValueError(
            "Education explanation must be a string."
        )