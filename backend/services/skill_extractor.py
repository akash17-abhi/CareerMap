from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable


# ============================================================
# DATA MODELS
# ============================================================


@dataclass(frozen=True)
class SkillDefinition:
    """
    Canonical local representation of a skill.

    aliases:
        Alternative spellings/forms that should map to the same
        canonical skill.

    patterns:
        Regex patterns used when simple alias matching is not
        sufficient.
    """

    id: str
    name: str
    aliases: tuple[str, ...]
    category: str
    patterns: tuple[str, ...] = ()


@dataclass(frozen=True)
class SkillEvidence:
    """
    Evidence that a canonical skill was found in the supplied text.
    """

    skill_id: str
    skill_name: str
    matched_text: str
    start: int
    end: int


@dataclass(frozen=True)
class DetectedSkill:
    """
    Local skill detection result before evidence strength/status
    scoring is applied.
    """

    id: str
    name: str
    category: str
    mentioned: bool
    evidence: tuple[SkillEvidence, ...]


# ============================================================
# SKILL DICTIONARY
# ============================================================

# This dictionary is intentionally focused on the types of skills
# CareerMap is expected to analyze for entry-level technology,
# analytics, AI/ML, and software-development roles.
#
# It is designed to be expanded as testing reveals new aliases or
# role-specific terminology.
#
# Important:
# Do not make this dictionary responsible for deciding whether a
# skill is "strong", "partial", or "missing". It only normalizes
# and detects skills.
# ============================================================


