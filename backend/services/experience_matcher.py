from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import Iterable, Sequence

from schemas.analyzer import ExperienceMatch
from services.jd_extractor import JDProfile
from services.resume_extractor import ResumeProfile


# ---------------------------------------------------------------------------
# Internal models
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ExperienceRequirement:
    text: str
    minimum_years: float | None
    maximum_years: float | None
    entry_level: bool
    fresher_friendly: bool
    required: bool


@dataclass(frozen=True)
class ExperienceEvidence:
    source_type: str
    title: str
    organization: str
    text: str
    relevance_score: float
    duration_months: float | None


# ---------------------------------------------------------------------------
# Text normalization
# ---------------------------------------------------------------------------

def normalize_experience_text(value: str) -> str:
    """
    Normalize text for deterministic experience matching.
    """
    if not value:
        return ""

    text = unicodedata.normalize(
        "NFKC",
        str(value),
    ).lower().strip()

    text = text.replace("–", "-").replace("—", "-")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


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


def _deduplicate_strings(
    values: Iterable[str],
) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []

    for value in values:
        normalized = normalize_experience_text(value)

        if not normalized or normalized in seen:
            continue

        seen.add(normalized)
        result.append(value.strip())

    return result


# ---------------------------------------------------------------------------
# Requirement parsing
# ---------------------------------------------------------------------------

_YEAR_PATTERN = re.compile(
    r"(?P<min>\d+(?:\.\d+)?)\s*(?:\+|plus)?\s*"
    r"(?:years?|yrs?)",
    flags=re.IGNORECASE,
)

_RANGE_YEAR_PATTERN = re.compile(
    r"(?P<min>\d+(?:\.\d+)?)\s*(?:-|to)\s*"
    r"(?P<max>\d+(?:\.\d+)?)\s*(?:years?|yrs?)",
    flags=re.IGNORECASE,
)

_MONTH_PATTERN = re.compile(
    r"(?P<months>\d+)\s*(?:months?|mos?)",
    flags=re.IGNORECASE,
)


def _parse_required_years(
    text: str,
) -> tuple[float | None, float | None]:
    """
    Parse common experience statements.

    Examples:
        "2+ years"  -> (2.0, None)
        "1-2 years" -> (1.0, 2.0)
        "6 months"  -> (0.5, 0.5)
    """
    normalized = normalize_experience_text(text)

    range_match = _RANGE_YEAR_PATTERN.search(
        normalized
    )

    if range_match:
        return (
            float(range_match.group("min")),
            float(range_match.group("max")),
        )

    year_match = _YEAR_PATTERN.search(
        normalized
    )

    if year_match:
        return (
            float(year_match.group("min")),
            None,
        )

    month_match = _MONTH_PATTERN.search(
        normalized
    )

    if month_match:
        months = float(
            month_match.group("months")
        )
        years = months / 12.0

        return years, years

    return None, None


def _detect_entry_level(
    text: str,
) -> bool:
    normalized = normalize_experience_text(text)

    patterns = (
        "entry level",
        "entry-level",
        "junior",
        "fresher",
        "freshers",
        "graduate",
        "new graduate",
        "recent graduate",
        "0-1 year",
        "0 to 1 year",
        "0 years",
        "less than 1 year",
    )

    return any(
        pattern in normalized
        for pattern in patterns
    )


def _detect_fresher_friendly(
    text: str,
) -> bool:
    normalized = normalize_experience_text(text)

    patterns = (
        "fresher",
        "freshers",
        "recent graduate",
        "new graduate",
        "graduates welcome",
        "entry level",
        "entry-level",
        "0-1 year",
        "0 to 1 year",
        "no prior experience required",
        "experience not required",
    )

    return any(
        pattern in normalized
        for pattern in patterns
    )


def _detect_required_requirement(
    text: str,
) -> bool:
    normalized = normalize_experience_text(text)

    required_patterns = (
        "required",
        "must have",
        "must-have",
        "minimum",
        "mandatory",
        "essential",
        "at least",
        "should have",
    )

    preferred_patterns = (
        "preferred",
        "nice to have",
        "nice-to-have",
        "plus",
        "bonus",
        "desired",
    )

    if any(
        pattern in normalized
        for pattern in preferred_patterns
    ):
        return False

    if any(
        pattern in normalized
        for pattern in required_patterns
    ):
        return True

    return True


