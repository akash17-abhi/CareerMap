import type { RoadmapProfile } from "./roadmap";

export interface ResumeMetadata {
  name: string;
  type: string;
  size: number;
}

export interface ResumeExtractionResponse {
  profile?: Record<string, unknown>;
  resumeProfile?: Record<string, unknown>;
  data?: Record<string, unknown>;
  detail?: string;
}

export interface AnalyzerContext {
  role: string;

  matchScore: number;
  skillsMatchScore: number;
  keywordMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  semanticSimilarityScore: number;
  atsScore: number;

  skills: unknown[];
  missingSkills: unknown[];
  strengths: unknown[];
  improvements: unknown[];
}

export interface GenerateRoadmapRequest {
  source: "manual" | "cv";

  targetJobRole: string;

  profile?: RoadmapProfile;

  extractedResume?: Record<string, unknown>;

  resumeMetadata?: ResumeMetadata;

  analyzerContext: AnalyzerContext | null;
}

export interface GenerateRoadmapResponse {
  roadmap: Record<string, unknown>;

  detail?: string;
}