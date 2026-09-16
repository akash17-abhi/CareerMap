from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

from services.skill_extractor import (
    DetectedSkill,
    detect_skills,
)
from services.text_preprocessor import (
    normalize_section_header,
    preprocess_text,
)


# ============================================================
# DATA MODELS
# ============================================================


RequirementType = (
    "required"
    "preferred"
    "responsibility"
    "qualification"
    "tool"
    "general"
)


@dataclass(frozen=True)
class JDRequirement:
    """
    A single structured requirement extracted from the job
    description.
    """

    id: str
    text: str
    requirement_type: str
    priority: str


@dataclass(frozen=True)
class JDSection:
    """
    A logical section of the job description.
    """

    name: str
    raw_text: str
    lines: tuple[str, ...]


@dataclass(frozen=True)
class JDSkillRequirement:
    """
    A canonical skill detected in the JD together with its
    role relevance and importance.
    """

    skill: DetectedSkill
    priority: str
    requirement_type: str
    explicitly_required: bool


@dataclass(frozen=True)
class JDProfile:
    """
    Structured local representation of a Job Description.

    This is extraction only.
    It does not calculate candidate fit.
    """

    raw_text: str
    job_title: str | None
    sections: tuple[JDSection, ...]
    required_skills: tuple[JDSkillRequirement, ...]
    preferred_skills: tuple[JDSkillRequirement, ...]
    all_skills: tuple[JDSkillRequirement, ...]
    requirements: tuple[JDRequirement, ...]
    responsibilities: tuple[str, ...]
    education_requirements: tuple[str, ...]
    experience_requirements: tuple[str, ...]
    tools: tuple[str, ...]
    keywords: tuple[str, ...]


# ============================================================
# SECTION NORMALIZATION
# ============================================================


SECTION_ALIASES: dict[str, str] = {
    "about the role": "role_overview",
    "about us": "role_overview",
    "job overview": "role_overview",
    "role overview": "role_overview",
    "overview": "role_overview",
    "description": "role_overview",
    "job description": "role_overview",

    "responsibilities": "responsibilities",
    "key responsibilities": "responsibilities",
    "roles and responsibilities": "responsibilities",
    "what you will do": "responsibilities",
    "what you'll do": "responsibilities",
    "what you’ll do": "responsibilities",

    "requirements": "requirements",
    "required qualifications": "required_qualifications",
    "qualifications": "required_qualifications",
    "required skills": "required_qualifications",
    "must have": "required_qualifications",
    "what we need": "required_qualifications",

    "preferred qualifications": "preferred_qualifications",
    "preferred skills": "preferred_qualifications",
    "nice to have": "preferred_qualifications",
    "nice-to-have": "preferred_qualifications",
    "good to have": "preferred_qualifications",

    "ideal candidate profile": "ideal_candidate",
    "ideal candidate": "ideal_candidate",

    "experience": "experience",
    "work experience": "experience",
    "experience requirements": "experience",

    "education": "education",
    "educational qualifications": "education",
    "academic qualifications": "education",

    "tools": "tools",
    "technologies": "tools",
    "technology": "tools",
    "tech stack": "tools",

    "skills": "skills",
    "technical skills": "skills",
    "core skills": "skills",
}


SECTION_VALUES = frozenset(SECTION_ALIASES.values())


# ============================================================
# PRIORITY MARKERS
# ============================================================


HIGH_PRIORITY_MARKERS = (
    "required",
    "must",
    "must have",
    "must-have",
    "mandatory",
    "essential",
    "strong proficiency",
    "solid understanding",
    "required qualifications",
    "required skills",
    "minimum",
    "need to",
    "needs to",
    "should have",
)


PREFERRED_PRIORITY_MARKERS = (
    "preferred",
    "nice to have",
    "nice-to-have",
    "good to have",
    "plus",
    "bonus",
    "desirable",
    "preferred qualifications",
)


# ============================================================
# JOB-TITLE SIGNALS
# ============================================================


