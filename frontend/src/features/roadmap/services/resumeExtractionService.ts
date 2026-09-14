import type { ResumeExtractionResponse } from "../types/roadmapApi";

export async function extractResumeProfile(
  file: File,
): Promise<Record<string, unknown>> {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch("/api/roadmap/resume/extract", {
    method: "POST",
    body: formData,
  });

  const payload =
    (await response.json().catch(() => null)) as
      | ResumeExtractionResponse
      | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "detail" in payload
        ? String(payload.detail)
        : "We could not extract your resume. Please try again.";

    throw new Error(message);
  }

  const extracted =
    payload &&
    typeof payload === "object"
      ? (("profile" in payload && payload.profile) ||
          ("resumeProfile" in payload && payload.resumeProfile) ||
          ("data" in payload && payload.data) ||
          payload)
      : null;

  if (
    !extracted ||
    typeof extracted !== "object" ||
    Array.isArray(extracted)
  ) {
    throw new Error(
      "The resume was uploaded, but no structured profile was returned.",
    );
  }

  return extracted as Record<string, unknown>;
}