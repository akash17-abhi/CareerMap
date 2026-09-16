from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import Iterable, Sequence

from schemas.analyzer import (
    KeywordAnalysis,
    KeywordMatch,
)
from services.jd_extractor import JDProfile
from services.resume_extractor import ResumeProfile


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------


def normalize_keyword(value: str) -> str:
    """
    Normalize a keyword for deterministic lexical matching.

    Examples:
        "Machine-Learning" -> "machine-learning"
        "REST APIs"        -> "rest apis"
        "C++"              -> "c++"
    """

    if not value:
        return ""

    text = unicodedata.normalize(
        "NFKC",
        str(value),
    ).lower().strip()

    text = (
        text.replace("–", "-")
        .replace("—", "-")
        .replace("−", "-")
    )

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

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def keyword_tokens(
    value: str,
) -> tuple[str, ...]:
    """
    Return normalized word-like tokens while preserving technical
    punctuation such as '+' and '#'.
    """

    normalized = normalize_keyword(
        value,
    )

    if not normalized:
        return ()

    return tuple(
        re.findall(
            r"[a-z0-9+#.]+",
            normalized,
        )
    )


def canonical_keyword(
    value: str,
) -> str:
    """
    Produce a stable canonical representation for comparisons.
    """

    normalized = normalize_keyword(
        value,
    )

    if not normalized:
        return ""

    normalized = re.sub(
        r"[(),:;]+",
        " ",
        normalized,
    )

    normalized = re.sub(
        r"\s+",
        " ",
        normalized,
    ).strip()

    return normalized


# ---------------------------------------------------------------------------
# Keyword aliases
# ---------------------------------------------------------------------------


KEYWORD_ALIASES: dict[str, set[str]] = {
    "machine learning": {
        "machine learning",
        "machine-learning",
        "ml",
    },
    "artificial intelligence": {
        "artificial intelligence",
        "artificial-intelligence",
        "ai",
    },
    "natural language processing": {
        "natural language processing",
        "natural-language processing",
        "nlp",
    },
    "scikit learn": {
        "scikit learn",
        "scikit-learn",
        "sklearn",
    },
    "deep learning": {
        "deep learning",
        "deep-learning",
        "dl",
    },
    "data mining": {
        "data mining",
    },
    "data warehousing": {
        "data warehousing",
        "data warehouse",
    },
    "rest api": {
        "rest api",
        "rest apis",
        "restful api",
        "restful apis",
    },
    "application programming interface": {
        "application programming interface",
        "api",
        "apis",
    },
    "object oriented programming": {
        "object oriented programming",
        "object-oriented programming",
        "oop",
    },
    "database management system": {
        "database management system",
        "database management systems",
        "dbms",
    },
    "matplotlib": {
        "matplotlib",
    },
    "seaborn": {
        "seaborn",
    },
    "flask": {
        "flask",
    },
    "jupyter": {
        "jupyter",
        "jupyter notebook",
        "jupyter notebooks",
    },
    "git": {
        "git",
    },
    "github": {
        "github",
        "git hub",
    },
}


def _build_alias_lookup() -> dict[str, str]:
    lookup: dict[str, str] = {}

    for canonical, aliases in KEYWORD_ALIASES.items():
        canonical_normalized = canonical_keyword(
            canonical,
        )

        lookup[canonical_normalized] = canonical_normalized

        for alias in aliases:
            normalized = canonical_keyword(
                alias,
            )

            if normalized:
                lookup[normalized] = canonical_normalized

    return lookup


ALIAS_LOOKUP = _build_alias_lookup()


# ---------------------------------------------------------------------------
# Internal representation
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class NormalizedKeyword:
    original: str
    normalized: str
    canonical: str
    importance: str
    source: str


# ---------------------------------------------------------------------------
# Generic helpers
# ---------------------------------------------------------------------------


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


