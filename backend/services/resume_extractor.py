from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

from services.skill_extractor import (
    DetectedSkill,
    SkillEvidence,
    detect_skills,
)
from services.text_preprocessor import (
    normalize_section_header,
    preprocess_text,
    split_into_sections,
)


# ============================================================
# DATA MODELS
# ============================================================


@dataclass(frozen=True)
class ResumeSection:
    """
    A structured resume section.

    name:
        Canonical/local section name.

    raw_text:
        Original-ish section text after conservative preprocessing.

    lines:
        Individual non-empty lines from the section.
    """

    name: str
    raw_text: str
    lines: tuple[str, ...]


@dataclass(frozen=True)
class ResumeExperienceEntry:
    """
    A detected experience/internship entry.
    """

    organization: str
    role: str
    dates: str | None
    description: str
    lines: tuple[str, ...]


@dataclass(frozen=True)
class ResumeProjectEntry:
    """
    A detected project entry.
    """

    name: str
    technologies: tuple[str, ...]
    description: str
    lines: tuple[str, ...]


@dataclass(frozen=True)
class ResumeEducationEntry:
    """
    A detected education entry.
    """

    institution: str
    qualification: str
    dates: str | None
    grade: str | None
    description: str


@dataclass(frozen=True)
class ResumeCertificationEntry:
    """
    A detected certification/course entry.
    """

    name: str
    organization: str | None
    date_or_duration: str | None
    description: str


@dataclass(frozen=True)
class ResumeSkillEvidence:
    """
    A canonical skill plus where it was found.

    This is intentionally extraction-focused.

    The later evidence/scoring engine will decide how strong
    each source is.
    """

    skill: DetectedSkill
    sections: tuple[str, ...]
    evidence: tuple[SkillEvidence, ...]


@dataclass(frozen=True)
class ResumeProfile:
    """
    Structured resume representation produced locally.

    This is not the final Analyzer result.
    """

    raw_text: str

    sections: tuple[ResumeSection, ...]

    summary: str | None

    skills: tuple[ResumeSkillEvidence, ...]

    education: tuple[ResumeEducationEntry, ...]

    experience: tuple[ResumeExperienceEntry, ...]

    projects: tuple[ResumeProjectEntry, ...]

    certifications: tuple[ResumeCertificationEntry, ...]

    achievements: tuple[str, ...]

    languages: tuple[str, ...]

    tools: tuple[str, ...]


# ============================================================
# SECTION ALIASES
# ============================================================


SECTION_ALIASES: dict[str, str] = {
    # Summary
    "summary": "summary",
    "professional summary": "summary",
    "profile": "summary",
    "objective": "summary",
    "career objective": "summary",

    # Skills
    "skills": "skills",
    "technical skills": "skills",
    "technical skill": "skills",
    "core skills": "skills",
    "programming & development": "skills",
    "programming and development": "skills",
    "ai, machine learning & data visualization": "skills",
    "ai machine learning & data visualization": "skills",
    "core strengths": "skills",
    "core computer science": "skills",
    "tools & professional": "skills",

    # Experience
    "experience": "experience",
    "work experience": "experience",
    "professional experience": "experience",
    "employment": "experience",

    # Internship
    "internship": "experience",
    "internships": "experience",
    "internship experience": "experience",
    "internship experience": "experience",

    # Projects
    "projects": "projects",
    "project": "projects",
    "academic projects": "projects",
    "personal projects": "projects",

    # Education
    "education": "education",
    "academic background": "education",
    "academic qualifications": "education",
    "qualifications": "education",

    # Certifications / courses
    "certifications": "certifications",
    "certificates": "certifications",
    "courses": "certifications",
    "courses & certificates": "certifications",
    "courses and certificates": "certifications",

    # Achievements
    "achievements": "achievements",
    "key achievements": "achievements",
    "awards": "achievements",

    # Languages
    "languages": "languages",

    # Tools
    "tools": "tools",
    "technical tools": "tools",
    "professional skills": "tools",
}


# ============================================================
# GENERAL HELPERS
# ============================================================


def _clean_line(line: str) -> str:
    """
    Conservative line cleanup.
    """

    return re.sub(
        r"\s+",
        " ",
        line.strip(),
    )


