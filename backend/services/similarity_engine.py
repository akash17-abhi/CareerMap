from __future__ import annotations

import math
import re
import unicodedata
from dataclasses import dataclass
from typing import Iterable, Sequence

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from schemas.analyzer import SemanticAnalysis
from services.jd_extractor import JDProfile
from services.resume_extractor import ResumeProfile


# ============================================================================
# Configuration
# ============================================================================

DEFAULT_MIN_DF = 1
DEFAULT_MAX_DF = 0.95
DEFAULT_NGRAM_RANGE = (1, 2)
DEFAULT_MAX_FEATURES = 5000

# Similarity itself is 0..1.
# The public analyzer score converts it to 0..100.
MIN_SIMILARITY = 0.0
MAX_SIMILARITY = 1.0


# ============================================================================
# Internal Models
# ============================================================================

@dataclass(frozen=True)
class SimilarityResult:
    similarity_value: float
    score: float
    confidence: str
    method: str
    resume_terms: int
    jd_terms: int
    shared_terms: int


# ============================================================================
# Basic Text Helpers
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
    return getattr(obj, name, default)


def normalize_similarity_text(value: str) -> str:
    """
    Normalize text before TF-IDF vectorization.

    This is intentionally conservative. We do not aggressively stem or
    lemmatize because technical tokens such as:
        Python
        C++
        Scikit-learn
        Flask
        SQL
        GitHub
        NLP
    can lose useful meaning after aggressive normalization.
    """
    if not value:
        return ""

    text = unicodedata.normalize(
        "NFKC",
        str(value),
    )

    # Normalize common typography.
    text = text.replace("–", "-")
    text = text.replace("—", "-")
    text = text.replace("’", "'")
    text = text.replace("“", '"')
    text = text.replace("”", '"')

    # Preserve useful technical punctuation while removing obvious noise.
    text = re.sub(
        r"[•▪◦►▸◆◇]",
        " ",
        text,
    )

    # Email/URLs are generally not useful for resume-JD similarity.
    text = re.sub(
        r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
        " ",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"https?://\S+|www\.\S+",
        " ",
        text,
        flags=re.IGNORECASE,
    )

    # Remove most isolated contact-number sequences.
    text = re.sub(
        r"(?<!\w)\+?\d[\d\s().-]{7,}\d(?!\w)",
        " ",
        text,
    )

    # Lowercase for stable vocabulary matching.
    text = text.lower()

    # Preserve technical characters:
    #   c++
    #   c#
    #   .net
    # while replacing decorative punctuation.
    text = re.sub(
        r"[^a-z0-9+#.\-'/\s]",
        " ",
        text,
    )

    # Apostrophes/slashes used as separators generally add no value.
    text = re.sub(
        r"[/']+",
        " ",
        text,
    )

    # Hyphens are retained because "machine-learning" can carry useful
    # tokenization information.
    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def _non_empty_lines(value: str) -> list[str]:
    return [
        line.strip()
        for line in value.splitlines()
        if line.strip()
    ]


def _deduplicate_text_parts(
    parts: Iterable[str],
) -> list[str]:
    """
    Remove duplicate text blocks while preserving order.
    """
    seen: set[str] = set()
    result: list[str] = []

    for part in parts:
        cleaned = normalize_similarity_text(part)

        if not cleaned:
            continue

        if cleaned in seen:
            continue

        seen.add(cleaned)
        result.append(part.strip())

    return result


# ============================================================================
# Resume Text Construction
# ============================================================================

