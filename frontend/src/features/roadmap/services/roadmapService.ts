import type {
  GenerateRoadmapRequest,
  GenerateRoadmapResponse,
} from "../types/roadmapApi";

export async function generateRoadmap(
  payload: GenerateRoadmapRequest,
): Promise<GenerateRoadmapResponse> {
  const response = await fetch("/api/roadmap/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const message =
      result &&
      typeof result === "object" &&
      "detail" in result
        ? String(
            (result as { detail?: unknown }).detail ??
              "We could not generate your roadmap. Please try again.",
          )
        : "We could not generate your roadmap. Please try again.";

    throw new Error(message);
  }

  if (!isGenerateRoadmapResponse(result)) {
    throw new Error(
      "The roadmap service returned an incomplete result.",
    );
  }

  return result;
}

function isGenerateRoadmapResponse(
  value: unknown,
): value is GenerateRoadmapResponse {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const candidate = value as {
    roadmap?: unknown;
  };

  return (
    Boolean(candidate.roadmap) &&
    typeof candidate.roadmap === "object" &&
    !Array.isArray(candidate.roadmap)
  );
}