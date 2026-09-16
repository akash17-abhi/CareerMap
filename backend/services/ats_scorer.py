from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import Iterable, Sequence

from schemas.analyzer import ATSAnalysis
from services.jd_extractor import JDProfile
from services.resume_extractor import ResumeProfile


# ============================================================================
# Configuration
# ============================================================================

MIN_ATS_SCORE = 0.0
MAX_ATS_SCORE = 100.0


# Expected high-value resume sections.
EXPECTED_SECTIONS = {
    "summary",
    "profile",
    "objective",
    "skills",
    "technical skills",
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "internship",
    "internships",
    "projects",
    "education",
    "certifications",
    "certificates",
    "achievements",
    "languages",
}


# Contact/header sections are not counted as normal body sections.
CONTACT_SECTION_NAMES = {
    "contact",
    "personal information",
    "personal details",
    "header",
}


# Sections that are useful for ATS structure scoring.
HIGH_VALUE_SECTIONS = {
    "summary",
    "profile",
    "objective",
    "skills",
    "technical skills",
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "internship",
    "internships",
    "projects",
    "education",
    "certifications",
    "certificates",
    "achievements",
}


# Common problematic formatting patterns.
PROBLEMATIC_PATTERNS = (
    (
        "tables",
        re.compile(
            r"\t+|\|.*\|",
            flags=re.IGNORECASE,
        ),
        "Table-like or column-like text detected.",
    ),
    (
        "multiple_spaces",
        re.compile(
            r"[ ]{4,}"
        ),
        "Excessive spacing detected.",
    ),
    (
        "repeated_punctuation",
        re.compile(
            r"[._-]{5,}"
        ),
        "Long decorative punctuation sequence detected.",
    ),
    (
        "html_like_markup",
        re.compile(
            r"<\/?[a-z][^>]*>",
            flags=re.IGNORECASE,
        ),
        "HTML-like markup detected in extracted content.",
    ),
)


# ============================================================================
# Internal Models
# ============================================================================

@dataclass(frozen=True)
class ATSComponent:
    name: str
    score: float
    issues: tuple[str, ...]


@dataclass(frozen=True)
class ExtractedSection:
    name: str
    normalized_name: str
    content: str


# ============================================================================
# Basic Helpers
# ============================================================================

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


def normalize_ats_text(
    value: str,
) -> str:
    """
    Normalize text for ATS-oriented structural analysis.

    Unlike semantic similarity processing, this deliberately keeps more
    formatting information available because formatting/readability itself
    is part of ATS analysis.
    """
    if not value:
        return ""

    text = unicodedata.normalize(
        "NFKC",
        str(value),
    )

    text = text.replace(
        "\r\n",
        "\n",
    ).replace(
        "\r",
        "\n",
    )

    text = text.replace(
        "–",
        "-",
    ).replace(
        "—",
        "-",
    )

    return text.strip()


