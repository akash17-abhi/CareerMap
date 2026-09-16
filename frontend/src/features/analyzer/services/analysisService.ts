import type {
  AnalyzerResult,
  CareerAnalysis,
  ConfidenceLevel,
  GapPriority,
  SkillStatus,
} from "@/features/analyzer/types/careerAnalysis";

import { apiUrl } from "../../../lib/api";

export interface AnalyzeResumeInput {
  resumeFile: File;
  jobDescription: string;
}

const API_ENDPOINT = apiUrl("/api/analyze");
const REQUEST_TIMEOUT_MS = 120_000;

/* ============================================================
   Raw backend types
   These match FastAPI / Pydantic exactly.
============================================================ */

type RawEvidenceType =
  | "project"
  | "experience"
  | "internship"
  | "education"
  | "certification"
  | "coursework"
  | "skills_section"
  | "keyword"
  | "other";

interface RawEvidenceRecord {
  source_type: RawEvidenceType;
  section: string;
  text: string;
  strength: number;
  confidence: ConfidenceLevel;
}

interface RawSkillMatch {
  id: string;
  name: string;
  mentioned: boolean;
  required_by_role: boolean;
  evidence_found: boolean;
  evidence: RawEvidenceRecord[];
  evidence_strength: number;
  confidence: ConfidenceLevel;
  score: number;
  status: SkillStatus;
}

interface RawMissingSkill {
  id: string;
  name: string;
  importance: GapPriority;
  reason: string;
  action: string;
  evidence_summary?: string | null;
}

interface RawKeywordMatch {
  keyword: string;
  normalized_keyword: string;
  matched: boolean;
  importance: GapPriority;
  score: number;
}

interface RawKeywordAnalysis {
  total_keywords: number;
  matched_keywords: number;
  required_keywords: number;
  matched_required_keywords: number;
  score: number;
  keywords: RawKeywordMatch[];
}

interface RawExperienceMatch {
  candidate_experience_summary: string | null;
  required_experience_summary: string | null;
  relevant_roles_found: number;
  relevant_projects_found: number;
  relevant_internships_found: number;
  score: number;
  confidence: ConfidenceLevel;
  explanation: string;
}

interface RawEducationMatch {
  candidate_education: string | null;
  required_education: string | null;
  matched: boolean;
  score: number;
  confidence: ConfidenceLevel;
  explanation: string;
}

interface RawSemanticAnalysis {
  score: number;
  method: string;
  similarity_value: number;
  confidence: ConfidenceLevel;
  explanation: string;
}

interface RawATSAnalysis {
  score: number;
  structure_score: number;
  section_clarity_score: number;
  keyword_readability_score: number;
  content_organization_score: number;
  formatting_score: number;
  detected_issues: string[];
  explanation: string;
}

interface RawScoreBreakdown {
  skill_match_score: number;
  keyword_match_score: number;
  experience_match_score: number;
  education_match_score: number;
  semantic_similarity_score: number;
  overall_match_score: number;

  skill_weight: number;
  keyword_weight: number;
  experience_weight: number;
  education_weight: number;
  semantic_weight: number;
}

interface RawResumeStrength {
  id: string;
  title: string;
  description: string;
  evidence: string;
  confidence: ConfidenceLevel;
}

interface RawImprovement {
  id: string;
  title: string;
  priority: GapPriority;
  problem: string;
  why_it_matters: string;
  action: string;
}

interface RawLocalAnalyzerResult {
  role: string;
  score_breakdown: RawScoreBreakdown;
  ats: RawATSAnalysis;
  skills: RawSkillMatch[];
  missing_skills: RawMissingSkill[];
  keywords: RawKeywordAnalysis;
  semantic: RawSemanticAnalysis;
  experience: RawExperienceMatch;
  education: RawEducationMatch;
  strengths: RawResumeStrength[];
  improvements: RawImprovement[];
}

interface RawGeminiValidationIssue {
  id: string;
  severity: "high" | "medium" | "low";
  area: string;
  issue: string;
  suggested_review: string;
}