SKILL_DEFINITIONS: tuple[SkillDefinition, ...] = (
    # --------------------------------------------------------
    # Programming languages
    # --------------------------------------------------------
    SkillDefinition(
        id="python",
        name="Python",
        aliases=(
            "python",
            "python programming",
        ),
        category="programming",
    ),
    SkillDefinition(
        id="java",
        name="Java",
        aliases=(
            "java",
            "java programming",
        ),
        category="programming",
    ),
    SkillDefinition(
        id="javascript",
        name="JavaScript",
        aliases=(
            "javascript",
            "java script",
            "js",
        ),
        category="programming",
    ),
    SkillDefinition(
        id="typescript",
        name="TypeScript",
        aliases=(
            "typescript",
            "type script",
            "ts",
        ),
        category="programming",
    ),
    SkillDefinition(
        id="cpp",
        name="C++",
        aliases=(
            "c++",
            "cpp",
            "c plus plus",
        ),
        category="programming",
    ),
    SkillDefinition(
        id="csharp",
        name="C#",
        aliases=(
            "c#",
            "c sharp",
        ),
        category="programming",
    ),

    # --------------------------------------------------------
    # Software engineering / CS fundamentals
    # --------------------------------------------------------
    SkillDefinition(
        id="oop",
        name="Object-Oriented Programming",
        aliases=(
            "object oriented programming",
            "object-oriented programming",
            "oop",
            "object oriented design",
        ),
        category="software_engineering",
    ),
    SkillDefinition(
        id="dsa",
        name="Data Structures and Algorithms",
        aliases=(
            "data structures and algorithms",
            "data structures & algorithms",
            "data structures algorithms",
            "dsa",
            "data structures",
            "algorithms",
        ),
        category="computer_science",
    ),
    SkillDefinition(
        id="operating-systems",
        name="Operating Systems",
        aliases=(
            "operating systems",
            "operating system",
            "os",
        ),
        category="computer_science",
    ),
    SkillDefinition(
        id="computer-networks",
        name="Computer Networks",
        aliases=(
            "computer networks",
            "computer network",
            "cn",
            "networking",
        ),
        category="computer_science",
    ),
    SkillDefinition(
        id="database-management",
        name="Database Management Systems",
        aliases=(
            "database management systems",
            "database management system",
            "dbms",
            "database management",
        ),
        category="database",
    ),
    SkillDefinition(
        id="data-mining",
        name="Data Mining",
        aliases=(
            "data mining",
        ),
        category="data",
    ),
    SkillDefinition(
        id="data-warehousing",
        name="Data Warehousing",
        aliases=(
            "data warehousing",
            "data warehouse",
            "data warehousing concepts",
        ),
        category="data",
    ),

    # --------------------------------------------------------
    # SQL / databases
    # --------------------------------------------------------
    SkillDefinition(
        id="sql",
        name="SQL",
        aliases=(
            "sql",
            "structured query language",
            "sql querying",
            "sql queries",
        ),
        category="database",
    ),
    SkillDefinition(
        id="mysql",
        name="MySQL",
        aliases=(
            "mysql",
            "my sql",
        ),
        category="database",
    ),
    SkillDefinition(
        id="postgresql",
        name="PostgreSQL",
        aliases=(
            "postgresql",
            "postgres",
            "postgre sql",
        ),
        category="database",
    ),
    SkillDefinition(
        id="mongodb",
        name="MongoDB",
        aliases=(
            "mongodb",
            "mongo db",
            "mongo",
        ),
        category="database",
    ),

    # --------------------------------------------------------
    # AI / machine learning
    # --------------------------------------------------------
    SkillDefinition(
        id="machine-learning",
        name="Machine Learning",
        aliases=(
            "machine learning",
            "machine-learning",
            "ml",
        ),
        category="ai_ml",
    ),
    SkillDefinition(
        id="artificial-intelligence",
        name="Artificial Intelligence",
        aliases=(
            "artificial intelligence",
            "artificial-intelligence",
            "ai",
        ),
        category="ai_ml",
    ),
    SkillDefinition(
        id="natural-language-processing",
        name="Natural Language Processing",
        aliases=(
            "natural language processing",
            "natural-language processing",
            "nlp",
        ),
        category="ai_ml",
    ),
    SkillDefinition(
        id="deep-learning",
        name="Deep Learning",
        aliases=(
            "deep learning",
            "deep-learning",
            "dl",
        ),
        category="ai_ml",
    ),
    SkillDefinition(
        id="computer-vision",
        name="Computer Vision",
        aliases=(
            "computer vision",
            "computer-vision",
            "cv",
        ),
        category="ai_ml",
    ),
    SkillDefinition(
        id="scikit-learn",
        name="Scikit-learn",
        aliases=(
            "scikit-learn",
            "scikit learn",
            "sklearn",
            "scikit",
        ),
        category="ai_ml",
    ),

    # --------------------------------------------------------
    # ML methods
    # --------------------------------------------------------
    SkillDefinition(
        id="supervised-learning",
        name="Supervised Learning",
        aliases=(
            "supervised learning",
        ),
        category="machine_learning_methods",
    ),
    SkillDefinition(
        id="unsupervised-learning",
        name="Unsupervised Learning",
        aliases=(
            "unsupervised learning",
        ),
        category="machine_learning_methods",
    ),
    SkillDefinition(
        id="regression",
        name="Regression",
        aliases=(
            "regression",
            "regression models",
        ),
        category="machine_learning_methods",
    ),
    SkillDefinition(
        id="classification",
        name="Classification",
        aliases=(
            "classification",
            "classification models",
        ),
        category="machine_learning_methods",
    ),
    SkillDefinition(
        id="feature-engineering",
        name="Feature Engineering",
        aliases=(
            "feature engineering",
            "feature-engineering",
        ),
        category="machine_learning_methods",
    ),

    # --------------------------------------------------------
    # Data / analytics / visualization
    # --------------------------------------------------------
    SkillDefinition(
        id="data-analysis",
        name="Data Analysis",
        aliases=(
            "data analysis",
            "data analytics",
            "data-analysis",
            "data analytics",
        ),
        category="analytics",
    ),
    SkillDefinition(
        id="data-visualization",
        name="Data Visualization",
        aliases=(
            "data visualization",
            "data visualisation",
            "data-visualization",
        ),
        category="analytics",
    ),
    SkillDefinition(
        id="matplotlib",
        name="Matplotlib",
        aliases=(
            "matplotlib",
        ),
        category="visualization",
    ),
    SkillDefinition(
        id="seaborn",
        name="Seaborn",
        aliases=(
            "seaborn",
        ),
        category="visualization",
    ),
    SkillDefinition(
        id="pandas",
        name="Pandas",
        aliases=(
            "pandas",
            "python pandas",
        ),
        category="data",
    ),
    SkillDefinition(
        id="numpy",
        name="NumPy",
        aliases=(
            "numpy",
            "num py",
        ),
        category="data",
    ),

    # --------------------------------------------------------
    # Web development
    # --------------------------------------------------------
    SkillDefinition(
        id="flask",
        name="Flask",
        aliases=(
            "flask",
            "flask framework",
        ),
        category="web",
    ),
    SkillDefinition(
        id="fastapi",
        name="FastAPI",
        aliases=(
            "fastapi",
            "fast api",
        ),
        category="web",
    ),
    SkillDefinition(
        id="django",
        name="Django",
        aliases=(
            "django",
            "django framework",
        ),
        category="web",
    ),
    SkillDefinition(
        id="rest-api",
        name="REST API",
        aliases=(
            "rest api",
            "restful api",
            "restful apis",
            "rest apis",
        ),
        category="web",
    ),

    # --------------------------------------------------------
    # Version control / tools
    # --------------------------------------------------------
    SkillDefinition(
        id="git",
        name="Git",
        aliases=(
            "git",
            "git version control",
        ),
        category="tools",
    ),
    SkillDefinition(
        id="github",
        name="GitHub",
        aliases=(
            "github",
            "git hub",
        ),
        category="tools",
    ),
    SkillDefinition(
        id="jupyter",
        name="Jupyter Notebook",
        aliases=(
            "jupyter notebook",
            "jupyter notebooks",
            "jupyter",
        ),
        category="tools",
    ),
    SkillDefinition(
        id="ms-office",
        name="MS Office",
        aliases=(
            "ms office",
            "microsoft office",
            "microsoft office suite",
        ),
        category="tools",
    ),
    SkillDefinition(
        id="google-sheets",
        name="Google Sheets",
        aliases=(
            "google sheets",
            "google sheet",
        ),
        category="tools",
    ),
    SkillDefinition(
        id="excel",
        name="Excel",
        aliases=(
            "excel",
            "microsoft excel",
            "ms excel",
        ),
        category="tools",
    ),

    # --------------------------------------------------------
    # Cloud / deployment
    # --------------------------------------------------------
    SkillDefinition(
        id="cloud-computing",
        name="Cloud Computing",
        aliases=(
            "cloud computing",
            "cloud",
            "cloud infrastructure",
            "cloud computing concepts",
        ),
        category="cloud",
    ),
    SkillDefinition(
        id="aws",
        name="AWS",
        aliases=(
            "aws",
            "amazon web services",
        ),
        category="cloud",
    ),
    SkillDefinition(
        id="gcp",
        name="Google Cloud Platform",
        aliases=(
            "google cloud platform",
            "google cloud",
            "gcp",
        ),
        category="cloud",
    ),
    SkillDefinition(
        id="azure",
        name="Microsoft Azure",
        aliases=(
            "microsoft azure",
            "azure",
        ),
        category="cloud",
    ),
    SkillDefinition(
        id="docker",
        name="Docker",
        aliases=(
            "docker",
            "docker container",
            "docker containers",
        ),
        category="cloud",
    ),

    # --------------------------------------------------------
    # Soft computing
    # --------------------------------------------------------
    SkillDefinition(
        id="soft-computing",
        name="Soft Computing",
        aliases=(
            "soft computing",
        ),
        category="computer_science",
    ),
)