TITLE_ROLE_TERMS = (
    "engineer",
    "developer",
    "analyst",
    "scientist",
    "architect",
    "administrator",
    "consultant",
    "designer",
    "manager",
    "specialist",
    "intern",
    "researcher",
    "technician",
    "programmer",
    "devops",
    "qa",
    "tester",
    "lead",
    "associate",
    "executive",
    "coordinator",
)

TITLE_METADATA_PREFIXES = (
    "location",
    "job type",
    "employment type",
    "experience",
    "salary",
    "department",
    "team",
    "date posted",
    "posted",
    "job id",
    "reference",
    "ref",
    "remote",
    "work mode",
    "workplace",
    "company",
    "organization",
    "organisation",
    "about us",
    "description",
    "job description",
    "requirements",
    "qualifications",
    "responsibilities",
    "skills",
    "technical skills",
    "education",
    "experience requirements",
)

NON_JD_CODE_LINES = (
    "from __future__ import",
    "import ",
    "def ",
    "class ",
    "if __name__",
    "return ",
    "async def ",
    "await ",
    "raise ",
    "try:",
    "except ",
    "print(",
)


# ============================================================
# HELPERS
# ============================================================


def _clean_line(line: str) -> str:
    return re.sub(
        r"\s+",
        " ",
        str(line).strip(),
    )


def _non_empty_lines(text: str) -> list[str]:
    return [
        _clean_line(line)
        for line in text.splitlines()
        if _clean_line(line)
    ]


def _normalize_for_compare(text: str) -> str:
    return re.sub(
        r"\s+",
        " ",
        text.casefold().strip(),
    )


def _canonical_section_name(name: str) -> str:
    normalized = normalize_section_header(name)
    normalized = _normalize_for_compare(normalized)

    return SECTION_ALIASES.get(
        normalized,
        normalized,
    )


def _strip_bullet(line: str) -> str:
    return re.sub(
        r"^\s*(?:[-•●▪◦‣⁃∙·➢➤◆■*+])\s*",
        "",
        str(line).strip(),
    ).strip()


def _is_bullet(line: str) -> bool:
    return bool(
        re.match(
            r"^\s*(?:[-•●▪◦‣⁃∙·➢➤◆■*+])\s*",
            str(line),
        )
    )


def _contains_any(
    text: str,
    markers: Iterable[str],
) -> bool:
    lowered = text.casefold()

    return any(
        marker.casefold() in lowered
        for marker in markers
    )


def _priority_from_text(text: str) -> str:
    """
    Determine requirement importance conservatively.

    This is only a local requirement classification. It does not
    decide candidate fit.
    """

    lowered = text.casefold()

    if any(
        marker.casefold() in lowered
        for marker in HIGH_PRIORITY_MARKERS
    ):
        return "high"

    if any(
        marker.casefold() in lowered
        for marker in PREFERRED_PRIORITY_MARKERS
    ):
        return "medium"

    return "medium"


def _requirement_type_from_section(
    section_name: str,
) -> str:
    if section_name == "responsibilities":
        return "responsibility"

    if section_name == "preferred_qualifications":
        return "preferred"

    if section_name == "required_qualifications":
        return "qualification"

    if section_name == "education":
        return "qualification"

    if section_name == "experience":
        return "qualification"

    if section_name == "tools":
        return "tool"

    return "general"


def _is_code_like_line(line: str) -> bool:
    """
    Guard against source-code text accidentally entering the JD
    field. A code line must never become the displayed job title.
    """

    cleaned = _clean_line(line)
    lowered = cleaned.casefold()

    if any(
        lowered.startswith(prefix.casefold())
        for prefix in NON_JD_CODE_LINES
    ):
        return True

    if re.search(
        r"[{}();]\s*$",
        cleaned,
    ) and (
        "=" in cleaned
        or "==" in cleaned
        or "->" in cleaned
    ):
        return True

    return False