def _contains_keyword(
    text: str,
    keyword: str,
) -> bool:
    """
    Boundary-aware keyword matching.

    Prevents "java" from matching "javascript" while still
    supporting phrases and technical punctuation.
    """

    source = canonical_keyword(
        text,
    )

    target = canonical_keyword(
        keyword,
    )

    if not source or not target:
        return False

    pattern = re.escape(
        target,
    )

    return (
        re.search(
            rf"(?<![a-z0-9+#.]){pattern}(?![a-z0-9+#.])",
            source,
            flags=re.IGNORECASE,
        )
        is not None
    )


def _keyword_present_with_aliases(
    text: str,
    keyword: str,
) -> tuple[bool, str]:
    """
    Check a keyword and its known aliases.

    Returns:
        (matched, matched_form)
    """

    normalized_keyword = canonical_keyword(
        keyword,
    )

    if not normalized_keyword:
        return False, ""

    if _contains_keyword(
        text,
        normalized_keyword,
    ):
        return True, normalized_keyword

    canonical = ALIAS_LOOKUP.get(
        normalized_keyword,
    )

    if not canonical:
        return False, ""

    aliases = KEYWORD_ALIASES.get(
        canonical,
        set(),
    )

    candidates = {
        canonical,
        *aliases,
    }

    for candidate in candidates:
        if _contains_keyword(
            text,
            candidate,
        ):
            return True, candidate

    return False, ""


def _unique_keep_order(
    values: Iterable[str],
) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []

    for value in values:
        normalized = canonical_keyword(
            value,
        )

        if not normalized or normalized in seen:
            continue

        seen.add(normalized)
        result.append(
            value.strip(),
        )

    return result


def _importance_weight(
    importance: str,
) -> float:
    normalized = _safe_text(
        importance,
    ).casefold()

    if normalized in {
        "required",
        "high",
    }:
        return 1.0

    if normalized in {
        "preferred",
        "medium",
    }:
        return 0.5

    return 0.25


def _normalize_importance(
    importance: object,
) -> str:
    value = _safe_text(
        importance,
    ).casefold()

    if value in {
        "required",
        "must",
        "mandatory",
        "essential",
        "high",
    }:
        return "required"

    if value in {
        "preferred",
        "nice to have",
        "nice-to-have",
        "plus",
        "desired",
        "optional",
        "medium",
    }:
        return "preferred"

    return "preferred"


# ---------------------------------------------------------------------------
# Extract resume search text
# ---------------------------------------------------------------------------