def _non_empty_lines(text: str) -> list[str]:
    return [
        _clean_line(line)
        for line in text.splitlines()
        if _clean_line(line)
    ]


def _canonical_section_name(name: str) -> str:
    """
    Convert a detected section header into a stable internal name.
    """

    normalized = normalize_section_header(name)

    return SECTION_ALIASES.get(
        normalized,
        normalized,
    )


def _is_bullet(line: str) -> bool:
    return bool(
        re.match(
            r"^\s*(?:[-•●▪◦‣⁃∙·➢➤◆■])\s+",
            line,
        )
    )


def _strip_bullet(line: str) -> str:
    return re.sub(
        r"^\s*(?:[-•●▪◦‣⁃∙·➢➤◆■])\s+",
        "",
        line,
    ).strip()


def _is_date_like(text: str) -> bool:
    """
    Detect common resume date expressions.

    This is intentionally broad because resumes use many formats.
    """

    patterns = (
        r"\b\d{4}\s*[-–]\s*\d{4}\b",
        r"\b\d{4}\s*[-–]\s*(?:present|current)\b",
        r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*"
        r"\s+\d{4}\b",
        r"\b(?:19|20)\d{2}\b",
        r"\b\d{1,2}\s*(?:month|months|year|years)\b",
    )

    return any(
        re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )
        for pattern in patterns
    )


def _extract_date(text: str) -> str | None:
    patterns = (
        r"\b"
        r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)"
        r"[a-z]*\s+\d{4}"
        r"\s*[-–]\s*"
        r"(?:"
        r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)"
        r"[a-z]*\s+\d{4}"
        r"|present"
        r"|current"
        r")"
        r"\b",

        r"\b\d{4}\s*[-–]\s*(?:\d{4}|present|current)\b",

        r"\b\d{1,2}\s*(?:month|months|year|years)\b",
    )

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        if match:
            return match.group(0)

    return None


def _extract_grade(text: str) -> str | None:
    patterns = (
        r"\b(?:CGPA|GPA|OGPA)\s*[:\-]?\s*\d+(?:\.\d+)?(?:/\d+)?",
        r"\bGrade\s*[:\-]?\s*[A-Za-z+]+",
        r"\b(?:Percentage|Score|Marks)\s*[:\-]?\s*\d+(?:\.\d+)?%?",
    )

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        if match:
            return match.group(0)

    return None


# ============================================================
# SECTION EXTRACTION
# ============================================================


def extract_resume_sections(
    text: str,
) -> tuple[ResumeSection, ...]:
    """
    Split resume text into stable logical sections.

    The preprocessor already provides lightweight section detection.
    This function additionally canonicalizes common resume section names.
    """

    processed_text = preprocess_text(text)

    if not processed_text:
        return ()

    raw_sections = split_into_sections(
        processed_text,
    )

    sections: list[ResumeSection] = []

    for raw_name, section_text in raw_sections.items():
        canonical_name = _canonical_section_name(
            raw_name,
        )

        lines = tuple(
            _non_empty_lines(section_text)
        )

        if not lines:
            continue

        sections.append(
            ResumeSection(
                name=canonical_name,
                raw_text="\n".join(lines),
                lines=lines,
            )
        )

    return tuple(sections)


# ============================================================
# SUMMARY
# ============================================================


def extract_summary(
    sections: Iterable[ResumeSection],
) -> str | None:
    for section in sections:
        if section.name == "summary":
            return section.raw_text

    return None


# ============================================================
# SKILL EXTRACTION + SECTION MAPPING
# ============================================================


