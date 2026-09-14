import { useState } from "react";

import { useCareerMapSession } from "@/context/CareerMapSessionContext";
import { generateRoadmap as requestRoadmap } from "@/features/roadmap/services/roadmapService";
import type { GenerateRoadmapRequest } from "@/features/roadmap/types/roadmapApi";

export function useRoadmapGeneration() {
  const { analysis, setRoadmapInput } = useCareerMapSession();
  const [generationState, setGenerationState] = useState<"idle" | "loading" | "success">("idle");
  const [generationError, setGenerationError] = useState<string | null>(null);

  const generateRoadmap = async (
    payload: Omit<GenerateRoadmapRequest, "analyzerContext">,
  ) => {
    const targetJobRole = payload.targetJobRole.trim();
    if (!targetJobRole) return;

    setGenerationState("loading");
    setGenerationError(null);

    try {
      const result = await requestRoadmap({
        ...payload,
        targetJobRole,
        analyzerContext: analysis
          ? {
              role: analysis.role,
              matchScore: analysis.matchScore,
              skillsMatchScore: analysis.skillsMatchScore,
              keywordMatchScore: analysis.keywordMatchScore,
              experienceMatchScore: analysis.experienceMatchScore,
              educationMatchScore: analysis.educationMatchScore,
              semanticSimilarityScore: analysis.semanticSimilarityScore,
              atsScore: analysis.atsScore,
              skills: analysis.skills,
              missingSkills: analysis.missingSkills,
              strengths: analysis.strengths,
              improvements: analysis.improvements,
            }
          : null,
      });

      setRoadmapInput({
        ...payload,
        targetJobRole,
        generatedRoadmap: result.roadmap,
        generatedAt: new Date().toISOString(),
      });
      setGenerationState("success");
    } catch (error) {
      setGenerationState("idle");
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Personalized roadmap generation failed. Please try again.",
      );
    }
  };

  return {
    generationState,
    generationError,
    generateRoadmap,
  };
}

export default useRoadmapGeneration;