def build_resume_keyword_text(
    resume: ResumeProfile,
) -> str:
    """
    Build one searchable resume representation.

    The raw extracted resume text is always included so keyword matching
    does not depend on the shape of the structured extractor objects.
    """

    parts: list[str] = []

    raw_text = _safe_text(
        _get_attr(
            resume,
            "raw_text",
            "",
        )
    )

    if raw_text:
        parts.append(
            raw_text,
        )

    summary = _safe_text(
        _get_attr(
            resume,
            "summary",
            "",
        )
    )

    if summary:
        parts.append(
            summary,
        )

    sections = _get_attr(
        resume,
        "sections",
        [],
    ) or []

    for section in sections:
        section_name = _safe_text(
            _get_attr(
                section,
                "name",
                _get_attr(
                    section,
                    "title",
                    "",
                ),
            )
        )

        section_text = _safe_text(
            _get_attr(
                section,
                "raw_text",
                _get_attr(
                    section,
                    "content",
                    "",
                ),
            )
        )

        if section_name:
            parts.append(
                section_name,
            )

        if section_text:
            parts.append(
                section_text,
            )

    # ResumeSkillEvidence stores the canonical DetectedSkill under
    # skill.skill. Include the nested names as an additional searchable
    # representation while preserving raw_text as the primary source.
    skills = _get_attr(
        resume,
        "skills",
        [],
    ) or []

    for resume_skill in skills:
        skill_identity = _get_attr(
            resume_skill,
            "skill",
            resume_skill,
        )

        skill_name = _safe_text(
            _get_attr(
                skill_identity,
                "name",
                "",
            )
        )

        if skill_name:
            parts.append(
                skill_name,
            )

        evidence = _get_attr(
            resume_skill,
            "evidence",
            [],
        ) or []

        for evidence_item in evidence:
            evidence_text = _safe_text(
                _get_attr(
                    evidence_item,
                    "text",
                    _get_attr(
                        evidence_item,
                        "matched_text",
                        "",
                    ),
                )
            )

            if evidence_text:
                parts.append(
                    evidence_text,
                )

    for collection_name in (
        "experience",
        "projects",
        "education",
        "certifications",
        "achievements",
        "tools",
    ):
        collection = _get_attr(
            resume,
            collection_name,
            [],
        ) or []

        for item in collection:
            if isinstance(item, str):
                if item.strip():
                    parts.append(
                        item.strip(),
                    )
                continue

            for field_name in (
                "name",
                "title",
                "role",
                "position",
                "organization",
                "company",
                "institution",
                "qualification",
                "degree",
                "description",
                "raw_text",
                "text",
                "technologies",
            ):
                value = _get_attr(
                    item,
                    field_name,
                    "",
                )

                if isinstance(value, (list, tuple)):
                    for nested in value:
                        nested_text = _safe_text(
                            nested,
                        )

                        if nested_text:
                            parts.append(
                                nested_text,
                            )
                elif value:
                    parts.append(
                        _safe_text(value),
                    )

            for field_name in (
                "bullets",
                "responsibilities",
                "evidence",
                "lines",
            ):
                values = _get_attr(
                    item,
                    field_name,
                    [],
                ) or []

                for value in values:
                    if isinstance(value, str):
                        if value.strip():
                            parts.append(
                                value.strip(),
                            )
                        continue

                    nested_text = _safe_text(
                        _get_attr(
                            value,
                            "text",
                            _get_attr(
                                value,
                                "matched_text",
                                "",
                            ),
                        )
                    )

                    if nested_text:
                        parts.append(
                            nested_text,
                        )

    return "\n".join(
        part
        for part in parts
        if part
    )


# ---------------------------------------------------------------------------
# JD skill / keyword extraction
# ---------------------------------------------------------------------------


def _extract_jd_skill_candidates(
    jd: JDProfile,
) -> list[NormalizedKeyword]:
    """
    Build keyword candidates from the canonical JD skill vocabulary.

    This is intentionally separate from the skill *score*. The keyword
    matcher only checks whether the terminology appears in resume text.
    """

    candidates: list[NormalizedKeyword] = []

    all_skills = _get_attr(
        jd,
        "all_skills",
        [],
    ) or []

    required_skills = _get_attr(
        jd,
        "required_skills",
        [],
    ) or []

    preferred_skills = _get_attr(
        jd,
        "preferred_skills",
        [],
    ) or []

    required_ids: set[str] = set()

    for item in required_skills:
        skill = _get_attr(
            item,
            "skill",
            item,
        )

        skill_id = canonical_keyword(
            _safe_text(
                _get_attr(
                    skill,
                    "id",
                    _get_attr(
                        item,
                        "skill_id",
                        "",
                    ),
                )
            )
        )

        if skill_id:
            required_ids.add(
                skill_id,
            )

    for item in all_skills:
        skill = _get_attr(
            item,
            "skill",
            item,
        )

        name = _safe_text(
            _get_attr(
                skill,
                "name",
                _get_attr(
                    item,
                    "name",
                    _get_attr(
                        item,
                        "skill_name",
                        "",
                    ),
                ),
            )
        )

        if not name:
            continue

        skill_id = canonical_keyword(
            _safe_text(
                _get_attr(
                    skill,
                    "id",
                    _get_attr(
                        item,
                        "skill_id",
                        "",
                    ),
                )
            )
        )

        explicit_required = bool(
            _get_attr(
                item,
                "explicitly_required",
                False,
            )
        )

        importance = (
            "required"
            if explicit_required
            or skill_id in required_ids
            else "preferred"
        )

        candidates.append(
            NormalizedKeyword(
                original=name,
                normalized=normalize_keyword(name),
                canonical=canonical_keyword(name),
                importance=importance,
                source="jd_skill",
            )
        )

    # Defensive fallback for older JDProfile variants.
    if not candidates:
        raw_skills = _get_attr(
            jd,
            "skills",
            _get_attr(
                jd,
                "skill_requirements",
                [],
            ),
        ) or []

        for item in raw_skills:
            skill = _get_attr(
                item,
                "skill",
                item,
            )

            name = _safe_text(
                _get_attr(
                    skill,
                    "name",
                    _get_attr(
                        item,
                        "name",
                        _get_attr(
                            item,
                            "skill_name",
                            "",
                        ),
                    ),
                )
            )

            if not name:
                continue

            required = bool(
                _get_attr(
                    item,
                    "explicitly_required",
                    _get_attr(
                        item,
                        "required",
                    False),
                )
            )

            importance = (
                "required"
                if required
                else "preferred"
            )

            candidates.append(
                NormalizedKeyword(
                    original=name,
                    normalized=normalize_keyword(name),
                    canonical=canonical_keyword(name),
                    importance=importance,
                    source="jd_skill_fallback",
                )
            )

    return candidates