def _looks_like_title(line: str) -> bool:
    """
    Detect a plausible job title without accepting arbitrary
    first-line content.
    """

    candidate = _clean_line(
        line.strip("# ").strip(),
    )

    if not candidate:
        return False

    if len(candidate) < 3 or len(candidate) > 100:
        return False

    if _is_code_like_line(candidate):
        return False

    lowered = candidate.casefold()

    if any(
        lowered.startswith(f"{prefix.casefold()}:")
        or lowered.startswith(f"{prefix.casefold()} -")
        or lowered.startswith(f"{prefix.casefold()} |")
        for prefix in TITLE_METADATA_PREFIXES
    ):
        return False

    if _canonical_section_name(candidate) in SECTION_VALUES:
        return False

    if "@" in candidate:
        return False

    if re.search(
        r"https?://|www\.",
        candidate,
        flags=re.IGNORECASE,
    ):
        return False

    if any(
        re.search(
            rf"\b{re.escape(term)}\b",
            lowered,
            flags=re.IGNORECASE,
        )
        for term in TITLE_ROLE_TERMS
    ):
        return True

    if (
        "|" in candidate
        or "—" in candidate
        or "–" in candidate
        or re.match(
            r"^(?:senior|sr\.?|junior|jr\.?|lead|principal|associate|entry[- ]level|mid[- ]level)\b",
            lowered,
            flags=re.IGNORECASE,
        )
    ):
        return True

    return False


# ============================================================
# JD SECTION EXTRACTION
# ============================================================


def extract_jd_sections(
    text: str,
) -> tuple[JDSection, ...]:
    """
    Extract logical JD sections.

    Known headings are recognized in plain text, Markdown, and
    trailing-colon formats. Unknown headings remain part of the
    current general section.
    """

    processed_text = preprocess_text(
        text,
    )

    if not processed_text:
        return ()

    sections: list[JDSection] = []

    current_name = "general"
    current_lines: list[str] = []

    def flush_section() -> None:
        nonlocal current_lines

        if not current_lines:
            return

        cleaned_lines = tuple(
            _clean_line(line)
            for line in current_lines
            if _clean_line(line)
        )

        if not cleaned_lines:
            current_lines = []
            return

        sections.append(
            JDSection(
                name=_canonical_section_name(
                    current_name,
                ),
                raw_text="\n".join(cleaned_lines),
                lines=cleaned_lines,
            )
        )

        current_lines = []

    for line in processed_text.splitlines():
        stripped = _clean_line(line)

        if not stripped:
            continue

        heading = stripped.lstrip("#").strip()
        canonical_heading = _canonical_section_name(
            heading.rstrip(":").strip(),
        )

        if canonical_heading in SECTION_VALUES:
            flush_section()
            current_name = canonical_heading
            continue

        if stripped.endswith(":"):
            colon_heading = stripped[:-1].strip()
            canonical_heading = _canonical_section_name(
                colon_heading,
            )

            if canonical_heading in SECTION_VALUES:
                flush_section()
                current_name = canonical_heading
                continue

        current_lines.append(
            stripped,
        )

    flush_section()

    return tuple(
        sections,
    )


# ============================================================
# JOB TITLE
# ============================================================




def _clean_title_candidate(value: str) -> str:
    """Remove embedded JD metadata that can be attached to a title line."""
    value = _clean_line(value)
    if not value:
        return ""

    # Handle both spaced and unspaced forms, e.g.
    # "Junior AI Engineer/Software Developer (Entry-Level)Location: Kolkata".
    stop_pattern = (
        r"(?i)(?:location|job\s*type|employment\s*type|experience|"
        r"salary|department|remote|work\s*mode)\s*:"
    )
    value = re.split(stop_pattern, value, maxsplit=1)[0]
    value = re.sub(r"[|]+$", "", value)
    return value.strip(" -|,;:")

