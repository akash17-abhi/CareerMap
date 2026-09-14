import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Code2,
  GraduationCap,
  Hammer,
  Lightbulb,
  Sparkles,
  Video,
  Wrench,
} from "lucide-react";

import type {
  CareerGoal,
  Level,
  RoadmapProfile,
} from "../types/roadmap";

export const TOTAL_PROFILE_STEPS = 10;

export const ROLE_SUGGESTIONS = [
  "Data Analyst",
  "Data Scientist",
  "ML Engineer",
  "AI Engineer",
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Business Analyst",
];

export const LEVEL_OPTIONS: Array<{
  value: Level;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    value: "beginner",
    title: "Beginner",
    description: "I’m still building the fundamentals.",
    icon: Lightbulb,
  },
  {
    value: "intermediate",
    title: "Intermediate",
    description: "I can handle common tasks independently.",
    icon: Wrench,
  },
  {
    value: "advanced",
    title: "Advanced",
    description: "I’m comfortable with complex work.",
    icon: Sparkles,
  },
];

export const GOAL_OPTIONS: Array<{
  value: CareerGoal;
  title: string;
  description: string;
}> = [
  {
    value: "first-job",
    title: "First job",
    description: "Become job-ready from scratch.",
  },
  {
    value: "placement",
    title: "Placement",
    description: "Prepare for college placements.",
  },
  {
    value: "internship",
    title: "Internship",
    description: "Become internship-ready.",
  },
  {
    value: "career-switch",
    title: "Career switch",
    description: "Move into a new career direction.",
  },
  {
    value: "upskill",
    title: "Upskill",
    description: "Grow stronger in your current field.",
  },
  {
    value: "industry-ready",
    title: "Industry-ready",
    description: "Bridge learning with real work.",
  },
];

export const EDUCATION_LEVELS = [
  "Diploma",
  "Bachelor’s",
  "Master’s",
  "PhD",
  "Bootcamp / Certification",
  "Other",
];

export const EDUCATION_FIELDS = [
  "Computer Science",
  "Information Technology",
  "Artificial Intelligence",
  "Data Science",
  "Electronics",
  "Business / Management",
  "Other",
];

export const EXPERIENCE_OPTIONS = [
  "No experience",
  "Student / Fresher",
  "Internship experience",
  "< 1 year",
  "1–2 years",
  "2–5 years",
  "5+ years",
];

export const EXPERIENCE_TYPES = [
  "Internship",
  "Part-time",
  "Freelance",
  "Academic",
  "Full-time",
  "Volunteer",
];

export const SKILL_SUGGESTIONS = [
  "Python",
  "SQL",
  "Excel",
  "Power BI",
  "Java",
  "JavaScript",
  "React",
  "Node.js",
  "C++",
  "Machine Learning",
  "Deep Learning",
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "TensorFlow",
  "Git",
];

export const LEARNING_TIME_OPTIONS = [
  "< 3 hrs/week",
  "3–5 hrs/week",
  "5–10 hrs/week",
  "10–15 hrs/week",
  "15+ hrs/week",
];

export const TIMELINE_OPTIONS = [
  "1–2 months",
  "3 months",
  "3–6 months",
  "6–12 months",
  "12+ months",
  "No fixed deadline",
];

export const LEARNING_STYLE_OPTIONS: Array<{
  value: string;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "videos", label: "Videos", icon: Video },
  { value: "docs", label: "Docs & articles", icon: BookOpen },
  { value: "guided-courses", label: "Guided courses", icon: GraduationCap },
  { value: "projects", label: "Projects", icon: Hammer },
  { value: "practice", label: "Practice", icon: Code2 },
  { value: "build-apps", label: "Build apps", icon: Wrench },
];

export const EMPTY_PROFILE: RoadmapProfile = {
  preferredRole: "",
  currentLevel: "",
  careerGoal: "",
  education: {
    level: "",
    field: "",
  },
  experience: {
    level: "",
    types: [],
    details: "",
  },
  skills: [],
  projects: [],
  learningTimePerWeek: "",
  targetTimeline: "",
  learningPreferences: [],
};