def extract_resume_skills(
    text: str,
    sections: Iterable[ResumeSection],
) -> tuple[ResumeSkillEvidence, ...]:
    """
    Detect skills and keep track of the resume sections where
    each skill was found.

    This is extremely important for later evidence scoring.

    Example:

        Java
        sections = ("skills",)

    while:

        Python
        sections = ("skills", "projects")
    """

    section_list = list(sections)

    detected_from_full_text = detect_skills(
        text,
    )

    results: list[ResumeSkillEvidence] = []

    for detected_skill in detected_from_full_text:
        matched_sections: list[str] = []
        matched_evidence: list[SkillEvidence] = []

        for section in section_list:
            section_detected = detect_skills(
                section.raw_text,
            )

            matching_skill = next(
                (
                    item
                    for item in section_detected
                    if item.id == detected_skill.id
                ),
                None,
            )

            if matching_skill is None:
                continue

            matched_sections.append(
                section.name,
            )

            matched_evidence.extend(
                matching_skill.evidence,
            )

        # If a skill was found in the full document but no section
        # mapping was available, preserve the detection rather than
        # discarding it.
        if not matched_sections:
            matched_sections.append(
                "general",
            )

        # Deduplicate evidence by location.
        unique_evidence: list[SkillEvidence] = []
        seen: set[tuple[str, int, int]] = set()

        for evidence in matched_evidence:
            key = (
                evidence.skill_id,
                evidence.start,
                evidence.end,
            )

            if key in seen:
                continue

            seen.add(key)

            unique_evidence.append(
                evidence,
            )

        results.append(
            ResumeSkillEvidence(
                skill=detected_skill,
                sections=tuple(
                    dict.fromkeys(
                        matched_sections,
                    )
                ),
                evidence=tuple(
                    unique_evidence,
                ),
            )
        )

    return tuple(results)


# ============================================================
# EXPERIENCE EXTRACTION
# ============================================================


def _parse_experience_entry(
    lines: list[str],
) -> ResumeExperienceEntry | None:
    if not lines:
        return None

    header = _strip_bullet(lines[0])

    date = _extract_date(
        header,
    )

    header_without_date = header

    if date:
        header_without_date = re.sub(
            re.escape(date),
            "",
            header_without_date,
            flags=re.IGNORECASE,
        )

    header_without_date = re.sub(
        r"\s{2,}",
        " ",
        header_without_date,
    ).strip(" |,-–")

    organization = ""
    role = ""

    # --------------------------------------------------------
    # Common format:
    # Organization | Role | Date
    # --------------------------------------------------------
    parts = [
        part.strip()
        for part in re.split(
            r"\s*\|\s*",
            header_without_date,
        )
        if part.strip()
    ]

    if len(parts) >= 2:
        organization = parts[0]
        role = parts[1]

    # --------------------------------------------------------
    # Alternative format:
    # Organization - Role
    # --------------------------------------------------------
    elif len(parts) == 1:
        hyphen_parts = [
            part.strip()
            for part in re.split(
                r"\s+-\s+",
                header_without_date,
            )
            if part.strip()
        ]

        if len(hyphen_parts) >= 2:
            organization = hyphen_parts[0]
            role = hyphen_parts[1]
        else:
            organization = header_without_date

    description_lines = [
        _strip_bullet(line)
        for line in lines[1:]
        if _strip_bullet(line)
    ]

    description = "\n".join(
        description_lines,
    ).strip()

    if not organization and not role:
        return None

    return ResumeExperienceEntry(
        organization=organization,
        role=role,
        dates=date,
        description=description,
        lines=tuple(lines),
    )


def extract_experience(
    sections: Iterable[ResumeSection],
) -> tuple[ResumeExperienceEntry, ...]:
    """
    Extract experience/internship entries from the canonical
    experience section.

    We keep parsing conservative because resume formats vary widely.
    """

    experience_entries: list[ResumeExperienceEntry] = []

    for section in sections:
        if section.name != "experience":
            continue

        lines = list(section.lines)

        current_entry: list[str] = []

        for index, line in enumerate(lines):
            is_header_candidate = (
                not _is_bullet(line)
                and (
                    "|" in line
                    or _is_date_like(line)
                    or index == 0
                )
            )

            if is_header_candidate:
                if current_entry:
                    parsed = _parse_experience_entry(
                        current_entry,
                    )

                    if parsed:
                        experience_entries.append(
                            parsed,
                        )

                current_entry = [line]

            else:
                if not current_entry:
                    current_entry = [line]
                else:
                    current_entry.append(line)

        if current_entry:
            parsed = _parse_experience_entry(
                current_entry,
            )

            if parsed:
                experience_entries.append(
                    parsed,
                )

    return tuple(
        experience_entries,
    )


# ============================================================
# PROJECT EXTRACTION
# ============================================================