interface RawGeminiValidation {
  is_consistent: boolean;
  confidence: ConfidenceLevel;
  issues: RawGeminiValidationIssue[];
  summary: string;
}

interface RawGeminiEnhancement {
  summary: string;
  match_explanation: string;
  strengths_explanation: string;
  gaps_explanation: string;
  recommendations_summary: string;
  next_steps_summary: string;
}

interface RawAnalyzerResult {
  local_analysis: RawLocalAnalyzerResult;
  gemini_validation?: RawGeminiValidation | null;
  gemini_enhancement?: RawGeminiEnhancement | null;
}

/* ============================================================
   API error
============================================================ */

export class AnalyzerApiError extends Error {
  status: number;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message);

    this.name = "AnalyzerApiError";
    this.status = status;
    this.details = details;
  }
}

/* ============================================================
   Public analyzer function
============================================================ */

export async function analyzeResume({
  resumeFile,
  jobDescription,
}: AnalyzeResumeInput): Promise<CareerAnalysis> {
  const formData = new FormData();

  /*
   * These MUST match the FastAPI endpoint:
   *
   * resume_file
   * job_description
   */
  formData.append(
    "resume_file",
    resumeFile,
  );

  formData.append(
    "job_description",
    jobDescription,
  );

  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

  try {
    const response = await fetch(
      API_ENDPOINT,
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      },
    );

    const data =
      await readJsonSafely(response);

    if (!response.ok) {
      throw new AnalyzerApiError(
        getApiErrorMessage(data),
        response.status,
        data,
      );
    }

    if (!isRawAnalyzerResult(data)) {
      throw new Error(
        "The analysis response is invalid or incomplete.",
      );
    }

    return normalizeAnalyzerResponse(
      data,
    );
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "The analysis is taking longer than expected. Please try again.",
      );
    }

    if (
      error instanceof TypeError
    ) {
      throw new Error(
        "Unable to connect to the CareerMap analyzer. Please check that the backend is running and try again.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/* ============================================================
   Backend → frontend mapper
============================================================ */

function normalizeAnalyzerResponse(
  raw: RawAnalyzerResult,
): CareerAnalysis {
  const local = raw.local_analysis;

  const scoreBreakdown =
    mapScoreBreakdown(
      local.score_breakdown,
    );

  const ats = mapATS(local.ats);

  const keywords =
    mapKeywordAnalysis(
      local.keywords,
    );

  const semantic =
    mapSemanticAnalysis(
      local.semantic,
    );

  const experience =
    mapExperienceMatch(
      local.experience,
    );

  const education =
    mapEducationMatch(
      local.education,
    );

  const skills =
    local.skills.map(
      mapSkillMatch,
    );

  const missingSkills =
    local.missing_skills.map(
      mapMissingSkill,
    );

  const strengths =
    local.strengths.map(
      mapResumeStrength,
    );

  const improvements =
    local.improvements.map(
      mapImprovement,
    );

  const geminiValidation =
    raw.gemini_validation
      ? mapGeminiValidation(
          raw.gemini_validation,
        )
      : null;

  const geminiEnhancement =
    raw.gemini_enhancement
      ? mapGeminiEnhancement(
          raw.gemini_enhancement,
        )
      : null;

  const localAnalysis = {
    role: local.role,
    scoreBreakdown,
    ats,
    skills,
    missingSkills,
    keywords,
    semantic,
    experience,
    education,
    strengths,
    improvements,
  };

  const analyzerResult: AnalyzerResult = {
    localAnalysis,
    geminiValidation,
    geminiEnhancement,
  };

  return {
    ...analyzerResult,

    role: local.role,

    matchScore:
      scoreBreakdown.overallMatchScore,

    atsScore:
      ats.score,

    skillsMatchScore:
      scoreBreakdown.skillMatchScore,

    keywordMatchScore:
      scoreBreakdown.keywordMatchScore,

    experienceMatchScore:
      scoreBreakdown.experienceMatchScore,

    educationMatchScore:
      scoreBreakdown.educationMatchScore,

    semanticSimilarityScore:
      scoreBreakdown.semanticSimilarityScore,

    aiSummary:
      geminiEnhancement?.summary ??
      buildFallbackSummary(
        local.role,
        scoreBreakdown.overallMatchScore,
      ),

    skills,
    missingSkills,
    strengths,
    improvements,

    scoreBreakdown,
    ats,
    keywords,
    semantic,
    experience,
    education,
  };
}

/* ============================================================
   Mapping helpers
============================================================ */

function mapSkillMatch(
  skill: RawSkillMatch,
) {
  return {
    id: skill.id,
    name: skill.name,
    mentioned: skill.mentioned,
    requiredByRole:
      skill.required_by_role,
    evidenceFound:
      skill.evidence_found,

    evidence:
      skill.evidence.map(
        (item) => ({
          sourceType:
            item.source_type,
          section:
            item.section,
          text: item.text,
          strength:
            item.strength,
          confidence:
            item.confidence,
        }),
      ),

    evidenceStrength:
      skill.evidence_strength,

    confidence:
      skill.confidence,

    score:
      skill.score,

    status:
      skill.status,
  };
}

function mapMissingSkill(
  skill: RawMissingSkill,
) {
  return {
    id: skill.id,
    name: skill.name,
    importance:
      skill.importance,
    reason:
      skill.reason,
    action:
      skill.action,
    evidenceSummary:
      skill.evidence_summary,
  };
}

function mapResumeStrength(
  strength: RawResumeStrength,
) {
  return {
    id: strength.id,
    title: strength.title,
    description:
      strength.description,
    evidence:
      strength.evidence,
    confidence:
      strength.confidence,
  };
}

function mapImprovement(
  improvement: RawImprovement,
) {
  return {
    id: improvement.id,
    title: improvement.title,
    priority:
      improvement.priority,
    problem:
      improvement.problem,
    whyItMatters:
      improvement.why_it_matters,
    action:
      improvement.action,
  };
}

function mapScoreBreakdown(
  breakdown: RawScoreBreakdown,
) {
  return {
    skillMatchScore:
      breakdown.skill_match_score,

    keywordMatchScore:
      breakdown.keyword_match_score,

    experienceMatchScore:
      breakdown.experience_match_score,

    educationMatchScore:
      breakdown.education_match_score,

    semanticSimilarityScore:
      breakdown.semantic_similarity_score,

    overallMatchScore:
      breakdown.overall_match_score,

    skillWeight:
      breakdown.skill_weight,

    keywordWeight:
      breakdown.keyword_weight,

    experienceWeight:
      breakdown.experience_weight,

    educationWeight:
      breakdown.education_weight,

    semanticWeight:
      breakdown.semantic_weight,
  };
}

function mapATS(
  ats: RawATSAnalysis,
) {
  return {
    score: ats.score,

    structureScore:
      ats.structure_score,

    sectionClarityScore:
      ats.section_clarity_score,

    keywordReadabilityScore:
      ats.keyword_readability_score,

    contentOrganizationScore:
      ats.content_organization_score,

    formattingScore:
      ats.formatting_score,

    detectedIssues:
      ats.detected_issues,

    explanation:
      ats.explanation,
  };
}

function mapKeywordAnalysis(
  keywords: RawKeywordAnalysis,
) {
  return {
    totalKeywords:
      keywords.total_keywords,

    matchedKeywords:
      keywords.matched_keywords,

    requiredKeywords:
      keywords.required_keywords,

    matchedRequiredKeywords:
      keywords.matched_required_keywords,

    score:
      keywords.score,

    keywords:
      keywords.keywords.map(
        (keyword) => ({
          keyword:
            keyword.keyword,

          normalizedKeyword:
            keyword.normalized_keyword,

          matched:
            keyword.matched,

          importance:
            keyword.importance,

          score:
            keyword.score,
        }),
      ),
  };
}

function mapSemanticAnalysis(
  semantic: RawSemanticAnalysis,
) {
  return {
    score:
      semantic.score,

    method:
      semantic.method,

    similarityValue:
      semantic.similarity_value,

    confidence:
      semantic.confidence,

    explanation:
      semantic.explanation,
  };
}

function mapExperienceMatch(
  experience: RawExperienceMatch,
) {
  return {
    candidateExperienceSummary:
      experience.candidate_experience_summary,

    requiredExperienceSummary:
      experience.required_experience_summary,

    relevantRolesFound:
      experience.relevant_roles_found,

    relevantProjectsFound:
      experience.relevant_projects_found,

    relevantInternshipsFound:
      experience.relevant_internships_found,

    score:
      experience.score,

    confidence:
      experience.confidence,

    explanation:
      experience.explanation,
  };
}

function mapEducationMatch(
  education: RawEducationMatch,
) {
  return {
    candidateEducation:
      education.candidate_education,

    requiredEducation:
      education.required_education,

    matched:
      education.matched,

    score:
      education.score,

    confidence:
      education.confidence,

    explanation:
      education.explanation,
  };
}

function mapGeminiValidation(
  validation: RawGeminiValidation,
) {
  return {
    isConsistent:
      validation.is_consistent,

    confidence:
      validation.confidence,

    issues:
      validation.issues.map(
        (issue) => ({
          id: issue.id,
          severity:
            issue.severity,

          area:
            issue.area,

          issue:
            issue.issue,

          suggestedReview:
            issue.suggested_review,
        }),
      ),

    summary:
      validation.summary,
  };
}

function mapGeminiEnhancement(
  enhancement: RawGeminiEnhancement,
) {
  return {
    summary:
      enhancement.summary,

    matchExplanation:
      enhancement.match_explanation,

    strengthsExplanation:
      enhancement.strengths_explanation,

    gapsExplanation:
      enhancement.gaps_explanation,

    recommendationsSummary:
      enhancement.recommendations_summary,

    nextStepsSummary:
      enhancement.next_steps_summary,
  };
}

/* ============================================================
   Runtime validation
============================================================ */

function isRawAnalyzerResult(
  value: unknown,
): value is RawAnalyzerResult {
  if (
    !isRecord(value)
  ) {
    return false;
  }

  if (
    !isRecord(
      value.local_analysis,
    )
  ) {
    return false;
  }

  const local =
    value.local_analysis;

  return (
    typeof local.role === "string" &&
    isRecord(
      local.score_breakdown,
    ) &&
    isRecord(local.ats) &&
    isRecord(local.keywords) &&
    isRecord(local.semantic) &&
    isRecord(local.experience) &&
    isRecord(local.education) &&
    Array.isArray(local.skills) &&
    Array.isArray(
      local.missing_skills,
    ) &&
    Array.isArray(local.strengths) &&
    Array.isArray(
      local.improvements,
    )
  );
}

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

/* ============================================================
   Error handling
============================================================ */

async function readJsonSafely(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  if (
    !contentType.includes(
      "application/json",
    )
  ) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getApiErrorMessage(
  data: unknown,
): string {
  if (isRecord(data)) {
    if (
      typeof data.detail === "string" &&
      data.detail.trim()
    ) {
      return data.detail;
    }

    if (
      typeof data.message === "string" &&
      data.message.trim()
    ) {
      return data.message;
    }
  }

  return "Unable to analyze your resume right now.";
}

/* ============================================================
   Fallback summary
============================================================ */

function buildFallbackSummary(
  role: string,
  score: number,
): string {
  const roundedScore =
    Math.round(score);

  if (roundedScore >= 85) {
    return `Your resume shows a strong overall fit for ${role}, with an overall match score of ${roundedScore}%.`;
  }

  if (roundedScore >= 70) {
    return `Your resume shows a good overall fit for ${role}, with an overall match score of ${roundedScore}%.`;
  }

  if (roundedScore >= 50) {
    return `Your resume shows a partial fit for ${role}, with an overall match score of ${roundedScore}%.`;
  }

  return `Your resume currently shows limited alignment with ${role}, with an overall match score of ${roundedScore}%.`;
}