def _extract_short_jd_keywords(
    jd: JDProfile,
) -> list[NormalizedKeyword]:
    """
    Add a small number of short lexical keywords from jd.keywords.

    Long requirement sentences are deliberately excluded. This prevents
    the old implementation from treating an entire requirement sentence
    as a single keyword.
    """

    candidates: list[NormalizedKeyword] = []

    explicit_keywords = _get_attr(
        jd,
        "keywords",
        [],
    ) or []

    for keyword in explicit_keywords:
        if isinstance(
            keyword,
            str,
        ):
            text = keyword.strip()
            importance = "preferred"
        else:
            text = _safe_text(
                _get_attr(
                    keyword,
                    "keyword",
                    _get_attr(
                        keyword,
                        "name",
                        _get_attr(
                            keyword,
                            "text",
                            "",
                        ),
                    ),
                )
            )

            importance = _normalize_importance(
                _get_attr(
                    keyword,
                    "importance",
                    _get_attr(
                        keyword,
                        "priority",
                        "preferred",
                    ),
                )
            )

        canonical = canonical_keyword(
            text,
        )

        if not canonical:
            continue

        tokens = keyword_tokens(
            canonical,
        )

        if not 1 <= len(tokens) <= 3:
            continue

        if _looks_like_noise_keyword(
            text,
        ):
            continue

        candidates.append(
            NormalizedKeyword(
                original=text,
                normalized=normalize_keyword(text),
                canonical=canonical,
                importance=importance,
                source="jd_keyword",
            )
        )

    return candidates


def _requirement_keyword_candidates(
    jd: JDProfile,
) -> list[NormalizedKeyword]:
    """
    Return lexical JD keyword candidates.

    Crucially, JDRequirement.text is NOT treated as a single keyword.
    Requirement sentences can contain many words and would otherwise
    distort the keyword metric.
    """

    return (
        _extract_jd_skill_candidates(jd)
        + _extract_short_jd_keywords(jd)
    )


# ---------------------------------------------------------------------------
# Candidate filtering
# ---------------------------------------------------------------------------


def _looks_like_noise_keyword(
    keyword: str,
) -> bool:
    normalized = canonical_keyword(
        keyword,
    )

    if not normalized:
        return True

    generic_terms = {
        "a",
        "an",
        "the",
        "and",
        "or",
        "to",
        "of",
        "for",
        "with",
        "in",
        "on",
        "by",
        "from",
        "candidate",
        "candidates",
        "developer",
        "developers",
        "engineer",
        "engineering",
        "experience",
        "skills",
        "skill",
        "knowledge",
        "ability",
        "abilities",
        "team",
        "teams",
        "work",
        "working",
        "environment",
        "company",
        "role",
        "responsibility",
        "responsibilities",
        "qualification",
        "qualifications",
        "education",
        "communication",
        "communication skills",
        "problem solving",
        "full time",
        "entry level",
        "fresher",
        "location",
        "salary",
        "department",
        "remote",
    }

    if normalized in generic_terms:
        return True

    tokens = keyword_tokens(
        normalized,
    )

    if not tokens:
        return True

    # Never score full sentences.
    if len(tokens) > 4:
        return True

    return False