def _build_experience_requirements(
    jd: JDProfile,
) -> list[ExperienceRequirement]:
    """
    Extract experience requirements from the already parsed JD.
    """
    requirements = _get_attr(
        jd,
        "experience_requirements",
        [],
    ) or []

    result: list[ExperienceRequirement] = []

    for requirement in requirements:
        text = ""

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
                text = _safe_text(value)
                break

        if not text:
            continue

        minimum_years, maximum_years = _parse_required_years(
            text
        )

        entry_level = _detect_entry_level(
            text
        )

        fresher_friendly = _detect_fresher_friendly(
            text
        )

        required = _detect_required_requirement(
            text
        )

        result.append(
            ExperienceRequirement(
                text=text,
                minimum_years=minimum_years,
                maximum_years=maximum_years,
                entry_level=entry_level,
                fresher_friendly=fresher_friendly,
                required=required,
            )
        )

    # Some implementations expose experience requirements through generic
    # requirements instead. Support that representation too.
    if not result:
        generic_requirements = _get_attr(
            jd,
            "requirements",
            [],
        ) or []

        for requirement in generic_requirements:
            requirement_type = normalize_experience_text(
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

            if "experience" not in requirement_type:
                continue

            text = ""

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
                    text = _safe_text(value)
                    break

            if not text:
                continue

            (
                minimum_years,
                maximum_years,
            ) = _parse_required_years(
                text
            )

            result.append(
                ExperienceRequirement(
                    text=text,
                    minimum_years=minimum_years,
                    maximum_years=maximum_years,
                    entry_level=_detect_entry_level(
                        text
                    ),
                    fresher_friendly=_detect_fresher_friendly(
                        text
                    ),
                    required=_detect_required_requirement(
                        text
                    ),
                )
            )

    return result


# ---------------------------------------------------------------------------
# Resume duration parsing
# ---------------------------------------------------------------------------

_DATE_PATTERN = re.compile(
    r"(?P<month>"
    r"jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|"
    r"jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|"
    r"nov(?:ember)?|dec(?:ember)?"
    r")?"
    r"\s*"
    r"(?P<year>20\d{2})",
    flags=re.IGNORECASE,
)

_DATE_RANGE_PATTERN = re.compile(
    r"(?P<start>.*?)\s*(?:-|–|—|to)\s*(?P<end>.*?)$",
    flags=re.IGNORECASE,
)


def _month_to_number(
    month_name: str | None,
) -> int | None:
    if not month_name:
        return None

    lookup = {
        "jan": 1,
        "january": 1,
        "feb": 2,
        "february": 2,
        "mar": 3,
        "march": 3,
        "apr": 4,
        "april": 4,
        "may": 5,
        "jun": 6,
        "june": 6,
        "jul": 7,
        "july": 7,
        "aug": 8,
        "august": 8,
        "sep": 9,
        "sept": 9,
        "september": 9,
        "oct": 10,
        "october": 10,
        "nov": 11,
        "november": 11,
        "dec": 12,
        "december": 12,
    }

    return lookup.get(
        month_name.lower()
    )


def _parse_single_date(
    value: str,
) -> tuple[int, int] | None:
    match = _DATE_PATTERN.search(
        value
    )

    if not match:
        return None

    year = int(
        match.group("year")
    )

    month = _month_to_number(
        match.group("month")
    )

    if month is None:
        month = 6

    return year, month


def _parse_duration_months(
    value: object,
) -> float | None:
    """
    Try to derive duration in months from common resume representations.
    """
    if value is None:
        return None

    text = normalize_experience_text(
        _safe_text(value)
    )

    if not text:
        return None

    # Direct patterns such as "8 months".
    month_match = _MONTH_PATTERN.search(
        text
    )

    if month_match:
        return float(
            month_match.group("months")
        )

    # Patterns such as "Aug 2025 - Sep 2026".
    range_match = _DATE_RANGE_PATTERN.match(
        text
    )

    if not range_match:
        return None

    start = _parse_single_date(
        range_match.group("start")
    )

    end_text = range_match.group(
        "end"
    )

    end = _parse_single_date(
        end_text
    )

    if start is None or end is None:
        return None

    start_year, start_month = start
    end_year, end_month = end

    months = (
        (end_year - start_year) * 12
        + (end_month - start_month)
        + 1
    )

    if months <= 0:
        return None

    return float(months)


def _extract_duration_months(
    item: object,
) -> float | None:
    for field_name in (
        "duration_months",
        "months",
        "duration",
        "date_range",
        "dates",
        "period",
    ):
        value = _get_attr(
            item,
            field_name,
            None,
        )

        if value is None:
            continue

        if isinstance(
            value,
            (int, float),
        ):
            if value > 0:
                return float(value)

        parsed = _parse_duration_months(
            value
        )

        if parsed is not None:
            return parsed

    return None


def _duration_to_years(
    months: float | None,
) -> float:
    if months is None or months <= 0:
        return 0.0

    return months / 12.0


# ---------------------------------------------------------------------------
# Resume evidence extraction
# ---------------------------------------------------------------------------

def _experience_item_text(
    item: object,
) -> str:
    parts: list[str] = []

    for field_name in (
        "title",
        "role",
        "position",
        "company",
        "organization",
        "description",
        "location",
    ):
        value = _get_attr(
            item,
            field_name,
            "",
        )

        if value:
            parts.append(
                _safe_text(value)
            )

    bullets = _get_attr(
        item,
        "bullets",
        [],
    ) or []

    for bullet in bullets:
        if bullet:
            parts.append(
                _safe_text(bullet)
            )

    responsibilities = _get_attr(
        item,
        "responsibilities",
        [],
    ) or []

    for responsibility in responsibilities:
        if responsibility:
            parts.append(
                _safe_text(responsibility)
            )

    return "\n".join(
        parts
    )


def _project_item_text(
    item: object,
) -> str:
    parts: list[str] = []

    for field_name in (
        "name",
        "title",
        "description",
    ):
        value = _get_attr(
            item,
            field_name,
            "",
        )

        if value:
            parts.append(
                _safe_text(value)
            )

    technologies = _get_attr(
        item,
        "technologies",
        [],
    ) or []

    for technology in technologies:
        if technology:
            parts.append(
                _safe_text(technology)
            )

    bullets = _get_attr(
        item,
        "bullets",
        [],
    ) or []

    for bullet in bullets:
        if bullet:
            parts.append(
                _safe_text(bullet)
            )

    return "\n".join(
        parts
    )


def _internship_item_text(
    item: object,
) -> str:
    return _experience_item_text(
        item
    )


def _resume_evidence(
    resume: ResumeProfile,
) -> list[ExperienceEvidence]:
    result: list[ExperienceEvidence] = []

    experience_items = _get_attr(
        resume,
        "experience",
        [],
    ) or []

    for item in experience_items:
        text = _experience_item_text(
            item
        )

        if not text:
            continue

        title = ""

        for field_name in (
            "title",
            "role",
            "position",
        ):
            value = _get_attr(
                item,
                field_name,
                "",
            )

            if value:
                title = _safe_text(
                    value
                )
                break

        organization = ""

        for field_name in (
            "company",
            "organization",
        ):
            value = _get_attr(
                item,
                field_name,
                "",
            )

            if value:
                organization = _safe_text(
                    value
                )
                break

        result.append(
            ExperienceEvidence(
                source_type="experience",
                title=title,
                organization=organization,
                text=text,
                relevance_score=0.0,
                duration_months=_extract_duration_months(
                    item
                ),
            )
        )

    internship_items = _get_attr(
        resume,
        "internships",
        [],
    ) or []

    for item in internship_items:
        text = _internship_item_text(
            item
        )

        if not text:
            continue

        title = _safe_text(
            _get_attr(
                item,
                "title",
                _get_attr(
                    item,
                    "role",
                    "",
                ),
            )
        )

        organization = _safe_text(
            _get_attr(
                item,
                "company",
                _get_attr(
                    item,
                    "organization",
                    "",
                ),
            )
        )

        result.append(
            ExperienceEvidence(
                source_type="internship",
                title=title,
                organization=organization,
                text=text,
                relevance_score=0.0,
                duration_months=_extract_duration_months(
                    item
                ),
            )
        )

    project_items = _get_attr(
        resume,
        "projects",
        [],
    ) or []

    for item in project_items:
        text = _project_item_text(
            item
        )

        if not text:
            continue

        title = _safe_text(
            _get_attr(
                item,
                "name",
                _get_attr(
                    item,
                    "title",
                    "",
                ),
            )
        )

        result.append(
            ExperienceEvidence(
                source_type="project",
                title=title,
                organization="",
                text=text,
                relevance_score=0.0,
                duration_months=_extract_duration_months(
                    item
                ),
            )
        )

    return result


# ---------------------------------------------------------------------------
# Relevance matching
# ---------------------------------------------------------------------------

_ROLE_TERM_ALIASES: dict[str, set[str]] = {
    "software developer": {
        "software developer",
        "software engineer",
        "developer",
        "sde",
        "software development",
    },
    "ai engineer": {
        "ai engineer",
        "artificial intelligence engineer",
        "machine learning engineer",
        "ml engineer",
        "ai developer",
    },
    "machine learning": {
        "machine learning",
        "ml",
        "machine-learning",
    },
    "data analyst": {
        "data analyst",
        "analytics",
        "data analysis",
    },
    "data scientist": {
        "data scientist",
        "data science",
    },
    "web developer": {
        "web developer",
        "frontend developer",
        "backend developer",
        "full stack developer",
        "web development",
    },
}


def _token_set(
    text: str,
) -> set[str]:
    return {
        token
        for token in re.findall(
            r"[a-z0-9+#.]+",
            normalize_experience_text(
                text
            ),
        )
        if len(token) >= 2
    }


def _expanded_terms(
    value: str,
) -> set[str]:
    normalized = normalize_experience_text(
        value
    )

    terms = {
        normalized
    }

    for canonical, aliases in _ROLE_TERM_ALIASES.items():
        all_values = {
            normalize_experience_text(
                canonical
            ),
            *{
                normalize_experience_text(alias)
                for alias in aliases
            },
        }

        if normalized in all_values:
            terms.update(
                all_values
            )

    return {
        term
        for term in terms
        if term
    }


def _role_relevance(
    candidate_text: str,
    jd_role: str,
) -> float:
    """
    Estimate relevance using deterministic lexical overlap.

    This is intentionally not semantic AI matching. Semantic similarity
    is handled separately by similarity_engine.py.
    """
    candidate_normalized = normalize_experience_text(
        candidate_text
    )

    role_normalized = normalize_experience_text(
        jd_role
    )

    if (
        not candidate_normalized
        or not role_normalized
    ):
        return 0.0

    role_terms = _expanded_terms(
        role_normalized
    )

    for term in role_terms:
        if term and term in candidate_normalized:
            return 100.0

    role_tokens = _token_set(
        role_normalized
    )

    candidate_tokens = _token_set(
        candidate_normalized
    )

    if (
        not role_tokens
        or not candidate_tokens
    ):
        return 0.0

    overlap = len(
        role_tokens & candidate_tokens
    )

    score = (
        overlap
        / len(role_tokens)
    ) * 100.0

    return round(
        min(score, 100.0),
        2,
    )


# ---------------------------------------------------------------------------
# Relevant source identification
# ---------------------------------------------------------------------------

def _relevant_evidence(
    evidence: Sequence[ExperienceEvidence],
    jd_role: str,
    jd_text: str,
) -> tuple[
    list[ExperienceEvidence],
    list[ExperienceEvidence],
    list[ExperienceEvidence],
]:
    """
    Return relevant experience, project, and internship evidence.

    JD text is included so a project can be considered relevant even when
    the exact job title does not appear.
    """
    relevant_experience: list[ExperienceEvidence] = []
    relevant_projects: list[ExperienceEvidence] = []
    relevant_internships: list[ExperienceEvidence] = []

    jd_terms = _token_set(
        jd_role + " " + jd_text
    )

    for item in evidence:
        item_tokens = _token_set(
            item.title + " " + item.text
        )

        if not item_tokens:
            continue

        role_score = _role_relevance(
            item.title + " " + item.text,
            jd_role,
        )

        jd_overlap = 0.0

        if jd_terms:
            overlap = len(
                item_tokens & jd_terms
            )

            jd_overlap = (
                overlap
                / min(
                    len(jd_terms),
                    20,
                )
            ) * 100.0

        combined_score = round(
            (
                role_score * 0.70
            )
            + (
                min(
                    jd_overlap,
                    100.0,
                )
                * 0.30
            ),
            2,
        )

        scored_item = ExperienceEvidence(
            source_type=item.source_type,
            title=item.title,
            organization=item.organization,
            text=item.text,
            relevance_score=combined_score,
            duration_months=item.duration_months,
        )

        if combined_score < 35.0:
            continue

        if item.source_type == "project":
            relevant_projects.append(
                scored_item
            )

        elif item.source_type == "internship":
            relevant_internships.append(
                scored_item
            )

        else:
            relevant_experience.append(
                scored_item
            )

    relevant_experience.sort(
        key=lambda item: item.relevance_score,
        reverse=True,
    )

    relevant_projects.sort(
        key=lambda item: item.relevance_score,
        reverse=True,
    )

    relevant_internships.sort(
        key=lambda item: item.relevance_score,
        reverse=True,
    )

    return (
        relevant_experience,
        relevant_projects,
        relevant_internships,
    )


# ---------------------------------------------------------------------------
# Candidate experience estimation
# ---------------------------------------------------------------------------

def _total_professional_months(
    evidence: Sequence[ExperienceEvidence],
) -> float:
    """
    Sum actual experience/internship durations.

    Projects are deliberately excluded from professional-years estimation.
    """
    months = 0.0

    for item in evidence:
        if item.source_type not in {
            "experience",
            "internship",
        }:
            continue

        if item.duration_months is None:
            continue

        months += max(
            0.0,
            item.duration_months,
        )

    return months


def _relevant_professional_months(
    evidence: Sequence[ExperienceEvidence],
) -> float:
    months = 0.0

    for item in evidence:
        if item.source_type not in {
            "experience",
            "internship",
        }:
            continue

        if item.duration_months is None:
            continue

        if item.relevance_score < 35.0:
            continue

        months += max(
            0.0,
            item.duration_months,
        )

    return months


def _build_candidate_experience_summary(
    evidence: Sequence[ExperienceEvidence],
) -> str:
    professional = [
        item
        for item in evidence
        if item.source_type in {
            "experience",
            "internship",
        }
    ]

    projects = [
        item
        for item in evidence
        if item.source_type == "project"
    ]

    total_months = _total_professional_months(
        evidence
    )

    parts: list[str] = []

    if professional:
        parts.append(
            f"{len(professional)} "
            "professional/internship experience record(s)"
        )

    if projects:
        parts.append(
            f"{len(projects)} project(s)"
        )

    if total_months > 0:
        parts.append(
            f"approximately "
            f"{round(total_months / 12.0, 2)} "
            "year(s) of explicitly stated "
            "experience/internship duration"
        )

    if not parts:
        return (
            "No explicit professional experience, "
            "internship, or project evidence was extracted."
        )

    return "; ".join(parts) + "."


def _build_required_experience_summary(
    requirements: Sequence[ExperienceRequirement],
) -> str:
    if not requirements:
        return (
            "No explicit experience requirement was "
            "extracted from the job description."
        )

    parts: list[str] = []

    for requirement in requirements:
        parts.append(
            requirement.text
        )

    return "; ".join(
        _deduplicate_strings(parts)
    )


# ---------------------------------------------------------------------------
# Match scoring
# ---------------------------------------------------------------------------

def _requirement_score(
    requirement: ExperienceRequirement,
    relevant_years: float,
    relevant_experience_count: int,
    relevant_project_count: int,
    relevant_internship_count: int,
) -> float:
    """
    Determine experience-fit score for one JD requirement.
    """
    evidence_score = 0.0

    if relevant_experience_count > 0:
        evidence_score = max(
            evidence_score,
            100.0,
        )

    if relevant_internship_count > 0:
        evidence_score = max(
            evidence_score,
            82.0,
        )

    if relevant_project_count > 0:
        evidence_score = max(
            evidence_score,
            68.0,
        )

    if (
        requirement.minimum_years is not None
        and requirement.minimum_years > 0
    ):
        years_ratio = (
            relevant_years
            / requirement.minimum_years
        )

        years_score = min(
            100.0,
            years_ratio * 100.0,
        )

        if (
            relevant_experience_count
            or relevant_internship_count
        ):
            evidence_score = (
                evidence_score * 0.55
                + years_score * 0.45
            )

        elif relevant_project_count:
            evidence_score = (
                evidence_score * 0.65
                + min(
                    years_score,
                    50.0,
                ) * 0.35
            )

        else:
            evidence_score = 0.0

    if (
        requirement.entry_level
        or requirement.fresher_friendly
    ):
        if (
            relevant_experience_count
            or relevant_internship_count
            or relevant_project_count
        ):
            evidence_score = max(
                evidence_score,
                85.0,
            )

        else:
            # An entry-level role should not heavily penalize a fresher
            # simply because no prior employment is present.
            evidence_score = 92.0

    return round(
        max(
            0.0,
            min(
                100.0,
                evidence_score,
            ),
        ),
        2,
    )


def _confidence_from_score(
    score: float,
    has_explicit_duration: bool,
    has_relevant_evidence: bool,
) -> str:
    if (
        not has_relevant_evidence
        and not has_explicit_duration
    ):
        return "low"

    if (
        score >= 80.0
        and has_explicit_duration
    ):
        return "high"

    if (
        score >= 70.0
        or has_relevant_evidence
    ):
        return "medium"

    return "low"


def _build_explanation(
    requirements: Sequence[ExperienceRequirement],
    relevant_experience: Sequence[ExperienceEvidence],
    relevant_projects: Sequence[ExperienceEvidence],
    relevant_internships: Sequence[ExperienceEvidence],
    relevant_years: float,
    score: float,
) -> str:
    if not requirements:
        if (
            relevant_experience
            or relevant_projects
            or relevant_internships
        ):
            return (
                "Relevant experience evidence was found "
                "in the resume, but the job description "
                "does not state a clear minimum "
                "experience requirement."
            )

        return (
            "No explicit experience requirement or "
            "relevant experience evidence was extracted."
        )

    requirement_text = " ".join(
        requirement.text
        for requirement in requirements
    )

    requirement_normalized = normalize_experience_text(
        requirement_text
    )

    has_entry_level_signal = (
        _detect_entry_level(
            requirement_normalized
        )
        or _detect_fresher_friendly(
            requirement_normalized
        )
    )

    if has_entry_level_signal:
        if (
            relevant_internships
            or relevant_projects
            or relevant_experience
        ):
            return (
                "The role is entry-level/fresher-friendly "
                "and the resume contains relevant internship, "
                "project, or experience evidence. This supports "
                "a good early-career fit."
            )

        return (
            "The role is entry-level/fresher-friendly. "
            "No substantial professional experience was "
            "required by the extracted wording."
        )

    if relevant_years > 0:
        return (
            f"The resume contains approximately "
            f"{relevant_years:.2f} year(s) of explicitly "
            "stated relevant professional/internship duration. "
            f"The deterministic experience-fit score is "
            f"{score:.1f}/100."
        )

    if (
        relevant_internships
        and relevant_projects
    ):
        return (
            "Relevant internship and project evidence was "
            "found. However, no explicit duration was "
            "reliably extracted, so professional experience "
            "duration is treated conservatively."
        )

    if relevant_internships:
        return (
            "Relevant internship evidence was found, but "
            "the available resume data does not provide enough "
            "reliable duration information to claim a specific "
            "number of professional years."
        )

    if relevant_projects:
        return (
            "Relevant project evidence was found. Projects "
            "demonstrate practical exposure but are not "
            "automatically counted as professional employment "
            "experience."
        )

    return (
        "The extracted resume does not provide sufficiently "
        "relevant experience evidence for the stated requirement."
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def match_experience(
    resume: ResumeProfile,
    jd: JDProfile,
) -> ExperienceMatch:
    """
    Deterministically compare resume experience against JD experience needs.

    Principles:
        1. Explicit duration is preferred over inference.
        2. Internship and project evidence are useful signals but are not
           silently converted into full-time employment years.
        3. Entry-level/fresher-friendly roles receive appropriate handling.
        4. Semantic similarity is intentionally handled elsewhere.
    """
    requirements = _build_experience_requirements(
        jd
    )

    resume_evidence = _resume_evidence(
        resume
    )

    jd_role = _safe_text(
        _get_attr(
            jd,
            "job_title",
            _get_attr(
                jd,
                "role",
                "",
            ),
        )
    )

    jd_text_parts: list[str] = []

    raw_text = _get_attr(
        jd,
        "raw_text",
        "",
    )

    if raw_text:
        jd_text_parts.append(
            _safe_text(raw_text)
        )

    responsibilities = _get_attr(
        jd,
        "responsibilities",
        [],
    ) or []

    for responsibility in responsibilities:
        if responsibility:
            jd_text_parts.append(
                _safe_text(
                    responsibility
                )
            )

    requirement_items = _get_attr(
        jd,
        "requirements",
        [],
    ) or []

    for requirement in requirement_items:
        text = _safe_text(
            _get_attr(
                requirement,
                "text",
                _get_attr(
                    requirement,
                    "description",
                    "",
                ),
            )
        )

        if text:
            jd_text_parts.append(
                text
            )

    jd_text = "\n".join(
        jd_text_parts
    )

    (
        relevant_experience,
        relevant_projects,
        relevant_internships,
    ) = _relevant_evidence(
        resume_evidence,
        jd_role,
        jd_text,
    )

    relevant_professional_evidence = [
        item
        for item in (
            *relevant_experience,
            *relevant_internships,
        )
        if item.duration_months is not None
    ]

    relevant_months = _relevant_professional_months(
        (
            *relevant_experience,
            *relevant_internships,
        )
    )

    relevant_years = _duration_to_years(
        relevant_months
    )

    relevant_experience_count = len(
        relevant_experience
    )

    relevant_project_count = len(
        relevant_projects
    )

    relevant_internship_count = len(
        relevant_internships
    )

    # No explicit requirement means experience should contribute a
    # neutral-positive score when relevant evidence exists, rather than
    # becoming an automatic penalty.
    if not requirements:
        if (
            relevant_experience_count
            or relevant_project_count
            or relevant_internship_count
        ):
            score = 80.0
        else:
            score = 50.0

    else:
        requirement_scores: list[float] = []

        for requirement in requirements:
            requirement_scores.append(
                _requirement_score(
                    requirement=requirement,
                    relevant_years=relevant_years,
                    relevant_experience_count=(
                        relevant_experience_count
                    ),
                    relevant_project_count=(
                        relevant_project_count
                    ),
                    relevant_internship_count=(
                        relevant_internship_count
                    ),
                )
            )

        required_scores = [
            score_value
            for requirement, score_value in zip(
                requirements,
                requirement_scores,
            )
            if requirement.required
        ]

        preferred_scores = [
            score_value
            for requirement, score_value in zip(
                requirements,
                requirement_scores,
            )
            if not requirement.required
        ]

        if (
            required_scores
            and preferred_scores
        ):
            score = (
                (
                    sum(required_scores)
                    / len(required_scores)
                ) * 0.70
                + (
                    sum(preferred_scores)
                    / len(preferred_scores)
                ) * 0.30
            )

        elif required_scores:
            score = (
                sum(required_scores)
                / len(required_scores)
            )

        elif preferred_scores:
            score = (
                sum(preferred_scores)
                / len(preferred_scores)
            )

        else:
            score = 50.0

    score = round(
        max(
            0.0,
            min(
                100.0,
                score,
            ),
        ),
        2,
    )

    explicit_duration_available = (
        len(relevant_professional_evidence) > 0
    )

    relevant_evidence_available = bool(
        relevant_experience
        or relevant_projects
        or relevant_internships
    )

    confidence = _confidence_from_score(
        score=score,
        has_explicit_duration=(
            explicit_duration_available
        ),
        has_relevant_evidence=(
            relevant_evidence_available
        ),
    )

    candidate_summary = _build_candidate_experience_summary(
        resume_evidence
    )

    required_summary = _build_required_experience_summary(
        requirements
    )

    explanation = _build_explanation(
        requirements=requirements,
        relevant_experience=relevant_experience,
        relevant_projects=relevant_projects,
        relevant_internships=relevant_internships,
        relevant_years=relevant_years,
        score=score,
    )

    # IMPORTANT:
    # ExperienceMatch expects integer counts for these three fields.
    # Do NOT pass the actual lists here.
    return ExperienceMatch(
        candidate_experience_summary=candidate_summary,
        required_experience_summary=required_summary,
        relevant_roles_found=(
            relevant_experience_count
        ),
        relevant_projects_found=(
            relevant_project_count
        ),
        relevant_internships_found=(
            relevant_internship_count
        ),
        score=score,
        confidence=confidence,
        explanation=explanation,
    )


# ---------------------------------------------------------------------------
# Utility functions
# ---------------------------------------------------------------------------

def estimate_resume_experience_years(
    resume: ResumeProfile,
) -> float:
    """
    Estimate explicitly stated professional/internship experience years.

    Projects are excluded from this estimate.
    """
    evidence = _resume_evidence(
        resume
    )

    months = _total_professional_months(
        evidence
    )

    return round(
        _duration_to_years(
            months
        ),
        2,
    )


def find_relevant_projects(
    resume: ResumeProfile,
    jd: JDProfile,
) -> list[str]:
    """
    Return names of projects that have meaningful lexical relevance to the
    target role/JD.
    """
    evidence = _resume_evidence(
        resume
    )

    jd_role = _safe_text(
        _get_attr(
            jd,
            "job_title",
            _get_attr(
                jd,
                "role",
                "",
            ),
        )
    )

    jd_text = _safe_text(
        _get_attr(
            jd,
            "raw_text",
            "",
        )
    )

    (
        _experience,
        projects,
        _internships,
    ) = _relevant_evidence(
        evidence,
        jd_role,
        jd_text,
    )

    return [
        project.title
        for project in projects
        if project.title
    ]


def find_relevant_internships(
    resume: ResumeProfile,
    jd: JDProfile,
) -> list[str]:
    """
    Return relevant internship titles.
    """
    evidence = _resume_evidence(
        resume
    )

    jd_role = _safe_text(
        _get_attr(
            jd,
            "job_title",
            _get_attr(
                jd,
                "role",
                "",
            ),
        )
    )

    jd_text = _safe_text(
        _get_attr(
            jd,
            "raw_text",
            "",
        )
    )

    (
        _experience,
        _projects,
        internships,
    ) = _relevant_evidence(
        evidence,
        jd_role,
        jd_text,
    )

    return [
        internship.title
        for internship in internships
        if internship.title
    ]


def validate_experience_match(
    analysis: ExperienceMatch,
) -> None:
    """
    Lightweight consistency validation.
    """
    if not 0 <= analysis.score <= 100:
        raise ValueError(
            "Experience score must be between 0 and 100."
        )

    if not analysis.confidence:
        raise ValueError(
            "Experience confidence must not be empty."
        )

    # ExperienceMatch stores counts, not lists.
    if not isinstance(
        analysis.relevant_roles_found,
        int,
    ):
        raise ValueError(
            "relevant_roles_found must be an integer count."
        )

    if not isinstance(
        analysis.relevant_projects_found,
        int,
    ):
        raise ValueError(
            "relevant_projects_found must be an integer count."
        )

    if not isinstance(
        analysis.relevant_internships_found,
        int,
    ):
        raise ValueError(
            "relevant_internships_found must be an integer count."
        )

    if analysis.relevant_roles_found < 0:
        raise ValueError(
            "relevant_roles_found cannot be negative."
        )

    if analysis.relevant_projects_found < 0:
        raise ValueError(
            "relevant_projects_found cannot be negative."
        )

    if analysis.relevant_internships_found < 0:
        raise ValueError(
            "relevant_internships_found cannot be negative."
        )