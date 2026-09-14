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

  const result =
    (await response.json().catch(() => null)) as
      | GenerateRoadmapResponse
      | null;

  if (!response.ok) {
    const message =
      result &&
      typeof result === "object" &&
      "detail" in result
        ? String(result.detail)
        : "We could not generate your roadmap. Please try again.";

    throw new Error(message);
  }

  if (
    !result ||
    typeof result !== "object" ||
    !result.roadmap ||
    typeof result.roadmap !== "object" ||
    Array.isArray(result.roadmap)
  ) {
    throw new Error(
      "The roadmap service returned an incomplete result.",
    );
  }

  return result;
}