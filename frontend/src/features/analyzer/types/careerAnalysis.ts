export type SkillStatus =
  | "strong"
  | "partial"
  | "missing";

export type GapPriority =
  | "high"
  | "medium"
  | "low";

export type EvidenceType =
  | "project"
  | "experience"
  | "internship"
  | "education"
  | "certification"
  | "course"
  | "coursework"
  | "skills_section"
  | "keyword"
  | "other";

export type ConfidenceLevel =
  | "high"
  | "medium"
  | "low";

export type ValidationSeverity =
  | "high"
  | "medium"
  | "low";

/* ============================================================
   Evidence
============================================================ */

export interface EvidenceRecord {
  sourceType: EvidenceType;
  section: string;
  text: string;
  strength: number;
  confidence: ConfidenceLevel;
}

/* ============================================================
   Skills
============================================================ */

export interface SkillMatch {
  id: string;
  name: string;
  mentioned: boolean;
  requiredByRole: boolean;
  evidenceFound: boolean;
  evidence: EvidenceRecord[];
  evidenceStrength: number;
  confidence: ConfidenceLevel;
  score: number;
  status: SkillStatus;
}

export interface MissingSkill {
  id: string;
  name: string;
  importance: GapPriority;
  reason: string;
  action: string;
  evidenceSummary?: string | null;
}

/* ============================================================
   Keywords
============================================================ */

export interface KeywordMatch {
  keyword: string;
  normalizedKeyword: string;
  matched: boolean;
  importance: GapPriority;
  score: number;
}

export interface KeywordAnalysis {
  totalKeywords: number;
  matchedKeywords: number;
  requiredKeywords: number;
  matchedRequiredKeywords: number;
  score: number;
  keywords: KeywordMatch[];
}

/* ============================================================
   Experience
============================================================ */

export interface ExperienceMatch {
  candidateExperienceSummary: string | null;
  requiredExperienceSummary: string | null;
  relevantRolesFound: number;
  relevantProjectsFound: number;
  relevantInternshipsFound: number;
  score: number;
  confidence: ConfidenceLevel;
  explanation: string;
}

/* ============================================================
   Education
============================================================ */

export interface EducationMatch {
  candidateEducation: string | null;
  requiredEducation: string | null;
  matched: boolean;
  score: number;
  confidence: ConfidenceLevel;
  explanation: string;
}

/* ============================================================
   Semantic
============================================================ */

export interface SemanticAnalysis {
  score: number;
  method: string;
  similarityValue: number;
  confidence: ConfidenceLevel;
  explanation: string;
}

/* ============================================================
   ATS
============================================================ */

export interface ATSAnalysis {
  score: number;
  structureScore: number;
  sectionClarityScore: number;
  keywordReadabilityScore: number;
  contentOrganizationScore: number;
  formattingScore: number;
  detectedIssues: string[];
  explanation: string;
}

/* ============================================================
   Score breakdown
============================================================ */

export interface ScoreBreakdown {
  skillMatchScore: number;
  keywordMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  semanticSimilarityScore: number;
  overallMatchScore: number;

  skillWeight: number;
  keywordWeight: number;
  experienceWeight: number;
  educationWeight: number;
  semanticWeight: number;
}

/* ============================================================
   Strengths
============================================================ */

export interface ResumeStrength {
  id: string;
  title: string;
  description: string;
  evidence: string;
  confidence: ConfidenceLevel;
}

/* ============================================================
   Improvements
============================================================ */

export interface Improvement {
  id: string;
  title: string;
  priority: GapPriority;
  problem: string;
  whyItMatters: string;
  action: string;
}

/* ============================================================
   Local analyzer result
============================================================ */

export interface LocalAnalyzerResult {
  role: string;
  scoreBreakdown: ScoreBreakdown;
  ats: ATSAnalysis;
  skills: SkillMatch[];
  missingSkills: MissingSkill[];
  keywords: KeywordAnalysis;
  semantic: SemanticAnalysis;
  experience: ExperienceMatch;
  education: EducationMatch;
  strengths: ResumeStrength[];
  improvements: Improvement[];
}

/* ============================================================
   Gemini validation
============================================================ */

export interface GeminiValidationIssue {
  id: string;
  severity: ValidationSeverity;
  area: string;
  issue: string;
  suggestedReview: string;
}

export interface GeminiValidation {
  isConsistent: boolean;
  confidence: ConfidenceLevel;
  issues: GeminiValidationIssue[];
  summary: string;
}

/* ============================================================
   Gemini enhancement
============================================================ */

export interface GeminiEnhancement {
  summary: string;
  matchExplanation: string;
  strengthsExplanation: string;
  gapsExplanation: string;
  recommendationsSummary: string;
  nextStepsSummary: string;
}

/* ============================================================
   Normalized frontend representation
============================================================ */

export interface AnalyzerResult {
  localAnalysis: LocalAnalyzerResult;
  geminiValidation: GeminiValidation | null;
  geminiEnhancement: GeminiEnhancement | null;
}

/* ============================================================
   UI-facing analysis
============================================================ */

export interface CareerAnalysis
  extends AnalyzerResult {
  role: string;

  matchScore: number;
  atsScore: number;
  skillsMatchScore: number;
  keywordMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  semanticSimilarityScore: number;

  aiSummary: string;

  skills: SkillMatch[];
  missingSkills: MissingSkill[];
  strengths: ResumeStrength[];
  improvements: Improvement[];

  scoreBreakdown: ScoreBreakdown;
  ats: ATSAnalysis;
  keywords: KeywordAnalysis;
  semantic: SemanticAnalysis;
  experience: ExperienceMatch;
  education: EducationMatch;
}