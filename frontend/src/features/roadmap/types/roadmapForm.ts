import type {
  RoadmapProfile,
  RoadmapProject,
  RoadmapSkill,
} from "./roadmap";

export type SetupMode =
  | "entry"
  | "cv-upload"
  | "cv-role"
  | "manual-profile"
  | "manual-review";

export interface ProjectDraft extends RoadmapProject {}

export interface RoadmapProfileUpdate {
  key: keyof RoadmapProfile;
  value: RoadmapProfile[keyof RoadmapProfile];
}

export interface ProfileStepProps {
  profile: RoadmapProfile;
  updateProfile: <K extends keyof RoadmapProfile>(
    key: K,
    value: RoadmapProfile[K],
  ) => void;
}

export interface SkillStepProps extends ProfileStepProps {
  customSkill: string;
  setCustomSkill: (value: string) => void;
  toggleSkill: (name: string) => void;
  addCustomSkill: () => void;
  updateSkillLevel: (
    skillName: string,
    level: RoadmapSkill["level"],
  ) => void;
}

export interface ProjectStepProps extends ProfileStepProps {
  projectDraft: RoadmapProject;
  setProjectDraft: (project: RoadmapProject) => void;
  addProject: () => void;
  removeProject: (id: string) => void;
}