def _extract_technologies_from_text(
    text: str,
) -> tuple[str, ...]:
    detected = detect_skills(
        text,
    )

    # Keep only skills that are useful as technologies.
    allowed_categories = {
        "programming",
        "software_engineering",
        "computer_science",
        "database",
        "ai_ml",
        "machine_learning_methods",
        "analytics",
        "visualization",
        "data",
        "web",
        "tools",
        "cloud",
    }

    technologies = [
        skill.name
        for skill in detected
        if skill.category in allowed_categories
    ]

    return tuple(
        dict.fromkeys(
            technologies,
        )
    )


def _parse_project_entry(
    lines: list[str],
) -> ResumeProjectEntry | None:
    if not lines:
        return None

    first_line = _strip_bullet(
        lines[0],
    )

    project_name = first_line
    technologies: tuple[str, ...] = ()

    # Format:
    # Project Name | Python, Flask, ML | GitHub
    parts = [
        part.strip()
        for part in re.split(
            r"\s*\|\s*",
            first_line,
        )
        if part.strip()
    ]

    if len(parts) >= 2:
        project_name = parts[0]

        technology_text = " ".join(
            parts[1:],
        )

        technologies = _extract_technologies_from_text(
            technology_text,
        )

    description_lines = [
        _strip_bullet(line)
        for line in lines[1:]
        if _strip_bullet(line)
    ]

    description = "\n".join(
        description_lines,
    ).strip()

    if not description and len(lines) > 1:
        description = "\n".join(
            _strip_bullet(line)
            for line in lines
        ).strip()

    return ResumeProjectEntry(
        name=project_name,
        technologies=technologies,
        description=description,
        lines=tuple(lines),
    )


def extract_projects(
    sections: Iterable[ResumeSection],
) -> tuple[ResumeProjectEntry, ...]:
    projects: list[ResumeProjectEntry] = []

    for section in sections:
        if section.name != "projects":
            continue

        lines = list(section.lines)

        current_project: list[str] = []

        for line in lines:
            is_project_header = (
                not _is_bullet(line)
                and (
                    "|" in line
                    or (
                        current_project
                        and not _is_bullet(line)
                    )
                )
            )

            if is_project_header:
                if current_project:
                    parsed = _parse_project_entry(
                        current_project,
                    )

                    if parsed:
                        projects.append(
                            parsed,
                        )

                current_project = [line]

            else:
                if not current_project:
                    current_project = [line]
                else:
                    current_project.append(line)

        if current_project:
            parsed = _parse_project_entry(
                current_project,
            )

            if parsed:
                projects.append(
                    parsed,
                )

    return tuple(
        projects,
    )


# ============================================================
# EDUCATION EXTRACTION
# ============================================================


def _parse_education_entry(
    lines: list[str],
) -> ResumeEducationEntry | None:
    if not lines:
        return None

    header = _strip_bullet(
        lines[0],
    )

    date = _extract_date(
        header,
    )

    grade = _extract_grade(
        header,
    )

    header_without_date = header

    if date:
        header_without_date = re.sub(
            re.escape(date),
            "",
            header_without_date,
            flags=re.IGNORECASE,
        )

    # Institution | Qualification | Grade
    parts = [
        part.strip()
        for part in re.split(
            r"\s*\|\s*",
            header_without_date,
        )
        if part.strip()
    ]

    if len(parts) >= 2:
        institution = parts[0]
        qualification = parts[1]
    else:
        institution = header_without_date
        qualification = ""

    description = "\n".join(
        _strip_bullet(line)
        for line in lines[1:]
        if _strip_bullet(line)
    ).strip()

    return ResumeEducationEntry(
        institution=institution,
        qualification=qualification,
        dates=date,
        grade=grade,
        description=description,
    )