# ============================================================
# INTERNAL HELPERS
# ============================================================


def _normalize_search_text(text: str) -> str:
    """
    Normalize text for matching while preserving enough punctuation
    for technical terms such as C++, C#, .NET and scikit-learn.
    """

    normalized = text.lower()

    normalized = (
        normalized
        .replace("\u00a0", " ")
        .replace("–", "-")
        .replace("—", "-")
        .replace("−", "-")
    )

    normalized = re.sub(
        r"[\u200b\u200c\u200d\ufeff]",
        "",
        normalized,
    )

    normalized = re.sub(
        r"\s+",
        " ",
        normalized,
    )

    return normalized.strip()


def _compile_alias_pattern(alias: str) -> re.Pattern[str]:
    """
    Build a boundary-aware regex for an alias.

    Word boundaries alone are not reliable for values such as:
        C++
        C#
        scikit-learn
        .NET

    We therefore use conservative left/right boundaries that work
    for alphanumeric skill names while allowing technical punctuation.
    """

    escaped = re.escape(alias.strip())

    return re.compile(
        rf"(?<![a-zA-Z0-9_]){escaped}(?![a-zA-Z0-9_])",
        re.IGNORECASE,
    )


def _make_skill_evidence(
    skill: SkillDefinition,
    text: str,
    matched_text: str,
    start: int,
    end: int,
) -> SkillEvidence:
    return SkillEvidence(
        skill_id=skill.id,
        skill_name=skill.name,
        matched_text=matched_text,
        start=start,
        end=end,
    )


# ============================================================
# SINGLE SKILL DETECTION
# ============================================================