def _deduplicate_keywords(
    candidates: Sequence[NormalizedKeyword],
) -> list[NormalizedKeyword]:
    """
    Deduplicate equivalent keyword candidates and preserve the strongest
    importance: required > preferred.
    """

    merged: dict[str, NormalizedKeyword] = {}

    for candidate in candidates:
        if not candidate.canonical:
            continue

        if _looks_like_noise_keyword(
            candidate.original,
        ):
            continue

        current = merged.get(
            candidate.canonical,
        )

        if current is None:
            merged[candidate.canonical] = candidate
            continue

        if (
            _importance_weight(
                candidate.importance,
            )
            > _importance_weight(
                current.importance,
            )
        ):
            merged[candidate.canonical] = candidate

    return list(
        merged.values(),
    )


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------


def _keyword_match_score(
    matched: bool,
) -> float:
    """
    Keyword score is binary lexical coverage.

    Practical skill depth is deliberately excluded. That belongs to the
    skill matcher.
    """

    return 100.0 if matched else 0.0


def _weighted_keyword_score(
    keyword_matches: Sequence[KeywordMatch],
) -> float:
    if not keyword_matches:
        return 0.0

    numerator = 0.0
    denominator = 0.0

    for match in keyword_matches:
        importance = (
            "required"
            if match.importance == "high"
            else "preferred"
        )

        weight = _importance_weight(
            importance,
        )

        numerator += (
            float(match.score) * weight
        )

        denominator += weight

    if denominator == 0.0:
        return 0.0

    return round(
        numerator / denominator,
        2,
    )


# ---------------------------------------------------------------------------
# Public matching API
# ---------------------------------------------------------------------------


def match_keywords(
    resume: ResumeProfile,
    jd: JDProfile,
) -> KeywordAnalysis:
    """
    Match important JD terminology against the candidate resume.

    This metric is fully independent from skill evidence scores.

    It measures:
        - whether important JD terms are present in resume text;
        - required-term coverage;
        - preferred-term coverage.

    It does NOT measure:
        - practical skill depth;
        - project strength;
        - confidence of evidence;
        - years of experience.
    """

    resume_text = build_resume_keyword_text(
        resume,
    )

    raw_candidates = _requirement_keyword_candidates(
        jd,
    )

    candidates = _deduplicate_keywords(
        raw_candidates,
    )

    keyword_results: list[KeywordMatch] = []

    for candidate in candidates:
        matched, _matched_form = (
            _keyword_present_with_aliases(
                resume_text,
                candidate.original,
            )
        )

        score = _keyword_match_score(
            matched,
        )

        importance = (
            "high"
            if candidate.importance == "required"
            else "medium"
        )

        keyword_results.append(
            KeywordMatch(
                keyword=candidate.original,
                normalized_keyword=candidate.normalized,
                matched=matched,
                importance=importance,
                score=score,
            )
        )

    total_keywords = len(
        keyword_results,
    )

    matched_keywords = sum(
        1
        for item in keyword_results
        if item.matched
    )

    required_items = [
        item
        for item in keyword_results
        if item.importance == "high"
    ]

    preferred_items = [
        item
        for item in keyword_results
        if item.importance != "high"
    ]

    matched_required_items = [
        item
        for item in required_items
        if item.matched
    ]

    matched_preferred_items = [
        item
        for item in preferred_items
        if item.matched
    ]

    required_coverage = (
        (
            len(matched_required_items)
            / len(required_items)
        )
        * 100.0
        if required_items
        else None
    )

    preferred_coverage = (
        (
            len(matched_preferred_items)
            / len(preferred_items)
        )
        * 100.0
        if preferred_items
        else None
    )

    # Required terminology carries more importance, but preferred-only
    # JDs remain meaningful and score according to their actual coverage.
    if (
        required_coverage is not None
        and preferred_coverage is not None
    ):
        final_score = (
            required_coverage * 0.70
            + preferred_coverage * 0.30
        )
    elif required_coverage is not None:
        final_score = required_coverage
    elif preferred_coverage is not None:
        final_score = preferred_coverage
    else:
        final_score = 0.0

    final_score = max(
        0.0,
        min(
            100.0,
            round(
                final_score,
                2,
            ),
        ),
    )

    # KeywordAnalysis.score is an integer in the current schema.
    final_score_int = int(
        round(final_score),
    )

    analysis = KeywordAnalysis(
        total_keywords=total_keywords,
        matched_keywords=matched_keywords,
        required_keywords=len(
            required_items,
        ),
        matched_required_keywords=len(
            matched_required_items,
        ),
        score=final_score_int,
        keywords=keyword_results,
    )

    validate_keyword_analysis(
        analysis,
    )

    return analysis