def extract_education(
    sections: Iterable[ResumeSection],
) -> tuple[ResumeEducationEntry, ...]:
    education_entries: list[ResumeEducationEntry] = []

    for section in sections:
        if section.name != "education":
            continue

        lines = list(section.lines)

        current_entry: list[str] = []

        for index, line in enumerate(lines):
            is_header_candidate = (
                not _is_bullet(line)
                and (
                    "|" in line
                    or _is_date_like(line)
                    or index == 0
                )
            )

            if is_header_candidate:
                if current_entry:
                    parsed = _parse_education_entry(
                        current_entry,
                    )

                    if parsed:
                        education_entries.append(
                            parsed,
                        )

                current_entry = [line]

            else:
                if not current_entry:
                    current_entry = [line]
                else:
                    current_entry.append(line)

        if current_entry:
            parsed = _parse_education_entry(
                current_entry,
            )

            if parsed:
                education_entries.append(
                    parsed,
                )

    return tuple(
        education_entries,
    )


# ============================================================
# CERTIFICATION EXTRACTION
# ============================================================


def _parse_certification_entry(
    line: str,
) -> ResumeCertificationEntry:
    cleaned = _strip_bullet(
        line,
    )

    date_or_duration = None

    duration_match = re.search(
        r"\b\d{1,2}\s*(?:day|days|month|months|year|years)\b",
        cleaned,
        flags=re.IGNORECASE,
    )

    if duration_match:
        date_or_duration = duration_match.group(0)

    organization = None

    # Common format:
    # Certificate Name — Organization
    parts = [
        part.strip()
        for part in re.split(
            r"\s+[—–-]\s+",
            cleaned,
        )
        if part.strip()
    ]

    if len(parts) >= 2:
        name = parts[0]
        organization = parts[1]
    else:
        name = cleaned

    return ResumeCertificationEntry(
        name=name,
        organization=organization,
        date_or_duration=date_or_duration,
        description=cleaned,
    )


def extract_certifications(
    sections: Iterable[ResumeSection],
) -> tuple[ResumeCertificationEntry, ...]:
    certifications: list[ResumeCertificationEntry] = []

    for section in sections:
        if section.name != "certifications":
            continue

        for line in section.lines:
            certifications.append(
                _parse_certification_entry(
                    line,
                )
            )

    return tuple(
        certifications,
    )


# ============================================================
# ACHIEVEMENTS
# ============================================================


def extract_achievements(
    sections: Iterable[ResumeSection],
) -> tuple[str, ...]:
    achievements: list[str] = []

    for section in sections:
        if section.name != "achievements":
            continue

        achievements.extend(
            _strip_bullet(line)
            for line in section.lines
            if _strip_bullet(line)
        )

    return tuple(
        achievements,
    )


# ============================================================
# LANGUAGES
# ============================================================


def extract_languages(
    sections: Iterable[ResumeSection],
) -> tuple[str, ...]:
    languages: list[str] = []

    for section in sections:
        if section.name != "languages":
            continue

        # Language sections are generally short. Preserve the
        # line-level representation instead of aggressively parsing.
        for line in section.lines:
            cleaned = _strip_bullet(line)

            if cleaned:
                languages.append(
                    cleaned,
                )

    return tuple(
        languages,
    )


# ============================================================
# TOOLS
# ============================================================


def extract_tools(
    sections: Iterable[ResumeSection],
) -> tuple[str, ...]:
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
        )
    )


# ============================================================
# COMPLETE RESUME EXTRACTION
# ============================================================


def extract_resume_profile(
    text: str,
) -> ResumeProfile:
    """
    Extract a complete local structured profile from resume text.

    No scoring is performed here.

    No Gemini call is performed here.

    No user data is persisted here.
    """

    processed_text = preprocess_text(
        text,
    )

    if not processed_text:
        raise ValueError(
            "Resume text is empty after preprocessing."
        )

    sections = extract_resume_sections(
        processed_text,
    )

    if not sections:
        raise ValueError(
            "No usable resume sections could be identified."
        )

    summary = extract_summary(
        sections,
    )

    skills = extract_resume_skills(
        text=processed_text,
        sections=sections,
    )

    education = extract_education(
        sections,
    )

    experience = extract_experience(
        sections,
    )

    projects = extract_projects(
        sections,
    )

    certifications = extract_certifications(
        sections,
    )

    achievements = extract_achievements(
        sections,
    )

    languages = extract_languages(
        sections,
    )

    tools = extract_tools(
        sections,
    )

    return ResumeProfile(
        raw_text=processed_text,
        sections=sections,
        summary=summary,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
        achievements=achievements,
        languages=languages,
        tools=tools,
    )