def extract_job_title(
    text: str,
    sections: Iterable[JDSection],
) -> str | None:
    """
    Extract a likely job title.

    Priority:
        1. Explicit Job Title / Position / Role / Title metadata.
        2. A role-like line near the beginning.
        3. A role-like line in opening/general content.

    Returning None is safer than turning arbitrary text or source
    code into a job title.
    """

    processed_text = preprocess_text(
        text,
    )

    lines = _non_empty_lines(
        processed_text,
    )

    explicit_patterns = (
        r"^\s*job\s*title\s*:\s*(.+)$",
        r"^\s*position\s*:\s*(.+)$",
        r"^\s*role\s*:\s*(.+)$",
        r"^\s*title\s*:\s*(.+)$",
    )

    for line in lines[:20]:
        if _is_code_like_line(line):
            continue

        for pattern in explicit_patterns:
            match = re.match(
                pattern,
                line,
                flags=re.IGNORECASE,
            )

            if not match:
                continue

            candidate = _clean_title_candidate(
                match.group(1),
            )

            if _looks_like_title(candidate):
                return candidate

    for line in lines[:15]:
        candidate = _clean_title_candidate(
            line.strip("# ").strip(),
        )

        if _looks_like_title(candidate):
            return candidate

    for section in sections:
        if section.name not in {
            "general",
            "role_overview",
        }:
            continue

        for line in section.lines[:15]:
            candidate = _clean_title_candidate(
                line.strip("# ").strip(),
            )

            if _looks_like_title(candidate):
                return candidate

    return None


# ============================================================
# REQUIREMENTS
# ============================================================


def extract_requirements(
    sections: Iterable[JDSection],
) -> tuple[JDRequirement, ...]:
    """
    Convert requirement-like JD lines into structured records.
    """

    requirements: list[JDRequirement] = []
    counter = 1

    allowed_sections = {
        "required_qualifications",
        "preferred_qualifications",
        "requirements",
        "ideal_candidate",
        "general",
        "role_overview",
        "responsibilities",
        "experience",
        "education",
        "tools",
        "skills",
    }

    for section in sections:
        if section.name not in allowed_sections:
            continue

        section_type = _requirement_type_from_section(
            section.name,
        )

        for line in section.lines:
            cleaned = _strip_bullet(line)

            if not cleaned:
                continue

            priority = _priority_from_text(cleaned)
            requirement_type = section_type

            if (
                requirement_type == "general"
                and _contains_any(
                    cleaned,
                    PREFERRED_PRIORITY_MARKERS,
                )
            ):
                priority = "medium"
                requirement_type = "preferred"

            elif (
                requirement_type == "general"
                and _contains_any(
                    cleaned,
                    HIGH_PRIORITY_MARKERS,
                )
            ):
                priority = "high"

            requirements.append(
                JDRequirement(
                    id=f"requirement-{counter}",
                    text=cleaned,
                    requirement_type=requirement_type,
                    priority=priority,
                )
            )

            counter += 1

    return tuple(
        requirements,
    )


# ============================================================
# SKILL REQUIREMENTS
# ============================================================


def _build_jd_skill_requirement(
    detected_skill: DetectedSkill,
    section: JDSection,
    line: str,
) -> JDSkillRequirement:
    """
    Convert a detected skill into a JD requirement record.
    """

    requirement_type = _requirement_type_from_section(
        section.name,
    )

    priority = _priority_from_text(line)

    explicitly_required = (
        priority == "high"
        or section.name in {
            "required_qualifications",
            "requirements",
        }
    )

    if section.name == "preferred_qualifications":
        priority = "medium"
        explicitly_required = False

    return JDSkillRequirement(
        skill=detected_skill,
        priority=priority,
        requirement_type=requirement_type,
        explicitly_required=explicitly_required,
    )