# ---------------------------------------------------------------------------
# Convenience helpers
# ---------------------------------------------------------------------------


def extract_unique_jd_keywords(
    jd: JDProfile,
) -> list[str]:
    """
    Return clean, unique lexical JD keywords without scoring them.
    """

    candidates = _deduplicate_keywords(
        _requirement_keyword_candidates(jd),
    )

    return [
        candidate.original
        for candidate in candidates
    ]


def matched_keywords_only(
    analysis: KeywordAnalysis,
) -> list[KeywordMatch]:
    """
    Return only matched keyword records.
    """

    return [
        item
        for item in analysis.keywords
        if item.matched
    ]


def missing_keywords_only(
    analysis: KeywordAnalysis,
) -> list[KeywordMatch]:
    """
    Return only unmatched keyword records.
    """

    return [
        item
        for item in analysis.keywords
        if not item.matched
    ]


def required_missing_keywords(
    analysis: KeywordAnalysis,
) -> list[KeywordMatch]:
    """
    Return unmatched required keyword records.
    """

    return [
        item
        for item in analysis.keywords
        if item.importance == "high"
        and not item.matched
    ]


# ---------------------------------------------------------------------------
# Lightweight validation
# ---------------------------------------------------------------------------


def validate_keyword_analysis(
    analysis: KeywordAnalysis,
) -> None:
    """
    Validate KeywordAnalysis invariants.
    """

    if analysis.total_keywords < 0:
        raise ValueError(
            "total_keywords cannot be negative.",
        )

    if analysis.matched_keywords < 0:
        raise ValueError(
            "matched_keywords cannot be negative.",
        )

    if analysis.required_keywords < 0:
        raise ValueError(
            "required_keywords cannot be negative.",
        )

    if analysis.matched_required_keywords < 0:
        raise ValueError(
            "matched_required_keywords cannot be negative.",
        )

    if (
        analysis.matched_keywords
        > analysis.total_keywords
    ):
        raise ValueError(
            "matched_keywords cannot exceed total_keywords.",
        )

    if (
        analysis.matched_required_keywords
        > analysis.required_keywords
    ):
        raise ValueError(
            "matched_required_keywords cannot exceed required_keywords.",
        )

    if not 0 <= analysis.score <= 100:
        raise ValueError(
            "Keyword analysis score must be between 0 and 100.",
        )

    if len(analysis.keywords) != analysis.total_keywords:
        raise ValueError(
            "Keyword result count must equal total_keywords.",
        )

    actual_matched = sum(
        1
        for item in analysis.keywords
        if item.matched
    )

    if actual_matched != analysis.matched_keywords:
        raise ValueError(
            "matched_keywords does not match keyword result records.",
        )

    actual_required = sum(
        1
        for item in analysis.keywords
        if item.importance == "high"
    )

    if actual_required != analysis.required_keywords:
        raise ValueError(
            "required_keywords does not match keyword result records.",
        )

    actual_matched_required = sum(
        1
        for item in analysis.keywords
        if item.importance == "high"
        and item.matched
    )

    if (
        actual_matched_required
        != analysis.matched_required_keywords
    ):
        raise ValueError(
            "matched_required_keywords does not match keyword result records.",
        )
