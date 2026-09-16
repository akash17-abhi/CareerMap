from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ============================================================
# TYPE DEFINITIONS
# ============================================================

SkillStatus = Literal[
    "strong",
    "partial",
    "missing",
]

GapPriority = Literal[
    "high",
    "medium",
    "low",
]

EvidenceType = Literal[
    "project",
    "experience",
    "internship",
    "education",
    "certification",
    "coursework",
    "skills_section",
    "keyword",
    "other",
]

ConfidenceLevel = Literal[
    "high",
    "medium",
    "low",
]


# ============================================================
# EVIDENCE
# ============================================================


class EvidenceRecord(BaseModel):
    """
    A traceable piece of evidence discovered in the user's resume.

    This is one of the core building blocks of CareerMap's
    explainable local analysis.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    source_type: EvidenceType
    section: str
    text: str

    # Local estimate of how useful this evidence is for proving
    # the presence/practical use of a skill or requirement.
    strength: int = Field(
        ge=0,
        le=100,
    )

    confidence: ConfidenceLevel


# ============================================================
# SKILL ANALYSIS
# ============================================================


class SkillMatch(BaseModel):
    """
    Canonical skill-level analysis.

    The local analyzer decides these values.
    Gemini must not silently modify them.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    id: str = Field(
        min_length=1,
        max_length=120,
    )

    name: str = Field(
        min_length=1,
        max_length=200,
    )

    # Was the skill explicitly or semantically detected in the resume?
    mentioned: bool

    # Is this skill relevant to the target role?
    required_by_role: bool

    # Was meaningful supporting evidence found?
    evidence_found: bool

    # Evidence records supporting this skill.
    evidence: list[EvidenceRecord] = Field(
        default_factory=list,
    )

    # Aggregate local evidence strength.
    evidence_strength: int = Field(
        ge=0,
        le=100,
    )

    # Confidence in the local classification.
    confidence: ConfidenceLevel

    # Final local skill score.
    score: int = Field(
        ge=0,
        le=100,
    )

    status: SkillStatus


# ============================================================
# MISSING / WEAK SKILLS
# ============================================================


class MissingSkill(BaseModel):
    """
    A skill that deserves additional attention.

    A missing/weak skill must reference the same identity used
    in SkillMatch.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    id: str = Field(
        min_length=1,
        max_length=120,
    )

    name: str = Field(
        min_length=1,
        max_length=200,
    )

    importance: GapPriority

    reason: str = Field(
        min_length=1,
        max_length=1000,
    )

    action: str = Field(
        min_length=1,
        max_length=1000,
    )

    # Optional evidence already found for the skill. This is useful
    # for cases such as Java being present but only weakly demonstrated.
    evidence_summary: str | None = Field(
        default=None,
        max_length=1000,
    )


# ============================================================
# KEYWORD ANALYSIS
# ============================================================


class KeywordMatch(BaseModel):
    """
    Local keyword-level comparison between the JD and resume.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    keyword: str = Field(
        min_length=1,
        max_length=200,
    )

    normalized_keyword: str = Field(
        min_length=1,
        max_length=200,
    )

    matched: bool

    importance: GapPriority

    score: int = Field(
        ge=0,
        le=100,
    )


class KeywordAnalysis(BaseModel):
    """
    Complete local keyword analysis.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    total_keywords: int = Field(
        ge=0,
    )

    matched_keywords: int = Field(
        ge=0,
    )

    required_keywords: int = Field(
        ge=0,
    )

    matched_required_keywords: int = Field(
        ge=0,
    )

    score: int = Field(
        ge=0,
        le=100,
    )

    keywords: list[KeywordMatch] = Field(
        default_factory=list,
    )

    @field_validator(
        "matched_keywords",
        "matched_required_keywords",
    )
    @classmethod
    def validate_keyword_counts(
        cls,
        value: int,
    ) -> int:
        if value < 0:
            raise ValueError(
                "Keyword counts cannot be negative."
            )

        return value


# ============================================================
# EXPERIENCE ANALYSIS
# ============================================================


class ExperienceMatch(BaseModel):
    """
    Local analysis of how the candidate's experience aligns
    with the target role.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    candidate_experience_summary: str | None = Field(
        default=None,
        max_length=1500,
    )

    required_experience_summary: str | None = Field(
        default=None,
        max_length=1500,
    )

    relevant_roles_found: int = Field(
        ge=0,
    )

    relevant_projects_found: int = Field(
        ge=0,
    )

    relevant_internships_found: int = Field(
        ge=0,
    )

    score: int = Field(
        ge=0,
        le=100,
    )

    confidence: ConfidenceLevel

    explanation: str = Field(
        min_length=1,
        max_length=1500,
    )


# ============================================================
# EDUCATION ANALYSIS
# ============================================================