def detect_skill(
    text: str,
    skill: SkillDefinition,
) -> DetectedSkill | None:
    """
    Detect one canonical skill in text.

    Returns None if no evidence is found.
    """

    if not text:
        return None

    normalized_text = _normalize_search_text(text)

    evidence: list[SkillEvidence] = []

    # --------------------------------------------------------
    # Alias matching
    # --------------------------------------------------------
    for alias in skill.aliases:
        pattern = _compile_alias_pattern(alias)

        for match in pattern.finditer(normalized_text):
            evidence.append(
                _make_skill_evidence(
                    skill=skill,
                    text=normalized_text,
                    matched_text=match.group(0),
                    start=match.start(),
                    end=match.end(),
                )
            )

    # --------------------------------------------------------
    # Custom regex matching
    # --------------------------------------------------------
    for raw_pattern in skill.patterns:
        try:
            pattern = re.compile(
                raw_pattern,
                re.IGNORECASE,
            )
        except re.error:
            # An invalid custom pattern should not break the
            # entire analyzer.
            continue

        for match in pattern.finditer(normalized_text):
            evidence.append(
                _make_skill_evidence(
                    skill=skill,
                    text=normalized_text,
                    matched_text=match.group(0),
                    start=match.start(),
                    end=match.end(),
                )
            )

    if not evidence:
        return None

    # --------------------------------------------------------
    # Deduplicate overlapping/duplicate matches.
    # --------------------------------------------------------
    unique_evidence: list[SkillEvidence] = []
    seen: set[tuple[int, int]] = set()

    for item in sorted(
        evidence,
        key=lambda evidence_item: (
            evidence_item.start,
            evidence_item.end,
        ),
    ):
        key = (
            item.start,
            item.end,
        )

        if key in seen:
            continue

        seen.add(key)
        unique_evidence.append(item)

    return DetectedSkill(
        id=skill.id,
        name=skill.name,
        category=skill.category,
        mentioned=True,
        evidence=tuple(unique_evidence),
    )


# ============================================================
# MULTI-SKILL DETECTION
# ============================================================


def detect_skills(
    text: str,
    skill_definitions: Iterable[SkillDefinition] = SKILL_DEFINITIONS,
) -> list[DetectedSkill]:
    """
    Detect all known skills in a piece of text.

    Results are returned in the order of the supplied skill
    definitions, which gives deterministic behavior.
    """

    if not text:
        return []

    detected: list[DetectedSkill] = []

    for skill in skill_definitions:
        result = detect_skill(
            text=text,
            skill=skill,
        )

        if result is not None:
            detected.append(result)

    return detected


# ============================================================
# LOOKUP HELPERS
# ============================================================


def get_skill_definition(
    skill_id: str,
) -> SkillDefinition | None:
    """
    Retrieve a canonical skill definition by ID.
    """

    normalized_id = skill_id.strip().lower()

    for skill in SKILL_DEFINITIONS:
        if skill.id == normalized_id:
            return skill

    return None


def get_skill_definition_by_name(
    name: str,
) -> SkillDefinition | None:
    """
    Retrieve a canonical skill definition by canonical name
    or one of its aliases.
    """

    normalized_name = _normalize_search_text(name)

    for skill in SKILL_DEFINITIONS:
        if _normalize_search_text(skill.name) == normalized_name:
            return skill

        for alias in skill.aliases:
            if _normalize_search_text(alias) == normalized_name:
                return skill

    return None


# ============================================================
# CANONICAL NORMALIZATION
# ============================================================


def normalize_skill_name(
    name: str,
) -> str | None:
    """
    Convert a skill name or alias into the canonical skill name.

    Examples:

        "ML"          -> "Machine Learning"
        "NLP"         -> "Natural Language Processing"
        "DBMS"        -> "Database Management Systems"
        "JS"          -> "JavaScript"
        "scikit learn" -> "Scikit-learn"
    """

    definition = get_skill_definition_by_name(
        name,
    )

    if definition is None:
        return None

    return definition.name


def normalize_skill_id(
    name: str,
) -> str | None:
    """
    Convert a skill name or alias into the canonical skill ID.
    """

    definition = get_skill_definition_by_name(
        name,
    )

    if definition is None:
        return None

    return definition.id


# ============================================================
# SKILL NAME COLLECTION
# ============================================================


def get_detected_skill_names(
    text: str,
) -> list[str]:
    """
    Return canonical skill names detected in the text.
    """

    return [
        skill.name
        for skill in detect_skills(text)
    ]


def get_detected_skill_ids(
    text: str,
) -> list[str]:
    """
    Return canonical skill IDs detected in the text.
    """

    return [
        skill.id
        for skill in detect_skills(text)
    ]


# ============================================================
# SKILL GROUPING
# ============================================================


def group_skills_by_category(
    skills: Iterable[DetectedSkill],
) -> dict[str, list[DetectedSkill]]:
    """
    Group detected skills by their canonical category.
    """

    grouped: dict[str, list[DetectedSkill]] = {}

    for skill in skills:
        grouped.setdefault(
            skill.category,
            [],
        ).append(skill)

    return grouped