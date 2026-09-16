import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CareerAnalysis } from "@/features/analyzer/types/careerAnalysis";

import type {
  GeneratedRoadmap,
  RoadmapProfile,
} from "@/features/roadmap/types/roadmap";

type RoadmapSource =
  | "analyzer"
  | "cv"
  | "manual"
  | null;

export interface ResumeMetadata {
  name: string;
  type: string;
  size: number;
}

export interface RoadmapSessionInput {
  source: "manual" | "cv";

  targetJobRole: string;

  profile?: RoadmapProfile;

  extractedResume?: Record<string, unknown>;

  resumeMetadata?: ResumeMetadata;

  analyzerContext?: unknown;

  generatedRoadmap?: GeneratedRoadmap;

  generatedAt?: string;
}

interface StoredCareerMapSession {
  version: 2;

  analysis: CareerAnalysis | null;

  analyzedRole: string | null;

  resumeMetadata: ResumeMetadata | null;

  roadmap: GeneratedRoadmap | null;

  roadmapInput: RoadmapSessionInput | null;

  roadmapSource: RoadmapSource;
}

export interface CareerMapSessionValue {
  analysis: CareerAnalysis | null;

  analyzedRole: string | null;

  resumeMetadata: ResumeMetadata | null;

  roadmap: GeneratedRoadmap | null;

  roadmapInput: RoadmapSessionInput | null;

  roadmapSource: RoadmapSource;

  setAnalysis: (
    analysis: CareerAnalysis | null,
  ) => void;

  setAnalyzedRole: (
    role: string | null,
  ) => void;

  setResumeMetadata: (
    metadata: ResumeMetadata | null,
  ) => void;

  setRoadmap: (
    roadmap: GeneratedRoadmap | null,
  ) => void;

  setRoadmapInput: (
    input: RoadmapSessionInput | null,
  ) => void;

  setRoadmapSource: (
    source: RoadmapSource,
  ) => void;

  clearAnalysis: () => void;

  clearRoadmap: () => void;

  clearSession: () => void;
}

const STORAGE_KEY =
  "careermap:temporary-session:v2";

const LEGACY_STORAGE_KEY =
  "careermap:temporary-session:v1";

const STORAGE_VERSION = 2 as const;

const CareerMapSessionContext =
  createContext<CareerMapSessionValue | undefined>(
    undefined,
  );

interface CareerMapSessionProviderProps {
  children: ReactNode;
}

function createEmptyStoredSession(): StoredCareerMapSession {
  return {
    version: STORAGE_VERSION,
    analysis: null,
    analyzedRole: null,
    resumeMetadata: null,
    roadmap: null,
    roadmapInput: null,
    roadmapSource: null,
  };
}

function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function isRoadmapSource(
  value: unknown,
): value is RoadmapSource {
  return (
    value === null ||
    value === "analyzer" ||
    value === "cv" ||
    value === "manual"
  );
}

function isResumeMetadata(
  value: unknown,
): value is ResumeMetadata {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    typeof value.type === "string" &&
    typeof value.size === "number" &&
    Number.isFinite(value.size) &&
    value.size >= 0
  );
}

/*
 * Lightweight but meaningful v2 roadmap guard.
 *
 * The backend remains the source of truth for the complete
 * GeneratedRoadmap schema. This guard exists only so stale,
 * partially migrated, or obviously incompatible sessionStorage
 * data cannot reach the v2 results UI.
 */
function isGeneratedRoadmap(
  value: unknown,
): value is GeneratedRoadmap {
  if (!isPlainObject(value)) {
    return false;
  }

  if (
    typeof value.target_role !== "string" ||
    typeof value.profile_summary !== "string"
  ) {
    return false;
  }

  if (
    !isPlainObject(value.career_snapshot) ||
    !isPlainObject(value.roadmap_strategy) ||
    !isPlainObject(value.next_action)
  ) {
    return false;
  }

  if (
    !Array.isArray(value.starting_strengths) ||
    !Array.isArray(value.priority_gaps) ||
    !Array.isArray(value.skill_map) ||
    !Array.isArray(value.phases) ||
    !Array.isArray(value.weekly_routine) ||
    !Array.isArray(value.portfolio_outcomes) ||
    !Array.isArray(value.career_readiness) ||
    !Array.isArray(value.final_readiness_checklist) ||
    !Array.isArray(value.grounding_notes)
  ) {
    return false;
  }

  return true;
}