def build_resume_similarity_text(
    resume: ResumeProfile,
) -> str:
    """
    Build a focused searchable text representation of the resume.

    We include:
        - summary
        - skills
        - experience
        - internship evidence
        - projects
        - education

    Contact details are excluded where possible.
    """
    parts: list[str] = []

    # ------------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------------

    summary = _safe_text(
        _get_attr(
            resume,
            "summary",
            "",
        )
    )

    if summary:
        parts.append(summary)

    # ------------------------------------------------------------------------
    # Resume sections
    # ------------------------------------------------------------------------

    sections = _get_attr(
        resume,
        "sections",
        [],
    ) or []

    for section in sections:
        title = _safe_text(
            _get_attr(
                section,
                "title",
                "",
            )
        )

        content = _safe_text(
            _get_attr(
                section,
                "content",
                "",
            )
        )

        if title:
            parts.append(title)

        if content:
            parts.append(content)

    # ------------------------------------------------------------------------
    # Skills
    # ------------------------------------------------------------------------

    skills = _get_attr(
        resume,
        "skills",
        [],
    ) or []

    for skill in skills:
        name = _safe_text(
            _get_attr(
                skill,
                "name",
                "",
            )
        )

        if name:
            parts.append(name)

        evidence = _get_attr(
            skill,
            "evidence",
            [],
        ) or []

        for evidence_item in evidence:
            text = _safe_text(
                _get_attr(
                    evidence_item,
                    "text",
                    "",
                )
            )

            if text:
                parts.append(text)

    # ------------------------------------------------------------------------
    # Professional Experience
    # ------------------------------------------------------------------------

    experience_items = _get_attr(
        resume,
        "experience",
        [],
    ) or []

    for item in experience_items:
        for field_name in (
            "title",
            "role",
            "position",
            "company",
            "organization",
            "description",
            "location",
        ):
            value = _safe_text(
                _get_attr(
                    item,
                    field_name,
                    "",
                )
            )

            if value:
                parts.append(value)

        for field_name in (
            "bullets",
            "responsibilities",
        ):
            values = _get_attr(
                item,
                field_name,
                [],
            ) or []

            for value in values:
                value_text = _safe_text(value)

                if value_text:
                    parts.append(value_text)

    # ------------------------------------------------------------------------
    # Internships
    # ------------------------------------------------------------------------

    internship_items = _get_attr(
        resume,
        "internships",
        [],
    ) or []

    for item in internship_items:
        for field_name in (
            "title",
            "role",
            "position",
            "company",
            "organization",
            "description",
            "location",
        ):
            value = _safe_text(
                _get_attr(
                    item,
                    field_name,
                    "",
                )
            )

            if value:
                parts.append(value)

        for field_name in (
            "bullets",
            "responsibilities",
        ):
            values = _get_attr(
                item,
                field_name,
                [],
            ) or []

            for value in values:
                value_text = _safe_text(value)

                if value_text:
                    parts.append(value_text)

    # ------------------------------------------------------------------------
    # Projects
    # ------------------------------------------------------------------------

    projects = _get_attr(
        resume,
        "projects",
        [],
    ) or []

    for project in projects:
        for field_name in (
            "name",
            "title",
            "description",
        ):
            value = _safe_text(
                _get_attr(
                    project,
                    field_name,
                    "",
                )
            )

            if value:
                parts.append(value)

        technologies = _get_attr(
            project,
            "technologies",
            [],
        ) or []

        for technology in technologies:
            technology_text = _safe_text(
                technology
            )

            if technology_text:
                parts.append(
                    technology_text
                )

        bullets = _get_attr(
            project,
            "bullets",
            [],
        ) or []

        for bullet in bullets:
            bullet_text = _safe_text(
                bullet
            )

            if bullet_text:
                parts.append(
                    bullet_text
                )

    # ------------------------------------------------------------------------
    # Education
    # ------------------------------------------------------------------------

    education_items = _get_attr(
        resume,
        "education",
        [],
    ) or []

    for item in education_items:
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
        ):
            value = _safe_text(
                _get_attr(
                    item,
                    field_name,
                    "",
                )
            )

            if value:
                parts.append(value)

    # Avoid duplicated section/raw content.
    unique_parts = _deduplicate_text_parts(
        parts
    )

    return "\n".join(
        unique_parts
    )


# ============================================================================
# JD Text Construction
# ============================================================================

