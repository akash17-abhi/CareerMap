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
  level:
    | "beginner"
    | "intermediate"
    | "strong";
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

/* ─────────────────────────────────────────────
   ROADMAP V2 — STUDY MATERIALS
───────────────────────────────────────────── */

export type StudyResourceType =
  | "video"
  | "documentation"
  | "course"
  | "book"
  | "tutorial"
  | "practice";

export interface StudyResource {
  title: string;
  type: StudyResourceType;
  provider: string;
  description: string;
  url?: string;
  estimated_minutes?: number;
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — PHASE LEARNING
───────────────────────────────────────────── */

export interface PhaseLearn {
  objective: string;
  topics: string[];
  study_materials: StudyResource[];
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — PRACTICE
───────────────────────────────────────────── */

export interface PhasePractice {
  objective: string;
  activities: string[];
  success_criteria: string[];
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — BUILD
───────────────────────────────────────────── */

export interface PhaseBuild {
  objective: string;
  project: string;
  requirements: string[];
  deliverables: string[];
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — PROVE
───────────────────────────────────────────── */

export interface PhaseProve {
  objective: string;
  evidence: string[];
  portfolio_signal: string;
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — MILESTONE
───────────────────────────────────────────── */

export interface GeneratedRoadmapMilestone {
  title: string;
  outcome: string;
  tasks: string[];
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — PHASE
───────────────────────────────────────────── */

export interface GeneratedRoadmapPhase {
  phase: number;
  title: string;
  purpose: string;
  duration: string;
  focus_skills: string[];
  learn: PhaseLearn;
  practice: PhasePractice;
  build: PhaseBuild;
  prove: PhaseProve;
  milestones: GeneratedRoadmapMilestone[];
  completion_signal: string;
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — CAREER SNAPSHOT
───────────────────────────────────────────── */

export interface CareerSnapshot {
  current_level: string;
  target_role: string;
  career_goal: string;
  education: string;
  experience: string;
  learning_time_per_week: string;
  target_timeline: string;
  learning_preferences: string[];
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — SKILL MAP
───────────────────────────────────────────── */

export type SkillMapStatus =
  | "strength"
  | "developing"
  | "priority-gap"
  | "target";

export interface SkillMapItem {
  skill: string;
  current_level: string;
  target_level: string;
  status: SkillMapStatus;
  reason: string;
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — STRATEGY
───────────────────────────────────────────── */

export interface RoadmapStrategy {
  summary: string;
  why_this_roadmap: string;
  approach: string[];
  priorities: string[];
  constraints: string[];
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — WEEKLY ROUTINE
───────────────────────────────────────────── */

export interface WeeklyRoutineItem {
  day: string;
  focus: string;
  activities: string[];
  estimated_minutes: number;
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — PORTFOLIO OUTCOME
───────────────────────────────────────────── */

export interface PortfolioOutcome {
  title: string;
  description: string;
  skills_demonstrated: string[];
  evidence: string[];
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — CAREER READINESS
───────────────────────────────────────────── */

export type CareerReadinessStatus =
  | "ready"
  | "developing"
  | "not-started";

export interface CareerReadinessItem {
  area: string;
  status: CareerReadinessStatus;
  current_state: string;
  action: string;
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — NEXT ACTION
───────────────────────────────────────────── */

export interface NextAction {
  title: string;
  description: string;
  reason: string;
  estimated_minutes?: number;
}

/* ─────────────────────────────────────────────
   ROADMAP V2 — COMPLETE RESPONSE
───────────────────────────────────────────── */

export interface GeneratedRoadmap {
  target_role: string;
  profile_summary: string;
  career_snapshot: CareerSnapshot;
  starting_strengths: string[];
  priority_gaps: string[];
  skill_map: SkillMapItem[];
  roadmap_strategy: RoadmapStrategy;
  phases: GeneratedRoadmapPhase[];
  weekly_routine: WeeklyRoutineItem[];
  portfolio_outcomes: PortfolioOutcome[];
  career_readiness: CareerReadinessItem[];
  final_readiness_checklist: string[];
  next_action: NextAction;
  grounding_notes: string[];
}