function isRoadmapSessionInput(
  value: unknown,
): value is RoadmapSessionInput {
  if (!isPlainObject(value)) {
    return false;
  }

  if (
    value.source !== "manual" &&
    value.source !== "cv"
  ) {
    return false;
  }

  if (typeof value.targetJobRole !== "string") {
    return false;
  }

  if (
    value.profile !== undefined &&
    !isPlainObject(value.profile)
  ) {
    return false;
  }

  if (
    value.extractedResume !== undefined &&
    !isPlainObject(value.extractedResume)
  ) {
    return false;
  }

  if (
    value.resumeMetadata !== undefined &&
    !isResumeMetadata(value.resumeMetadata)
  ) {
    return false;
  }

  if (
    value.analyzerContext !== undefined &&
    value.analyzerContext !== null &&
    !isPlainObject(value.analyzerContext)
  ) {
    return false;
  }

  if (
    value.generatedRoadmap !== undefined &&
    !isGeneratedRoadmap(value.generatedRoadmap)
  ) {
    return false;
  }

  if (
    value.generatedAt !== undefined &&
    typeof value.generatedAt !== "string"
  ) {
    return false;
  }

  return true;
}

function removeLegacySession(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      LEGACY_STORAGE_KEY,
    );
  } catch {
    /*
     * Ignore cleanup failures. The new v2 session
     * remains usable.
     */
  }
}

function readStoredSession(): StoredCareerMapSession {
  if (typeof window === "undefined") {
    return createEmptyStoredSession();
  }

  try {
    /*
     * v2 is intentionally incompatible with v1.
     * Remove the legacy key when this provider starts.
     */
    removeLegacySession();

    const raw = window.sessionStorage.getItem(
      STORAGE_KEY,
    );

    if (!raw) {
      return createEmptyStoredSession();
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isPlainObject(parsed)) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return createEmptyStoredSession();
    }

    if (parsed.version !== STORAGE_VERSION) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return createEmptyStoredSession();
    }

    const analysis =
      parsed.analysis ?? null;

    const analyzedRole =
      parsed.analyzedRole ?? null;

    const resumeMetadata =
      parsed.resumeMetadata ?? null;

    const roadmap =
      parsed.roadmap ?? null;

    const roadmapInput =
      parsed.roadmapInput ?? null;

    const roadmapSource =
      parsed.roadmapSource ?? null;

    /*
     * Invalid stored roadmap data is discarded instead of
     * being rendered by the v2 Results screen.
     */
    const validatedRoadmap =
      roadmap === null
        ? null
        : isGeneratedRoadmap(roadmap)
          ? roadmap
          : null;

    const validatedRoadmapInput =
      roadmapInput === null
        ? null
        : isRoadmapSessionInput(roadmapInput)
          ? roadmapInput
          : null;

    return {
      version: STORAGE_VERSION,

      analysis:
        analysis === null
          ? null
          : (analysis as CareerAnalysis),

      analyzedRole:
        analyzedRole === null ||
        typeof analyzedRole === "string"
          ? analyzedRole
          : null,

      resumeMetadata:
        resumeMetadata === null
          ? null
          : isResumeMetadata(resumeMetadata)
            ? resumeMetadata
            : null,

      roadmap: validatedRoadmap,

      roadmapInput: validatedRoadmapInput,

      roadmapSource:
        isRoadmapSource(roadmapSource)
          ? roadmapSource
          : null,
    };
  } catch {
    try {
      window.sessionStorage.removeItem(
        STORAGE_KEY,
      );
    } catch {
      // Ignore storage cleanup failures.
    }

    return createEmptyStoredSession();
  }
}