def build_jd_similarity_text(
    jd: JDProfile,
) -> str:
    """
    Build a focused searchable text representation of the job description.
    """
    parts: list[str] = []

    # ------------------------------------------------------------------------
    # Job title
    # ------------------------------------------------------------------------

    job_title = _safe_text(
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

    if job_title:
        parts.append(job_title)

    # ------------------------------------------------------------------------
    # Summary / overview
    # ------------------------------------------------------------------------

    for field_name in (
        "summary",
        "overview",
       "description",
    ):
        value = _safe_text(
            _get_attr(
                jd,
                field_name,
                "",
            )
        )

        if value:
            parts.append(value)

    # ------------------------------------------------------------------------
    # Responsibilities
    # ------------------------------------------------------------------------

    responsibilities = _get_attr(
        jd,
        "responsibilities",
        [],
    ) or []

    for responsibility in responsibilities:
        text = _safe_text(
            responsibility
        )

        if text:
            parts.append(text)

    # ------------------------------------------------------------------------
    # Requirements
    # ------------------------------------------------------------------------

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
            "title",
        ):
            value = _safe_text(
                _get_attr(
                    requirement,
                    field_name,
                    "",
                )
            )

            if value:
                parts.append(value)
                break

    # ------------------------------------------------------------------------
    # Skill requirements
    # ------------------------------------------------------------------------

    skill_requirements = _get_attr(
        jd,
        "skills",
        _get_attr(
            jd,
            "skill_requirements",
            [],
        ),
    ) or []

    for skill in skill_requirements:
        for field_name in (
            "name",
            "skill",
            "keyword",
            "text",
            "description",
        ):
            value = _safe_text(
                _get_attr(
                    skill,
                    field_name,
                    "",
                )
            )

            if value:
                parts.append(value)
                break

    # ------------------------------------------------------------------------
    # Education requirements
    # ------------------------------------------------------------------------

    education_requirements = _get_attr(
        jd,
        "education_requirements",
        [],
    ) or []

    for item in education_requirements:
        text = _safe_text(
            _get_attr(
                item,
                "text",
                _get_attr(
                    item,
                    "description",
                    "",
                ),
            )
        )

        if text:
            parts.append(text)

    # ------------------------------------------------------------------------
    # Experience requirements
    # ------------------------------------------------------------------------

    experience_requirements = _get_attr(
        jd,
        "experience_requirements",
        [],
    ) or []

    for item in experience_requirements:
        text = _safe_text(
            _get_attr(
                item,
                "text",
                _get_attr(
                    item,
                    "description",
                    "",
                ),
            )
        )

        if text:
            parts.append(text)

    # ------------------------------------------------------------------------
    # Tools / keywords
    # ------------------------------------------------------------------------

    for field_name in (
        "tools",
        "keywords",
    ):
        values = _get_attr(
            jd,
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

            text = _safe_text(
                _get_attr(
                    value,
                    "name",
                    _get_attr(
                        value,
                        "keyword",
                        _get_attr(
                            value,
                            "text",
                            "",
                        ),
                    ),
                )
            )

            if text:
                parts.append(text)

    # ------------------------------------------------------------------------
    # Raw JD text
    # ------------------------------------------------------------------------

    # Raw text is added as a fallback only when structured fields are sparse.
    raw_text = _safe_text(
        _get_attr(
            jd,
            "raw_text",
            "",
        )
    )

    if raw_text:
        structured_length = len(
            " ".join(parts)
        )

        if structured_length < 250:
            parts.append(
                raw_text
            )

    unique_parts = _deduplicate_text_parts(
        parts
    )

    return "\n".join(
        unique_parts
    )


# ============================================================================
# Focused Technical Text
# ============================================================================

def _extract_technical_terms(
    text: str,
) -> list[str]:
    """
    Extract technical-looking terms for a secondary sanity signal.

    This does NOT replace TF-IDF similarity. It only helps identify whether
    a vector similarity score is supported by shared technical vocabulary.
    """
    normalized = normalize_similarity_text(
        text
    )

    if not normalized:
        return []

    tokens = re.findall(
        r"[a-z0-9][a-z0-9+#.\-]{1,}",
        normalized,
    )

    stopwords = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "that",
        "this",
        "are",
        "you",
        "your",
        "our",
        "will",
        "have",
        "has",
        "been",
        "being",
        "into",
        "about",
        "using",
        "work",
        "working",
        "role",
        "team",
        "teams",
        "candidate",
        "candidates",
        "experience",
        "required",
        "preferred",
        "should",
        "must",
        "responsibilities",
        "qualifications",
    }

    return [
        token
        for token in tokens
        if token not in stopwords
        and len(token) >= 3
    ]


def _shared_term_count(
    resume_text: str,
    jd_text: str,
) -> tuple[int, int, int]:
    resume_terms = set(
        _extract_technical_terms(
            resume_text
        )
    )

    jd_terms = set(
        _extract_technical_terms(
            jd_text
        )
    )

    shared_terms = resume_terms & jd_terms

    return (
        len(resume_terms),
        len(jd_terms),
        len(shared_terms),
    )


# ============================================================================
# TF-IDF Vectorizer
# ============================================================================

