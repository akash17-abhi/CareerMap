import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CareerAnalysis } from "@/features/analyzer/types/careerAnalysis";

type RoadmapSource =
  | "analyzer"
  | "cv"
  | "manual"
  | null;

type ResumeMetadata = {
  name: string;
  type: string;
  size: number;
};

interface StoredCareerMapSession {
  version: 1;
  analysis: CareerAnalysis | null;
  analyzedRole: string | null;
  resumeMetadata: ResumeMetadata | null;
  roadmap: unknown | null;
  roadmapInput: unknown | null;
  roadmapSource: RoadmapSource;
}

export interface CareerMapSessionValue {
  analysis: CareerAnalysis | null;
  analyzedRole: string | null;
  resumeMetadata: ResumeMetadata | null;

  roadmap: unknown | null;
  roadmapInput: unknown | null;
  roadmapSource: RoadmapSource;

  setAnalysis: (analysis: CareerAnalysis | null) => void;
  setAnalyzedRole: (role: string | null) => void;
  setResumeMetadata: (
    metadata: ResumeMetadata | null,
  ) => void;

  setRoadmap: (roadmap: unknown | null) => void;
  setRoadmapInput: (input: unknown | null) => void;
  setRoadmapSource: (source: RoadmapSource) => void;

  clearAnalysis: () => void;
  clearRoadmap: () => void;
  clearSession: () => void;
}

const STORAGE_KEY =
  "careermap:temporary-session:v1";

const CareerMapSessionContext =
  createContext<CareerMapSessionValue | undefined>(
    undefined,
  );

interface CareerMapSessionProviderProps {
  children: ReactNode;
}

function createEmptyStoredSession(): StoredCareerMapSession {
  return {
    version: 1,
    analysis: null,
    analyzedRole: null,
    resumeMetadata: null,
    roadmap: null,
    roadmapInput: null,
    roadmapSource: null,
  };
}

function readStoredSession(): StoredCareerMapSession {
  if (typeof window === "undefined") {
    return createEmptyStoredSession();
  }

  try {
    const raw = window.sessionStorage.getItem(
      STORAGE_KEY,
    );

    if (!raw) {
      return createEmptyStoredSession();
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return createEmptyStoredSession();
    }

    const stored =
      parsed as Partial<StoredCareerMapSession>;

    if (stored.version !== 1) {
      return createEmptyStoredSession();
    }

    return {
      version: 1,
      analysis:
        stored.analysis ?? null,
      analyzedRole:
        stored.analyzedRole ?? null,
      resumeMetadata:
        stored.resumeMetadata ?? null,
      roadmap:
        stored.roadmap ?? null,
      roadmapInput:
        stored.roadmapInput ?? null,
      roadmapSource:
        stored.roadmapSource ?? null,
    };
  } catch {
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
     * sessionStorage may be unavailable, blocked, or full.
     * The live React session remains usable even when persistence fails.
     */
  }
}

function removeStoredSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /*
     * Ignore storage cleanup failures. The in-memory session is still cleared.
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
    useState<unknown | null>(null);

  const [roadmapInput, setRoadmapInput] =
    useState<unknown | null>(null);

  const [roadmapSource, setRoadmapSource] =
    useState<RoadmapSource>(null);

  const [isHydrated, setIsHydrated] =
    useState(false);

  /*
   * Restore the temporary session once on the client.
   *
   * Important:
   * We never attempt to restore the original File object.
   * Only structured metadata and JSON-safe application state are persisted.
   */
  useEffect(() => {
    const stored = readStoredSession();

    setAnalysis(stored.analysis);
    setAnalyzedRole(stored.analyzedRole);
    setResumeMetadata(stored.resumeMetadata);
    setRoadmap(stored.roadmap);
    setRoadmapInput(stored.roadmapInput);
    setRoadmapSource(stored.roadmapSource);

    setIsHydrated(true);
  }, []);

  /*
   * Persist the complete temporary session whenever it changes.
   *
   * The hydration guard prevents the initial empty React state from
   * overwriting an existing session before it has been restored.
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writeStoredSession({
      version: 1,
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
    <CareerMapSessionContext.Provider value={value}>
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