function writeStoredSession(
  session: StoredCareerMapSession,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(session),
    );
  } catch {
    /*
     * sessionStorage may be unavailable, blocked,
     * or full. The live React session remains usable.
     */
  }
}

function removeStoredSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      STORAGE_KEY,
    );
  } catch {
    /*
     * Ignore storage cleanup failures.
     * The in-memory session is still cleared.
     */
  }
}

export function CareerMapSessionProvider({
  children,
}: CareerMapSessionProviderProps) {
  const [analysis, setAnalysis] =
    useState<CareerAnalysis | null>(null);

  const [analyzedRole, setAnalyzedRole] =
    useState<string | null>(null);

  const [resumeMetadata, setResumeMetadata] =
    useState<ResumeMetadata | null>(null);

  const [roadmap, setRoadmap] =
    useState<GeneratedRoadmap | null>(null);

  const [roadmapInput, setRoadmapInput] =
    useState<RoadmapSessionInput | null>(null);

  const [roadmapSource, setRoadmapSource] =
    useState<RoadmapSource>(null);

  const [isHydrated, setIsHydrated] =
    useState(false);

  /*
   * Restore the temporary session once on the client.
   *
   * We never restore the original File object.
   * Only JSON-safe structured state is restored.
   */
  useEffect(() => {
    const stored = readStoredSession();

    setAnalysis(stored.analysis);

    setAnalyzedRole(
      stored.analyzedRole,
    );

    setResumeMetadata(
      stored.resumeMetadata,
    );

    setRoadmap(stored.roadmap);

    setRoadmapInput(
      stored.roadmapInput,
    );

    setRoadmapSource(
      stored.roadmapSource,
    );

    setIsHydrated(true);
  }, []);

  /*
   * Persist the complete temporary session whenever
   * it changes after hydration.
   *
   * v2 storage is intentionally separate from the
   * previous v1 session so stale roadmap structures
   * cannot be restored into the new UI.
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writeStoredSession({
      version: STORAGE_VERSION,
      analysis,
      analyzedRole,
      resumeMetadata,
      roadmap,
      roadmapInput,
      roadmapSource,
    });
  }, [
    isHydrated,
    analysis,
    analyzedRole,
    resumeMetadata,
    roadmap,
    roadmapInput,
    roadmapSource,
  ]);

  const clearAnalysis = () => {
    setAnalysis(null);
    setAnalyzedRole(null);
    setResumeMetadata(null);
  };

  const clearRoadmap = () => {
    setRoadmap(null);
    setRoadmapInput(null);
    setRoadmapSource(null);
  };

  const clearSession = () => {
    setAnalysis(null);
    setAnalyzedRole(null);
    setResumeMetadata(null);
    setRoadmap(null);
    setRoadmapInput(null);
    setRoadmapSource(null);

    removeStoredSession();
    removeLegacySession();
  };

  const value = useMemo<CareerMapSessionValue>(
    () => ({
      analysis,
      analyzedRole,
      resumeMetadata,

      roadmap,
      roadmapInput,
      roadmapSource,

      setAnalysis,
      setAnalyzedRole,
      setResumeMetadata,

      setRoadmap,
      setRoadmapInput,
      setRoadmapSource,

      clearAnalysis,
      clearRoadmap,
      clearSession,
    }),
    [
      analysis,
      analyzedRole,
      resumeMetadata,
      roadmap,
      roadmapInput,
      roadmapSource,
    ],
  );

  return (
    <CareerMapSessionContext.Provider
      value={value}
    >
      {children}
    </CareerMapSessionContext.Provider>
  );
}

export function useCareerMapSession(): CareerMapSessionValue {
  const context = useContext(
    CareerMapSessionContext,
  );

  if (!context) {
    throw new Error(
      "useCareerMapSession must be used inside CareerMapSessionProvider.",
    );
  }

  return context;
}
