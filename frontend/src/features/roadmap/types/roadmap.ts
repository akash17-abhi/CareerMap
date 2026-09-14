export type Level =
  | "beginner"
  | "intermediate"
  | "advanced";

export type CareerGoal =
  | "first-job"
  | "placement"
  | "internship"
  | "career-switch"
  | "upskill"
  | "industry-ready";

export type ProjectStatus =
  | "idea"
  | "in-progress"
  | "completed";

export interface RoadmapProject {
  id: string;
  name: string;
  technologies: string[];
  contribution: string;
  status: ProjectStatus;
}

export interface RoadmapSkill {
  name: string;
  level: "beginner" | "intermediate" | "strong";
}

export interface RoadmapProfile {
  preferredRole: string;
  currentLevel: Level | "";
  careerGoal: CareerGoal | "";
  education: {
    level: string;
    field: string;
  };
  experience: {
    level: string;
    types: string[];
    details: string;
  };
  skills: RoadmapSkill[];
  projects: RoadmapProject[];
  learningTimePerWeek: string;
  targetTimeline: string;
  learningPreferences: string[];
}

export interface GeneratedRoadmapMilestone {
  title: string;
  outcome: string;
  tasks: string[];
}

export interface GeneratedRoadmapPhase {
  phase: number;
  title: string;
  purpose: string;
  duration: string;
  focus_skills: string[];
  milestones: GeneratedRoadmapMilestone[];
  project: string;
  completion_signal: string;
}

export interface GeneratedRoadmap {
  target_role: string;
  profile_summary: string;
  starting_strengths: string[];
  priority_gaps: string[];
  phases: GeneratedRoadmapPhase[];
  weekly_routine: string[];
  portfolio_outcomes: string[];
  final_readiness_checklist: string[];
  grounding_notes: string[];
}