def _create_vectorizer(
    *,
    ngram_range: tuple[int, int] = DEFAULT_NGRAM_RANGE,
    max_features: int = DEFAULT_MAX_FEATURES,
) -> TfidfVectorizer:
    """
    Create a deterministic TF-IDF vectorizer.

    Notes:
        - stop_words is intentionally not set because technical words can
          overlap with English stopword lists in unexpected ways.
        - sublinear_tf reduces the impact of repeated words.
        - min_df/max_df avoid extremely rare or universal terms.
    """
    return TfidfVectorizer(
        lowercase=True,
        strip_accents="unicode",
        ngram_range=ngram_range,
        min_df=DEFAULT_MIN_DF,
        max_df=DEFAULT_MAX_DF,
        max_features=max_features,
        sublinear_tf=True,
        norm="l2",
        token_pattern=r"(?u)\b[a-zA-Z0-9][a-zA-Z0-9+#.\-]*\b",
    )


# ============================================================================
# Core Similarity Calculation
# ============================================================================

def calculate_tfidf_cosine_similarity(
    resume_text: str,
    jd_text: str,
    *,
    ngram_range: tuple[int, int] = DEFAULT_NGRAM_RANGE,
    max_features: int = DEFAULT_MAX_FEATURES,
) -> float:
    """
    Calculate cosine similarity between resume and JD using TF-IDF.

    Returns:
        float in [0, 1]
    """
    resume_clean = normalize_similarity_text(
        resume_text
    )

    jd_clean = normalize_similarity_text(
        jd_text
    )

    if not resume_clean or not jd_clean:
        return 0.0

    if resume_clean == jd_clean:
        return 1.0

    vectorizer = _create_vectorizer(
        ngram_range=ngram_range,
        max_features=max_features,
    )

    try:
        matrix = vectorizer.fit_transform(
            [
                resume_clean,
                jd_clean,
            ]
        )

    except ValueError:
        # Usually caused by an empty vocabulary.
        return 0.0

    if matrix.shape[1] == 0:
        return 0.0

    similarity_matrix = cosine_similarity(
        matrix[0:1],
        matrix[1:2],
    )

    similarity = float(
        similarity_matrix[0][0]
    )

    if math.isnan(similarity):
        return 0.0

    return round(
        max(
            MIN_SIMILARITY,
            min(
                MAX_SIMILARITY,
                similarity,
            ),
        ),
        6,
    )


# ============================================================================
# Confidence
# ============================================================================

def _confidence_from_similarity(
    similarity_value: float,
    resume_terms: int,
    jd_terms: int,
    shared_terms: int,
) -> str:
    """
    Confidence describes how much textual evidence supports the similarity
    result. It is NOT a claim about candidate ability.
    """
    minimum_term_count = min(
        resume_terms,
        jd_terms,
    )

    if minimum_term_count < 5:
        return "low"

    shared_ratio = (
        shared_terms / minimum_term_count
        if minimum_term_count > 0
        else 0.0
    )

    if (
        similarity_value >= 0.55
        and shared_ratio >= 0.15
    ):
        return "high"

    if (
        similarity_value >= 0.30
        and shared_ratio >= 0.05
    ):
        return "medium"

    return "low"


# ============================================================================
# Explanation
# ============================================================================

def _build_similarity_explanation(
    similarity_value: float,
    confidence: str,
    shared_terms: int,
    resume_terms: int,
    jd_terms: int,
) -> str:
    percentage = round(
        similarity_value * 100.0,
        1,
    )

    if similarity_value >= 0.70:
        level = "high"

    elif similarity_value >= 0.45:
        level = "moderate"

    elif similarity_value >= 0.25:
        level = "limited"

    else:
        level = "low"

    return (
        f"TF-IDF/cosine similarity indicates a {level} textual overlap "
        f"between the resume and job description ({percentage:.1f}/100). "
        f"The comparison used {resume_terms} resume terms and "
        f"{jd_terms} job-description terms, with approximately "
        f"{shared_terms} shared technical or content terms. "
        f"Similarity confidence is {confidence}. "
        "This score measures textual alignment and does not independently "
        "prove skill proficiency, experience, or job readiness."
    )


# ============================================================================
# Internal Calculation
# ============================================================================

def _calculate_similarity_result(
    resume_text: str,
    jd_text: str,
) -> SimilarityResult:
    similarity_value = calculate_tfidf_cosine_similarity(
        resume_text,
        jd_text,
    )

    score = round(
        similarity_value * 100.0,
        2,
    )

    resume_terms, jd_terms, shared_terms = (
        _shared_term_count(
            resume_text,
            jd_text,
        )
    )

    confidence = _confidence_from_similarity(
        similarity_value=similarity_value,
        resume_terms=resume_terms,
        jd_terms=jd_terms,
        shared_terms=shared_terms,
    )

    return SimilarityResult(
        similarity_value=similarity_value,
        score=score,
        confidence=confidence,
        method="tfidf_cosine",
        resume_terms=resume_terms,
        jd_terms=jd_terms,
        shared_terms=shared_terms,
    )


