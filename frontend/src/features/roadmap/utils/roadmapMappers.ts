import type { GeneratedRoadmap } from "../types/roadmap";

export function mapGeneratedRoadmap(
  value: unknown,
): GeneratedRoadmap | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as GeneratedRoadmap;
}