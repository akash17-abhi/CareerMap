import type { RoadmapProfile } from "../types/roadmap";

export function isProfileStepValid(
  profile: RoadmapProfile,
  step: number,
): boolean {
  switch (step) {
    case 1:
      return Boolean(profile.preferredRole.trim());

    case 2:
      return Boolean(profile.currentLevel);

    case 3:
      return Boolean(profile.careerGoal);

    case 4:
      return Boolean(
        profile.education.level &&
          profile.education.field,
      );

    case 5:
      return Boolean(profile.experience.level);

    case 6:
      return profile.skills.length > 0;

    case 7:
      return true;

    case 8:
      return Boolean(profile.learningTimePerWeek);

    case 9:
      return Boolean(profile.targetTimeline);

    case 10:
      return profile.learningPreferences.length > 0;

    default:
      return false;
  }
}