# ============================================================================
# Public API
# ============================================================================

def calculate_semantic_similarity(
    resume: ResumeProfile,
    jd: JDProfile,
) -> SemanticAnalysis:
    """
    Calculate deterministic local semantic-style similarity.

    The term 'semantic' here follows the analyzer schema, but the actual
    algorithm is TF-IDF + cosine similarity.

    No external API and no LLM are used.
    """
    resume_text = build_resume_similarity_text(
        resume
    )

    jd_text = build_jd_similarity_text(
        jd
    )

    result = _calculate_similarity_result(
        resume_text,
        jd_text,
    )

    explanation = _build_similarity_explanation(
        similarity_value=result.similarity_value,
        confidence=result.confidence,
        shared_terms=result.shared_terms,
        resume_terms=result.resume_terms,
        jd_terms=result.jd_terms,
    )

    return SemanticAnalysis(
        score=result.score,
        method=result.method,
        similarity_value=result.similarity_value,
        confidence=result.confidence,
        explanation=explanation,
    )


def calculate_similarity_from_text(
    resume_text: str,
    jd_text: str,
) -> SemanticAnalysis:
    """
    Direct text-level API.

    Useful for tests and debugging without requiring ResumeProfile/JDProfile.
    """
    result = _calculate_similarity_result(
        resume_text,
        jd_text,
    )

    explanation = _build_similarity_explanation(
        similarity_value=result.similarity_value,
        confidence=result.confidence,
        shared_terms=result.shared_terms,
        resume_terms=result.resume_terms,
        jd_terms=result.jd_terms,
    )

    return SemanticAnalysis(
        score=result.score,
        method=result.method,
        similarity_value=result.similarity_value,
        confidence=result.confidence,
        explanation=explanation,
    )


# ============================================================================
# Additional Diagnostic Utilities
# ============================================================================

def get_shared_similarity_terms(
    resume_text: str,
    jd_text: str,
) -> list[str]:
    """
    Return shared normalized technical/content terms.

    This is diagnostic only and should not be used as a replacement for
    skill matching.
    """
    resume_terms = set(
        _extract_technical_terms(
            resume_text
        )
    )

    jd_terms = set(
        _extract_technical_terms(
            jd_text
        )
    )

    return sorted(
        resume_terms & jd_terms
    )


def get_similarity_diagnostics(
    resume_text: str,
    jd_text: str,
) -> dict[str, object]:
    """
    Return useful local diagnostics for testing/benchmarking.
    """
    result = _calculate_similarity_result(
        resume_text,
        jd_text,
    )

    shared_terms = sorted(
        set(
            _extract_technical_terms(
                resume_text
            )
        )
        &
        set(
            _extract_technical_terms(
                jd_text
            )
        )
    )

    return {
        "similarity_value": result.similarity_value,
        "score": result.score,
        "method": result.method,
        "confidence": result.confidence,
        "resume_term_count": result.resume_terms,
        "jd_term_count": result.jd_terms,
        "shared_term_count": result.shared_terms,
        "shared_terms": shared_terms,
    }


# ============================================================================
# Validation
# ============================================================================

def validate_semantic_analysis(
    analysis: SemanticAnalysis,
) -> None:
    """
    Validate that SemanticAnalysis contains internally consistent values.
    """
    if not 0 <= analysis.score <= 100:
        raise ValueError(
            "Semantic similarity score must be between 0 and 100."
        )

    if not (
        MIN_SIMILARITY
        <= analysis.similarity_value
        <= MAX_SIMILARITY
    ):
        raise ValueError(
            "similarity_value must be between 0 and 1."
        )

    expected_score = round(
        analysis.similarity_value * 100.0,
        2,
    )

    if abs(
        expected_score - analysis.score
    ) > 0.01:
        raise ValueError(
            "Semantic score must equal similarity_value * 100."
        )

    if not analysis.method:
        raise ValueError(
            "Semantic similarity method must not be empty."
        )

    if not analysis.confidence:
        raise ValueError(
            "Semantic similarity confidence must not be empty."
        )

    if not isinstance(
        analysis.explanation,
        str,
    ):
        raise ValueError(
            "Semantic similarity explanation must be a string."
        )