def extract_jd_skills(
    sections: Iterable[JDSection],
    *,
    full_text: str = "",
) -> tuple[JDSkillRequirement, ...]:
    """
    Detect canonical skills throughout the JD and classify their
    role relevance.

    Section-level detection is followed by a full-document fallback
    so weakly structured JDs still produce usable skill requirements.
    """

    results: dict[str, JDSkillRequirement] = {}
    sections_list = list(sections)

    priority_rank = {
        "high": 3,
        "medium": 2,
        "low": 1,
    }

    for section in sections_list:
        for line in section.lines:
            detected_skills = detect_skills(line)

            for skill in detected_skills:
                requirement = _build_jd_skill_requirement(
                    detected_skill=skill,
                    section=section,
                    line=line,
                )

                existing = results.get(skill.id)

                if existing is None:
                    results[skill.id] = requirement
                    continue

                existing_rank = priority_rank.get(
                    existing.priority,
                    1,
                )
                new_rank = priority_rank.get(
                    requirement.priority,
                    1,
                )

                if new_rank > existing_rank:
                    results[skill.id] = requirement
                elif (
                    requirement.explicitly_required
                    and not existing.explicitly_required
                ):
                    results[skill.id] = requirement

    source_text = (
        preprocess_text(full_text)
        if full_text
        else ""
    )

    if source_text:
        for skill in detect_skills(source_text):
            if skill.id in results:
                continue

            results[skill.id] = JDSkillRequirement(
                skill=skill,
                priority="medium",
                requirement_type="general",
                explicitly_required=True,
            )

    return tuple(
        results.values(),
    )


# ============================================================
# RESPONSIBILITIES
# ============================================================


def extract_responsibilities(
    sections: Iterable[JDSection],
) -> tuple[str, ...]:
    responsibilities: list[str] = []

    for section in sections:
        if section.name != "responsibilities":
            continue

        responsibilities.extend(
            _strip_bullet(line)
            for line in section.lines
            if _strip_bullet(line)
        )

    return tuple(
        dict.fromkeys(
            responsibilities,
        ),
    )


# ============================================================
# EDUCATION REQUIREMENTS
# ============================================================


def extract_education_requirements(
    sections: Iterable[JDSection],
) -> tuple[str, ...]:
    education: list[str] = []

    education_markers = (
        "b.tech",
        "btech",
        "b.e.",
        "b.e ",
        "bachelor",
        "degree",
        "diploma",
        "education",
        "computer science",
        "engineering",
        "qualification",
        "graduation",
        "graduate",
        "master",
        "m.tech",
        "mtech",
        "m.s.",
        "ms ",
    )

    for section in sections:
        if section.name == "education":
            education.extend(
                _strip_bullet(line)
                for line in section.lines
                if _strip_bullet(line)
            )

    if not education:
        for section in sections:
            if section.name not in {
                "required_qualifications",
                "requirements",
                "general",
                "role_overview",
            }:
                continue

            for line in section.lines:
                cleaned = _strip_bullet(line)
                lowered = cleaned.casefold()

                if any(
                    marker in lowered
                    for marker in education_markers
                ):
                    education.append(cleaned)

    return tuple(
        dict.fromkeys(
            education,
        ),
    )


# ============================================================
# EXPERIENCE REQUIREMENTS
# ============================================================


def extract_experience_requirements(
    sections: Iterable[JDSection],
) -> tuple[str, ...]:
    experience: list[str] = []

    for section in sections:
        if section.name != "experience":
            continue

        experience.extend(
            _strip_bullet(line)
            for line in section.lines
            if _strip_bullet(line)
        )

    if not experience:
        for section in sections:
            for line in section.lines:
                cleaned = _strip_bullet(line)
                lowered = cleaned.casefold()

                has_year_range = bool(
                    re.search(
                        r"\b\d+\s*[-–]\s*\d+\s*(?:years?|yrs?)\b",
                        lowered,
                    )
                )

                has_single_year_value = bool(
                    re.search(
                        r"\b\d+\+?\s*(?:years?|yrs?)\b",
                        lowered,
                    )
                )

                has_entry_level_marker = bool(
                    re.search(
                        r"\b(?:fresher|entry[- ]level|graduate|new grad|0[-– ]?1\s*years?)\b",
                        lowered,
                    )
                )

                if (
                    (
                        "experience" in lowered
                        and (
                            has_year_range
                            or has_single_year_value
                        )
                    )
                    or has_entry_level_marker
                ):
                    experience.append(cleaned)

    return tuple(
        dict.fromkeys(
            experience,
        ),
    )