class EducationMatch(BaseModel):
    """
    Local analysis of education alignment.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    candidate_education: str | None = Field(
        default=None,
        max_length=1000,
    )

    required_education: str | None = Field(
        default=None,
        max_length=1000,
    )

    matched: bool

    score: int = Field(
        ge=0,
        le=100,
    )

    confidence: ConfidenceLevel

    explanation: str = Field(
        min_length=1,
        max_length=1500,
    )


# ============================================================
# SEMANTIC SIMILARITY
# ============================================================


class SemanticAnalysis(BaseModel):
    """
    Local semantic comparison between resume content and the JD.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    score: int = Field(
        ge=0,
        le=100,
    )

    method: str = Field(
        min_length=1,
        max_length=200,
    )

    similarity_value: float = Field(
        ge=0.0,
        le=1.0,
    )

    confidence: ConfidenceLevel

    explanation: str = Field(
        min_length=1,
        max_length=1500,
    )


# ============================================================
# ATS ANALYSIS
# ============================================================


class ATSAnalysis(BaseModel):
    """
    Local ATS-readiness analysis.

    This score is independent from the overall role-fit score.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    score: int = Field(
        ge=0,
        le=100,
    )

    structure_score: int = Field(
        ge=0,
        le=100,
    )

    section_clarity_score: int = Field(
        ge=0,
        le=100,
    )

    keyword_readability_score: int = Field(
        ge=0,
        le=100,
    )

    content_organization_score: int = Field(
        ge=0,
        le=100,
    )

    formatting_score: int = Field(
        ge=0,
        le=100,
    )

    detected_issues: list[str] = Field(
        default_factory=list,
    )

    explanation: str = Field(
        min_length=1,
        max_length=2000,
    )


# ============================================================
# SCORE BREAKDOWN
# ============================================================


class ScoreBreakdown(BaseModel):
    """
    Deterministic role-fit scoring produced by the local analyzer.

    Gemini must not modify these values.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    skill_match_score: int = Field(
        ge=0,
        le=100,
    )

    keyword_match_score: int = Field(
        ge=0,
        le=100,
    )

    experience_match_score: int = Field(
        ge=0,
        le=100,
    )

    education_match_score: int = Field(
        ge=0,
        le=100,
    )

    semantic_similarity_score: int = Field(
        ge=0,
        le=100,
    )

    overall_match_score: int = Field(
        ge=0,
        le=100,
    )

    # Final weights used for the calculation.
    skill_weight: float = Field(
        default=0.40,
        ge=0.0,
        le=1.0,
    )

    keyword_weight: float = Field(
        default=0.20,
        ge=0.0,
        le=1.0,
    )

    experience_weight: float = Field(
        default=0.20,
        ge=0.0,
        le=1.0,
    )

    education_weight: float = Field(
        default=0.10,
        ge=0.0,
        le=1.0,
    )

    semantic_weight: float = Field(
        default=0.10,
        ge=0.0,
        le=1.0,
    )

    @field_validator(
        "semantic_weight",
    )
    @classmethod
    def validate_total_weights(
        cls,
        value: float,
        info,
    ) -> float:
        """
        The complete weight-sum validation is performed by the analyzer
        engine because validators for individual fields cannot reliably
        validate the full object before all values are available.
        """

        return value


# ============================================================
# RESUME STRENGTHS
# ============================================================


class ResumeStrength(BaseModel):
    """
    Evidence-backed strength identified by the local analyzer.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    id: str = Field(
        min_length=1,
        max_length=120,
    )

    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str = Field(
        min_length=1,
        max_length=1000,
    )

    evidence: str = Field(
        min_length=1,
        max_length=1500,
    )

    confidence: ConfidenceLevel


# ============================================================
# IMPROVEMENTS
# ============================================================


class Improvement(BaseModel):
    """
    Actionable improvement recommendation.

    The recommendation is based on local analysis and can later
    be rewritten/polished by Gemini.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    id: str = Field(
        min_length=1,
        max_length=120,
    )

    title: str = Field(
        min_length=1,
        max_length=250,
    )

    priority: GapPriority

    problem: str = Field(
        min_length=1,
        max_length=1500,
    )

    why_it_matters: str = Field(
        min_length=1,
        max_length=1500,
    )

    action: str = Field(
        min_length=1,
        max_length=1500,
    )


# ============================================================
# LOCAL ANALYZER RESULT
# ============================================================