def _normalize_section_name(
    value: str,
) -> str:
    text = normalize_ats_text(
        value
    ).lower()

    text = re.sub(
        r"[^a-z0-9+#& ]+",
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
        normalized = _normalize_section_name(
            value
        )

        if not normalized or normalized in seen:
            continue

        seen.add(normalized)

        result.append(
            value.strip()
        )

    return result


# ============================================================================
# Section Extraction
# ============================================================================

def _extract_resume_sections(
    resume: ResumeProfile,
) -> list[ExtractedSection]:
    """
    Read sections from ResumeProfile.

    The function supports the current structured extractor and remains
    defensive against small internal representation changes.
    """
    sections = _get_attr(
        resume,
        "sections",
        [],
    ) or []

    result: list[ExtractedSection] = []

    for section in sections:
        name = ""

        for field_name in (
            "title",
            "name",
            "heading",
            "section",
        ):
            value = _get_attr(
                section,
                field_name,
                "",
            )

            if value:
                name = _safe_text(
                    value
                )
                break

        content = ""

        for field_name in (
            "content",
            "text",
            "body",
        ):
            value = _get_attr(
                section,
                field_name,
                "",
            )

            if value:
                content = _safe_text(
                    value
                )
                break

        if not name and not content:
            continue

        normalized_name = _normalize_section_name(
            name
        )

        result.append(
            ExtractedSection(
                name=name,
                normalized_name=normalized_name,
                content=content,
            )
        )

    return result


def _resume_raw_text(
    resume: ResumeProfile,
) -> str:
    """
    Retrieve extracted raw resume text when available.
    """
    return normalize_ats_text(
        _safe_text(
            _get_attr(
                resume,
                "raw_text",
                "",
            )
        )
    )


def _all_resume_text(
    resume: ResumeProfile,
) -> str:
    parts: list[str] = []

    raw_text = _resume_raw_text(
        resume
    )

    if raw_text:
        parts.append(
            raw_text
        )

    for section in _extract_resume_sections(
        resume
    ):
        if section.name:
            parts.append(
                section.name
            )

        if section.content:
            parts.append(
                section.content
            )

    # Structured records can exist even when section extraction is partial.
    for collection_name in (
        "skills",
        "experience",
        "internships",
        "projects",
        "education",
        "certifications",
        "achievements",
        "languages",
    ):
        collection = _get_attr(
            resume,
            collection_name,
            [],
        ) or []

        for item in collection:
            if isinstance(
                item,
                str,
            ):
                parts.append(
                    item
                )
                continue

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


# ============================================================================
# Section Scoring
# ============================================================================

def _section_presence_score(
    sections: Sequence[ExtractedSection],
) -> ATSComponent:
    """
    Score whether important resume sections are clearly represented.
    """
    if not sections:
        return ATSComponent(
            name="section_presence",
            score=20.0,
            issues=(
                "No structured resume section headings were extracted.",
            ),
        )

    normalized_names = {
        section.normalized_name
        for section in sections
        if section.normalized_name
    }

    # Merge common aliases into conceptual section groups.
    conceptual_groups = {
        "summary": {
            "summary",
            "profile",
            "objective",
        },
        "skills": {
            "skills",
            "technical skills",
        },
        "experience": {
            "experience",
            "work experience",
            "professional experience",
            "employment",
        },
        "internship": {
            "internship",
            "internships",
        },
        "projects": {
            "projects",
            "project",
        },
        "education": {
            "education",
        },
        "certifications": {
            "certifications",
            "certificates",
            "certifications and courses",
        },
    }

    present_concepts = 0

    for aliases in conceptual_groups.values():
        if normalized_names & aliases:
            present_concepts += 1

    expected_concepts = len(
        conceptual_groups
    )

    if expected_concepts == 0:
        return ATSComponent(
            name="section_presence",
            score=50.0,
            issues=(),
        )

    score = (
        present_concepts
        / expected_concepts
    ) * 100.0

    issues: list[str] = []

    # Required for most resumes.
    required_concepts = (
        "skills",
        "experience",
        "education",
    )

    for concept in required_concepts:
        aliases = conceptual_groups[
            concept
        ]

        if not normalized_names.intersection(
            aliases
        ):
            issues.append(
                f"Clear {concept} section was not detected."
            )

    return ATSComponent(
        name="section_presence",
        score=round(
            max(
                0.0,
                min(
                    100.0,
                    score,
                ),
            ),
            2,
        ),
        issues=tuple(
            issues
        ),
    )


# ============================================================================
# Section Clarity
# ============================================================================

def _section_clarity_score(
    sections: Sequence[ExtractedSection],
) -> ATSComponent:
    """
    Evaluate whether section headings are clean, recognizable, and distinct.
    """
    if not sections:
        return ATSComponent(
            name="section_clarity",
            score=15.0,
            issues=(
                "Section headings could not be reliably extracted.",
            ),
        )

    issues: list[str] = []
    clean_count = 0

    for section in sections:
        normalized_name = section.normalized_name

        if not normalized_name:
            issues.append(
                "A resume section has no recognizable heading."
            )
            continue

        if len(normalized_name) > 45:
            issues.append(
                f"Section heading '{section.name}' is unusually long."
            )
            continue

        if len(normalized_name.split()) > 6:
            issues.append(
                f"Section heading '{section.name}' may contain sentence-like text."
            )
            continue

        clean_count += 1

    score = (
        clean_count
        / len(sections)
    ) * 100.0

    return ATSComponent(
        name="section_clarity",
        score=round(
            max(
                0.0,
                min(
                    100.0,
                    score,
                ),
            ),
            2,
        ),
        issues=tuple(
            issues
        ),
    )


# ============================================================================
# Keyword Readability
# ============================================================================

def _extract_jd_keywords(
    jd: JDProfile,
) -> list[str]:
    """
    Extract useful keywords from JDProfile for ATS readability analysis.

    This does not calculate keyword match. Keyword matching is handled by
    keyword_matcher.py.
    """
    values: list[str] = []

    keywords = _get_attr(
        jd,
        "keywords",
        [],
    ) or []

    for keyword in keywords:
        if isinstance(
            keyword,
            str,
        ):
            if keyword.strip():
                values.append(
                    keyword.strip()
                )
            continue

        for field_name in (
            "keyword",
            "name",
            "text",
            "description",
        ):
            value = _safe_text(
                _get_attr(
                    keyword,
                    field_name,
                    "",
                )
            )

            if value:
                values.append(
                    value
                )
                break

    skill_requirements = _get_attr(
        jd,
        "skill_requirements",
        _get_attr(
            jd,
            "skills",
            [],
        ),
    ) or []

    for skill in skill_requirements:
        if isinstance(
            skill,
            str,
        ):
            if skill.strip():
                values.append(
                    skill.strip()
                )
            continue

        for field_name in (
            "name",
            "skill",
            "keyword",
            "text",
        ):
            value = _safe_text(
                _get_attr(
                    skill,
                    field_name,
                    "",
                )
            )

            if value:
                values.append(
                    value
                )
                break

    requirements = _get_attr(
        jd,
        "requirements",
        [],
    ) or []

    for requirement in requirements:
        for field_name in (
            "text",
            "description",
            "requirement",
            "name",
        ):
            value = _safe_text(
                _get_attr(
                    requirement,
                    field_name,
                    "",
                )
            )

            if value:
                values.append(
                    value
                )
                break

    return _unique_keep_order(
        values
    )


def _keyword_occurs_readably(
    resume_text: str,
    keyword: str,
) -> bool:
    """
    Determine whether a JD keyword appears in readable text form.
    """
    normalized_resume = normalize_ats_text(
        resume_text
    ).lower()

    normalized_keyword = normalize_ats_text(
        keyword
    ).lower().strip()

    if (
        not normalized_resume
        or not normalized_keyword
    ):
        return False

    # Exact phrase first.
    if normalized_keyword in normalized_resume:
        return True

    # Basic separator normalization.
    compact_keyword = re.sub(
        r"[-_/]+",
        " ",
        normalized_keyword,
    )

    compact_resume = re.sub(
        r"[-_/]+",
        " ",
        normalized_resume,
    )

    compact_keyword = re.sub(
        r"\s+",
        " ",
        compact_keyword,
    ).strip()

    compact_resume = re.sub(
        r"\s+",
        " ",
        compact_resume,
    )

    return compact_keyword in compact_resume


def _keyword_readability_score(
    resume: ResumeProfile,
    jd: JDProfile,
) -> ATSComponent:
    """
    Assess whether relevant JD terminology is represented in machine-readable
    text.

    This is intentionally softer than keyword_matcher.py because this metric
    is about ATS readability, not job-fit scoring.
    """
    resume_text = _all_resume_text(
        resume
    )

    jd_keywords = _extract_jd_keywords(
        jd
    )

    if not resume_text:
        return ATSComponent(
            name="keyword_readability",
            score=0.0,
            issues=(
                "No resume text was available for keyword readability analysis.",
            ),
        )

    if not jd_keywords:
        # ATS can still be assessed without a JD, but this analyzer normally
        # has a JD. Keep it neutral rather than fabricating evidence.
        return ATSComponent(
            name="keyword_readability",
            score=70.0,
            issues=(
                "No structured JD keywords were available for readability comparison.",
            ),
        )

    readable_matches = sum(
        1
        for keyword in jd_keywords
        if _keyword_occurs_readably(
            resume_text,
            keyword,
        )
    )

    coverage = (
        readable_matches
        / len(jd_keywords)
    ) * 100.0

    issues: list[str] = []

    if coverage < 40.0:
        issues.append(
            "A large portion of relevant JD terminology is not represented "
            "in straightforward resume text."
        )

    elif coverage < 60.0:
        issues.append(
            "Some relevant JD terminology is missing from readable resume text."
        )

    return ATSComponent(
        name="keyword_readability",
        score=round(
            max(
                0.0,
                min(
                    100.0,
                    coverage,
                ),
            ),
            2,
        ),
        issues=tuple(
            issues
        ),
    )


# ============================================================================
# Content Organization
# ============================================================================

def _has_bullets(
    content: str,
) -> bool:
    if not content:
        return False

    return bool(
        re.search(
            r"(?m)^\s*(?:[-*•▪◦]|(?:\d+[\.)]))\s+",
            content,
        )
    )


def _line_statistics(
    text: str,
) -> tuple[int, int, int]:
    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if not lines:
        return 0, 0, 0

    short_lines = sum(
        1
        for line in lines
        if len(line) <= 90
    )

    bullet_lines = sum(
        1
        for line in lines
        if re.match(
            r"^[-*•▪◦]\s+",
            line,
        )
    )

    return (
        len(lines),
        short_lines,
        bullet_lines,
    )


def _content_organization_score(
    resume: ResumeProfile,
) -> ATSComponent:
    """
    Evaluate how logically the extracted resume content is organized.
    """
    sections = _extract_resume_sections(
        resume
    )

    text = _all_resume_text(
        resume
    )

    if not text:
        return ATSComponent(
            name="content_organization",
            score=15.0,
            issues=(
                "Resume text was not available for organization analysis.",
            ),
        )

    issues: list[str] = []

    score = 100.0

    section_names = [
        section.normalized_name
        for section in sections
        if section.normalized_name
    ]

    if not section_names:
        score -= 35.0

        issues.append(
            "No clear section hierarchy was detected."
        )

    duplicate_names = (
        len(section_names)
        - len(set(section_names))
    )

    if duplicate_names > 0:
        score -= min(
            15.0,
            duplicate_names * 5.0,
        )

        issues.append(
            "Duplicate section headings were detected."
        )

    (
        total_lines,
        short_lines,
        bullet_lines,
    ) = _line_statistics(
        text
    )

    if total_lines > 0:
        short_line_ratio = (
            short_lines
            / total_lines
        )

        if short_line_ratio < 0.40:
            score -= 10.0

            issues.append(
                "Much of the extracted content appears as long continuous lines."
            )

    if sections:
        section_content_count = sum(
            1
            for section in sections
            if section.content.strip()
        )

        if (
            section_content_count
            / len(sections)
            < 0.60
        ):
            score -= 15.0

            issues.append(
                "Several section headings have little or no associated text."
            )

    if bullet_lines == 0:
        score -= 5.0

        issues.append(
            "No conventional bullet formatting was detected in extracted text."
        )

    return ATSComponent(
        name="content_organization",
        score=round(
            max(
                0.0,
                min(
                    100.0,
                    score,
                ),
            ),
            2,
        ),
        issues=tuple(
            issues
        ),
    )


# ============================================================================
# Formatting Analysis
# ============================================================================

def _detect_formatting_issues(
    text: str,
) -> list[str]:
    issues: list[str] = []

    if not text:
        return [
            "No extracted text available for formatting analysis."
        ]

    for (
        _pattern_name,
        pattern,
        message,
    ) in PROBLEMATIC_PATTERNS:
        if pattern.search(text):
            issues.append(
                message
            )

    # Excessive line length.
    lines = [
        line
        for line in text.splitlines()
        if line.strip()
    ]

    if lines:
        extremely_long_lines = sum(
            1
            for line in lines
            if len(line) > 180
        )

        if (
            extremely_long_lines
            / len(lines)
            > 0.10
        ):
            issues.append(
                "A notable number of extracted lines are unusually long."
            )

    # Excessive symbol density can be a signal of noisy formatting.
    characters_without_spaces = sum(
        1
        for char in text
        if not char.isspace()
    )

    symbol_count = sum(
        1
        for char in text
        if not char.isalnum()
        and not char.isspace()
    )

    if characters_without_spaces > 0:
        symbol_ratio = (
            symbol_count
            / characters_without_spaces
        )

        if symbol_ratio > 0.22:
            issues.append(
                "The extracted resume contains relatively high punctuation/symbol density."
            )

    return issues


def _formatting_score(
    resume: ResumeProfile,
) -> ATSComponent:
    text = _resume_raw_text(
        resume
    )

    if not text:
        return ATSComponent(
            name="formatting",
            score=20.0,
            issues=(
                "No raw extracted resume text was available for formatting analysis.",
            ),
        )

    issues = _detect_formatting_issues(
        text
    )

    score = 100.0

    deductions = {
        "Table-like or column-like text detected.": 18.0,
        "Excessive spacing detected.": 8.0,
        "Long decorative punctuation sequence detected.": 8.0,
        "HTML-like markup detected in extracted content.": 12.0,
        "A notable number of extracted lines are unusually long.": 10.0,
        "The extracted resume contains relatively high punctuation/symbol density.": 8.0,
    }

    for issue in issues:
        score -= deductions.get(
            issue,
            5.0,
        )

    return ATSComponent(
        name="formatting",
        score=round(
            max(
                0.0,
                min(
                    100.0,
                    score,
                ),
            ),
            2,
        ),
        issues=tuple(
            issues
        ),
    )


# ============================================================================
# Role / Section Relevance
# ============================================================================

def _role_related_sections_score(
    resume: ResumeProfile,
    jd: JDProfile,
) -> ATSComponent:
    """
    Check whether the resume contains the major sections normally expected
    for a role application.

    This is not a job-fit score. It only checks whether role-relevant content
    appears in recognizable resume structures.
    """
    sections = _extract_resume_sections(
        resume
    )

    if not sections:
        return ATSComponent(
            name="role_relevance",
            score=40.0,
            issues=(
                "Structured resume sections were not available for role-oriented ATS analysis.",
            ),
        )

    normalized_names = {
        section.normalized_name
        for section in sections
        if section.normalized_name
    }

    score = 100.0
    issues: list[str] = []

    # Skills are highly useful for ATS parsing.
    skill_aliases = {
        "skills",
        "technical skills",
    }

    if not (
        normalized_names
        & skill_aliases
    ):
        score -= 25.0

        issues.append(
            "A dedicated skills section was not clearly detected."
        )

    # Experience or project evidence is useful for most applications.
    experience_aliases = {
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "internship",
        "internships",
        "projects",
        "project",
    }

    if not (
        normalized_names
        & experience_aliases
    ):
        score -= 25.0

        issues.append(
            "No clear experience, internship, or projects section was detected."
        )

    # Education is normally expected.
    if "education" not in normalized_names:
        score -= 20.0

        issues.append(
            "A clear education section was not detected."
        )

    return ATSComponent(
        name="role_relevance",
        score=round(
            max(
                0.0,
                min(
                    100.0,
                    score,
                ),
            ),
            2,
        ),
        issues=tuple(
            issues
        ),
    )


# ============================================================================
# Overall ATS Calculation
# ============================================================================

def _combine_components(
    components: Sequence[ATSComponent],
) -> float:
    """
    Combine ATS components.

    We intentionally keep ATS independent from the analyzer's role-fit score.
    """
    weights = {
        "section_presence": 0.20,
        "section_clarity": 0.15,
        "keyword_readability": 0.25,
        "content_organization": 0.15,
        "formatting": 0.15,
        "role_relevance": 0.10,
    }

    weighted_total = 0.0
    total_weight = 0.0

    for component in components:
        weight = weights.get(
            component.name,
            0.0,
        )

        if weight <= 0:
            continue

        weighted_total += (
            component.score
            * weight
        )

        total_weight += weight

    if total_weight == 0:
        return 0.0

    return round(
        weighted_total
        / total_weight,
        2,
    )


def _collect_issues(
    components: Sequence[ATSComponent],
) -> list[str]:
    issues: list[str] = []

    for component in components:
        for issue in component.issues:
            if issue not in issues:
                issues.append(
                    issue
                )

    return issues


def _build_explanation(
    score: float,
    components: Sequence[ATSComponent],
    issues: Sequence[str],
) -> str:
    component_lookup = {
        component.name: component.score
        for component in components
    }

    section_score = component_lookup.get(
        "section_presence",
        0.0,
    )

    keyword_score = component_lookup.get(
        "keyword_readability",
        0.0,
    )

    formatting_score = component_lookup.get(
        "formatting",
        0.0,
    )

    organization_score = component_lookup.get(
        "content_organization",
        0.0,
    )

    if score >= 85:
        level = "strong"

    elif score >= 70:
        level = "good"

    elif score >= 50:
        level = "moderate"

    else:
        level = "needs attention"

    explanation = (
        f"ATS readiness is {level} at {score:.1f}/100. "
        f"Section structure scored {section_score:.1f}, "
        f"keyword readability scored {keyword_score:.1f}, "
        f"content organization scored {organization_score:.1f}, "
        f"and formatting scored {formatting_score:.1f}."
    )

    if issues:
        explanation += (
            " Detected ATS issues were identified from the extracted "
            "resume structure and text."
        )

    return explanation


# ============================================================================
# Public API
# ============================================================================

def score_ats(
    resume: ResumeProfile,
    jd: JDProfile,
) -> ATSAnalysis:
    """
    Calculate deterministic ATS readiness.

    Important:
        - No LLM is used.
        - No external API is used.
        - ATS score does not replace role-fit score.
        - Missing skills are NOT inferred from ATS formatting.
    """
    sections = _extract_resume_sections(
        resume
    )

    components = [
        _section_presence_score(
            sections
        ),
        _section_clarity_score(
            sections
        ),
        _keyword_readability_score(
            resume,
            jd,
        ),
        _content_organization_score(
            resume
        ),
        _formatting_score(
            resume
        ),
        _role_related_sections_score(
            resume,
            jd,
        ),
    ]

    final_score = _combine_components(
        components
    )

    final_score = round(
        max(
            MIN_ATS_SCORE,
            min(
                MAX_ATS_SCORE,
                final_score,
            ),
        ),
        2,
    )

    # ------------------------------------------------------------------------
    # IMPORTANT SCHEMA BOUNDARY
    #
    # ATSAnalysis currently defines the score fields as integers.
    # Keep decimal precision during the internal calculations above, then
    # convert only at the Pydantic model boundary.
    # ------------------------------------------------------------------------

    section_presence_score = next(
        component.score
        for component in components
        if component.name
        == "section_presence"
    )

    section_clarity_score = next(
        component.score
        for component in components
        if component.name
        == "section_clarity"
    )

    keyword_readability_score = next(
        component.score
        for component in components
        if component.name
        == "keyword_readability"
    )

    content_organization_score = next(
        component.score
        for component in components
        if component.name
        == "content_organization"
    )

    formatting_score = next(
        component.score
        for component in components
        if component.name
        == "formatting"
    )

    structure_score = round(
        (
            section_presence_score
            * 0.55
        )
        + (
            section_clarity_score
            * 0.45
        ),
        2,
    )

    final_score_int = int(
        round(final_score)
    )

    structure_score_int = int(
        round(structure_score)
    )

    section_clarity_score_int = int(
        round(section_clarity_score)
    )

    keyword_readability_score_int = int(
        round(keyword_readability_score)
    )

    content_organization_score_int = int(
        round(content_organization_score)
    )

    formatting_score_int = int(
        round(formatting_score)
    )

    issues = _collect_issues(
        components
    )

    return ATSAnalysis(
        score=final_score_int,
        structure_score=structure_score_int,
        section_clarity_score=section_clarity_score_int,
        keyword_readability_score=keyword_readability_score_int,
        content_organization_score=content_organization_score_int,
        formatting_score=formatting_score_int,
        detected_issues=issues,
        explanation=_build_explanation(
            score=final_score,
            components=components,
            issues=issues,
        ),
    )


def calculate_ats_from_text(
    resume_text: str,
    jd_text: str,
) -> dict[str, object]:
    """
    Lightweight text-only ATS diagnostic.

    Useful for tests and debugging when structured ResumeProfile/JDProfile
    objects are not available.
    """
    resume_text = normalize_ats_text(
        resume_text
    )

    jd_text = normalize_ats_text(
        jd_text
    )

    if not resume_text:
        return {
            "score": 0.0,
            "structure_score": 0.0,
            "section_clarity_score": 0.0,
            "keyword_readability_score": 0.0,
            "content_organization_score": 0.0,
            "formatting_score": 0.0,
            "detected_issues": [
                "Resume text is empty."
            ],
            "explanation": (
                "ATS readiness could not be reliably calculated "
                "because resume text is empty."
            ),
        }

    formatting_issues = _detect_formatting_issues(
        resume_text
    )

    formatting_score = 100.0

    formatting_deductions = {
        "Table-like or column-like text detected.": 18.0,
        "Excessive spacing detected.": 8.0,
        "Long decorative punctuation sequence detected.": 8.0,
        "HTML-like markup detected in extracted content.": 12.0,
        "A notable number of extracted lines are unusually long.": 10.0,
        "The extracted resume contains relatively high punctuation/symbol density.": 8.0,
    }

    for issue in formatting_issues:
        formatting_score -= formatting_deductions.get(
            issue,
            5.0,
        )

    formatting_score = round(
        max(
            0.0,
            min(
                100.0,
                formatting_score,
            ),
        ),
        2,
    )

    # Basic section detection.
    known_sections = [
        section
        for section in EXPECTED_SECTIONS
        if re.search(
            rf"(?im)^\s*{re.escape(section)}\s*:?\s*$",
            resume_text,
        )
    ]

    # Some documents lose line boundaries during parsing, so also inspect
    # headings surrounded by whitespace.
    if not known_sections:
        for section in EXPECTED_SECTIONS:
            if re.search(
                rf"(?i)\b{re.escape(section)}\b",
                resume_text,
            ):
                known_sections.append(
                    section
                )

    unique_sections = _unique_keep_order(
        known_sections
    )

    section_score = round(
        min(
            100.0,
            (
                len(unique_sections)
                / 7.0
            ) * 100.0,
        ),
        2,
    )

    if jd_text:
        jd_terms = [
            term
            for term in re.findall(
                r"\b[a-zA-Z][a-zA-Z0-9+#.-]{2,}\b",
                jd_text.lower(),
            )
            if term
            not in {
                "the",
                "and",
                "for",
                "with",
                "you",
                "your",
                "are",
                "will",
                "from",
                "this",
                "that",
            }
        ]

        jd_terms = _unique_keep_order(
            jd_terms
        )

        readable_matches = sum(
            1
            for term in jd_terms
            if _keyword_occurs_readably(
                resume_text,
                term,
            )
        )

        if jd_terms:
            keyword_score = round(
                (
                    readable_matches
                    / len(jd_terms)
                )
                * 100.0,
                2,
            )

        else:
            keyword_score = 70.0

    else:
        keyword_score = 70.0

    lines = [
        line.strip()
        for line in resume_text.splitlines()
        if line.strip()
    ]

    bullet_count = sum(
        1
        for line in lines
        if re.match(
            r"^[-*•▪◦]\s+",
            line,
        )
    )

    if not lines:
        organization_score = 0.0

    else:
        organization_score = 70.0

        if bullet_count > 0:
            organization_score += 15.0

        if len(unique_sections) >= 4:
            organization_score += 15.0

        organization_score = min(
            100.0,
            organization_score,
        )

    structure_score = section_score

    final_score = round(
        (
            structure_score * 0.20
            + min(
                keyword_score,
                100.0,
            ) * 0.25
            + organization_score * 0.15
            + formatting_score * 0.15
            + section_score * 0.15
            + 70.0 * 0.10
        ),
        2,
    )

    issues = list(
        formatting_issues
    )

    if section_score < 60:
        issues.append(
            "Resume section structure appears incomplete."
        )

    if keyword_score < 50:
        issues.append(
            "Resume contains limited readable overlap with the JD text."
        )

    if bullet_count == 0:
        issues.append(
            "No conventional bullet formatting was detected."
        )

    issues = _unique_keep_order(
        issues
    )

    explanation = (
        f"Text-only ATS diagnostic score is {final_score:.1f}/100. "
        f"Detected section structure, readable terminology, content "
        f"organization, and formatting were used for the estimate."
    )

    return {
        "score": final_score,
        "structure_score": round(
            structure_score,
            2,
        ),
        "section_clarity_score": round(
            section_score,
            2,
        ),
        "keyword_readability_score": round(
            min(
                100.0,
                keyword_score,
            ),
            2,
        ),
        "content_organization_score": round(
            organization_score,
            2,
        ),
        "formatting_score": formatting_score,
        "detected_issues": issues,
        "explanation": explanation,
    }


# ============================================================================
# Diagnostic Utilities
# ============================================================================

def get_detected_resume_sections(
    resume: ResumeProfile,
) -> list[str]:
    """
    Return normalized section names detected from the resume.
    """
    sections = _extract_resume_sections(
        resume
    )

    return [
        section.normalized_name
        for section in sections
        if section.normalized_name
    ]


def get_ats_issues(
    resume: ResumeProfile,
    jd: JDProfile,
) -> list[str]:
    """
    Return only detected ATS issues.
    """
    analysis = score_ats(
        resume,
        jd,
    )

    return list(
        analysis.detected_issues
    )


def get_ats_component_scores(
    resume: ResumeProfile,
    jd: JDProfile,
) -> dict[str, float]:
    """
    Return individual ATS component scores for diagnostics and testing.
    """
    sections = _extract_resume_sections(
        resume
    )

    components = [
        _section_presence_score(
            sections
        ),
        _section_clarity_score(
            sections
        ),
        _keyword_readability_score(
            resume,
            jd,
        ),
        _content_organization_score(
            resume
        ),
        _formatting_score(
            resume
        ),
        _role_related_sections_score(
            resume,
            jd,
        ),
    ]

    return {
        component.name: component.score
        for component in components
    }


# ============================================================================
# Validation
# ============================================================================

def validate_ats_analysis(
    analysis: ATSAnalysis,
) -> None:
    """
    Validate ATSAnalysis values and prevent impossible output.
    """
    numeric_fields = {
        "score": analysis.score,
        "structure_score": analysis.structure_score,
        "section_clarity_score": analysis.section_clarity_score,
        "keyword_readability_score": analysis.keyword_readability_score,
        "content_organization_score": analysis.content_organization_score,
        "formatting_score": analysis.formatting_score,
    }

    for field_name, value in numeric_fields.items():
        if not (
            MIN_ATS_SCORE
            <= value
            <= MAX_ATS_SCORE
        ):
            raise ValueError(
                f"{field_name} must be between 0 and 100."
            )

    if not isinstance(
        analysis.detected_issues,
        list,
    ):
        raise ValueError(
            "detected_issues must be a list."
        )

    if not isinstance(
        analysis.explanation,
        str,
    ):
        raise ValueError(
            "ATS explanation must be a string."
        )

    # Current ATS schema stores these numeric fields as integers.
    for field_name, value in numeric_fields.items():
        if not isinstance(
            value,
            int,
        ):
            raise ValueError(
                f"{field_name} must be an integer."
            )