# ============================================================
# TOOLS
# ============================================================


def extract_tools(
    sections: Iterable[JDSection],
) -> tuple[str, ...]:
    """
    Extract tool/technology lines.

    Canonical skill detection is handled separately.
    """

    tools: list[str] = []

    for section in sections:
        if section.name != "tools":
            continue

        tools.extend(
            _strip_bullet(line)
            for line in section.lines
            if _strip_bullet(line)
        )

    return tuple(
        dict.fromkeys(
            tools,
        ),
    )


# ============================================================
# KEYWORD EXTRACTION
# ============================================================


def extract_keywords(
    text: str,
    skills: Iterable[JDSkillRequirement],
) -> tuple[str, ...]:
    """
    Build an initial local keyword set.

    Canonical skills are always included. Additional short phrases
    are collected conservatively from the JD.
    """

    keywords: list[str] = []

    for skill_requirement in skills:
        keywords.append(
            skill_requirement.skill.name,
        )

        for evidence in skill_requirement.skill.evidence[:3]:
            matched_text = _clean_line(
                evidence.matched_text,
            )

            if matched_text:
                keywords.append(
                    matched_text,
                )

    processed_text = preprocess_text(text)

    for line in processed_text.splitlines():
        cleaned = _strip_bullet(line)

        if not cleaned:
            continue

        matches = re.findall(
            r"\b[A-Za-z][A-Za-z0-9+#.&/\-]{2,}"
            r"(?:\s+[A-Za-z][A-Za-z0-9+#.&/\-]{2,}){0,4}\b",
            cleaned,
        )

        for match in matches:
            phrase = re.sub(
                r"\s+",
                " ",
                match,
            ).strip()

            if len(phrase) < 3:
                continue

            if _is_code_like_line(phrase):
                continue

            keywords.append(phrase)

    unique_keywords: list[str] = []
    seen: set[str] = set()

    for keyword in keywords:
        normalized = keyword.casefold().strip()

        if normalized in seen:
            continue

        seen.add(normalized)
        unique_keywords.append(keyword)

    return tuple(
        unique_keywords,
    )


# ============================================================
# COMPLETE JD EXTRACTION
# ============================================================


def extract_jd_profile(
    text: str,
) -> JDProfile:
    """
    Build the complete structured local representation of a JD.

    No candidate matching is performed here.
    No Gemini request is performed here.
    """

    if not isinstance(text, str):
        raise TypeError(
            "Job description text must be a string."
        )

    processed_text = preprocess_text(text)

    if not processed_text.strip():
        raise ValueError(
            "Job description text is empty after preprocessing."
        )

    sections = extract_jd_sections(
        processed_text,
    )

    if not sections:
        raise ValueError(
            "No usable job-description content could be identified."
        )

    job_title = extract_job_title(
        processed_text,
        sections,
    )

    requirements = extract_requirements(
        sections,
    )

    all_skills = extract_jd_skills(
        sections,
        full_text=processed_text,
    )

    required_skills = tuple(
        skill
        for skill in all_skills
        if skill.explicitly_required
    )

    preferred_skills = tuple(
        skill
        for skill in all_skills
        if not skill.explicitly_required
    )

    responsibilities = extract_responsibilities(
        sections,
    )

    education_requirements = extract_education_requirements(
        sections,
    )

    experience_requirements = extract_experience_requirements(
        sections,
    )

    tools = extract_tools(
        sections,
    )

    keywords = extract_keywords(
        text=processed_text,
        skills=all_skills,
    )

    return JDProfile(
        raw_text=processed_text,
        job_title=job_title,
        sections=sections,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        all_skills=all_skills,
        requirements=requirements,
        responsibilities=responsibilities,
        education_requirements=education_requirements,
        experience_requirements=experience_requirements,
        tools=tools,
        keywords=keywords,
    )