class LocalAnalyzerResult(BaseModel):
    """
    Complete result produced by CareerMap's local analyzer.

    This object is the factual source of truth.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    role: str = Field(
        min_length=1,
        max_length=250,
    )

    score_breakdown: ScoreBreakdown

    ats: ATSAnalysis

    skills: list[SkillMatch] = Field(
        default_factory=list,
    )

    missing_skills: list[MissingSkill] = Field(
        default_factory=list,
    )

    keywords: KeywordAnalysis

    semantic: SemanticAnalysis

    experience: ExperienceMatch

    education: EducationMatch

    strengths: list[ResumeStrength] = Field(
        default_factory=list,
    )

    improvements: list[Improvement] = Field(
        default_factory=list,
    )


# ============================================================
# GEMINI VALIDATION
# ============================================================


class GeminiValidationIssue(BaseModel):
    """
    A possible issue detected by Gemini while reviewing the
    local analysis.

    Gemini can flag a problem, but cannot directly modify the
    local result.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    id: str = Field(
        min_length=1,
        max_length=120,
    )

    severity: Literal[
        "high",
        "medium",
        "low",
    ]

    area: str = Field(
        min_length=1,
        max_length=200,
    )

    issue: str = Field(
        min_length=1,
        max_length=1500,
    )

    suggested_review: str = Field(
        min_length=1,
        max_length=1500,
    )


class GeminiValidation(BaseModel):
    """
    Gemini's independent review of the local analysis.

    It is advisory only.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    is_consistent: bool

    confidence: ConfidenceLevel

    issues: list[GeminiValidationIssue] = Field(
        default_factory=list,
    )

    summary: str = Field(
        min_length=1,
        max_length=2000,
    )


# ============================================================
# GEMINI PRESENTATION / ENHANCEMENT
# ============================================================


class GeminiEnhancement(BaseModel):
    """
    Human-friendly content generated from the local analysis.

    Gemini may improve language and explanation, but must remain
    grounded in the supplied local result.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    summary: str = Field(
        min_length=1,
        max_length=3000,
    )

    match_explanation: str = Field(
        min_length=1,
        max_length=2000,
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


# ============================================================
# FINAL ANALYZER RESPONSE
# ============================================================


class AnalyzerResult(BaseModel):
    """
    Final Analyzer response.

    Local analysis remains authoritative.
    Gemini provides validation and presentation enhancement.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    local_analysis: LocalAnalyzerResult

    gemini_validation: GeminiValidation | None = None

    gemini_enhancement: GeminiEnhancement | None = None


# ============================================================
# CROSS-FIELD VALIDATION HELPERS
# ============================================================


def validate_score_weights(
    score_breakdown: ScoreBreakdown,
) -> None:
    """
    Ensure the configured local scoring weights sum to 1.0.
    """

    total = (
        score_breakdown.skill_weight
        + score_breakdown.keyword_weight
        + score_breakdown.experience_weight
        + score_breakdown.education_weight
        + score_breakdown.semantic_weight
    )

    if abs(total - 1.0) > 1e-6:
        raise ValueError(
            "Analyzer scoring weights must sum to 1.0. "
            f"Received {total:.6f}."
        )


def validate_skill_consistency(
    analysis: LocalAnalyzerResult,
) -> None:
    """
    Ensure missing/weak skill records reference the same skills
    used by the canonical skills array.

    This does NOT say that a skill must be status='missing'.
    A partial skill can legitimately appear in missing_skills
    when it needs stronger evidence.
    """

    skill_map = {
        skill.id: skill
        for skill in analysis.skills
    }

    if len(skill_map) != len(analysis.skills):
        raise ValueError(
            "Duplicate skill IDs were found in the local analysis."
        )

    skill_name_map = {
        skill.name.strip().casefold(): skill.id
        for skill in analysis.skills
    }

    if len(skill_name_map) != len(analysis.skills):
        raise ValueError(
            "Duplicate skill names were found in the local analysis."
        )

    missing_ids: set[str] = set()

    for missing_skill in analysis.missing_skills:
        skill = skill_map.get(missing_skill.id)

        if skill is None:
            raise ValueError(
                "A missing/weak skill does not exist in the "
                f"canonical skills list: {missing_skill.id}"
            )

        if skill.name != missing_skill.name:
            raise ValueError(
                "Skill identity mismatch between skills and "
                f"missing_skills for ID '{missing_skill.id}'."
            )

        if skill.status == "strong":
            raise ValueError(
                "A strong skill cannot be included in "
                f"missing_skills: {skill.name}"
            )

        if missing_skill.id in missing_ids:
            raise ValueError(
                "Duplicate missing/weak skill ID: "
                f"{missing_skill.id}"
            )

        missing_ids.add(missing_skill.id)

    # Every explicitly missing skill must have a corresponding
    # detailed missing/weak record.
    for skill in analysis.skills:
        if skill.status == "missing" and skill.id not in missing_ids:
            raise ValueError(
                "A skill marked as missing does not have a corresponding "
                f"missing_skills record: {skill.name}"
            )


def validate_analyzer_result(
    analysis: LocalAnalyzerResult,
) -> LocalAnalyzerResult:
    """
    Run cross-field validation after the complete local analysis
    has been constructed.
    """

    validate_score_weights(
        analysis.score_breakdown,
    )

    validate_skill_consistency(
        analysis,
    )

    return analysis