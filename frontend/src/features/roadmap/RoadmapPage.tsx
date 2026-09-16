import { useEffect, useMemo, useRef, useState, type Dispatch, type MutableRefObject, type ReactNode, type SetStateAction } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  FileText,
  Flag,
  GraduationCap,
  Hammer,
  Heart,
    Lightbulb,
  Map,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  UserRound,
  Video,
  BookOpen,
  Wrench,
  X,
} from "lucide-react";

import { useCareerMapSession } from "@/context/CareerMapSessionContext";
import EntryCard from "@/features/roadmap/components/setup/EntryCard";
import ChoiceButton from "@/features/roadmap/components/setup/ChoiceButton";
import type {
  GeneratedRoadmap,
  GeneratedRoadmapPhase,
} from "@/features/roadmap/types/roadmap";

type SetupMode =
  | "entry"
  | "cv-upload"
  | "cv-role"
  | "manual-profile"
  | "manual-review";

type Level = "beginner" | "intermediate" | "advanced";
type CareerGoal =
  | "first-job"
  | "placement"
  | "internship"
  | "career-switch"
  | "upskill"
  | "industry-ready";

type ProjectStatus = "idea" | "in-progress" | "completed";

interface RoadmapProject {
  id: string;
  name: string;
  technologies: string[];
  contribution: string;
  status: ProjectStatus;
}

interface RoadmapSkill {
  name: string;
  level: "beginner" | "intermediate" | "strong";
}

interface RoadmapProfile {
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

const TOTAL_PROFILE_STEPS = 10;

const ROLE_SUGGESTIONS = [
  "Data Analyst",
  "Data Scientist",
  "ML Engineer",
  "AI Engineer",
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Business Analyst",
];

const LEVEL_OPTIONS: Array<{
  value: Level;
  title: string;
  description: string;
  icon: typeof Sparkles;
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

const GOAL_OPTIONS: Array<{
  value: CareerGoal;
  title: string;
  description: string;
}> = [
  { value: "first-job", title: "First job", description: "Become job-ready from scratch." },
  { value: "placement", title: "Placement", description: "Prepare for college placements." },
  { value: "internship", title: "Internship", description: "Become internship-ready." },
  { value: "career-switch", title: "Career switch", description: "Move into a new career direction." },
  { value: "upskill", title: "Upskill", description: "Grow stronger in your current field." },
  { value: "industry-ready", title: "Industry-ready", description: "Bridge learning with real work." },
];

const EDUCATION_LEVELS = [
  "Diploma",
  "Bachelor’s",
  "Master’s",
  "PhD",
  "Bootcamp / Certification",
  "Other",
];

const EDUCATION_FIELDS = [
  "Computer Science",
  "Information Technology",
  "Artificial Intelligence",
  "Data Science",
  "Electronics",
  "Business / Management",
  "Other",
];

const EXPERIENCE_OPTIONS = [
  "No experience",
  "Student / Fresher",
  "Internship experience",
  "< 1 year",
  "1–2 years",
  "2–5 years",
  "5+ years",
];

const EXPERIENCE_TYPES = [
  "Internship",
  "Part-time",
  "Freelance",
  "Academic",
  "Full-time",
  "Volunteer",
];

const SKILL_SUGGESTIONS = [
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

const LEARNING_TIME_OPTIONS = [
  "< 3 hrs/week",
  "3–5 hrs/week",
  "5–10 hrs/week",
  "10–15 hrs/week",
  "15+ hrs/week",
];

const TIMELINE_OPTIONS = [
  "1–2 months",
  "3 months",
  "3–6 months",
  "6–12 months",
  "12+ months",
  "No fixed deadline",
];

const LEARNING_STYLE_OPTIONS = [
  { value: "videos", label: "Videos", icon: Video },
  { value: "docs", label: "Docs & articles", icon: BookOpen },
  { value: "guided-courses", label: "Guided courses", icon: GraduationCap },
  { value: "projects", label: "Projects", icon: Hammer },
  { value: "practice", label: "Practice", icon: Code2 },
  { value: "build-apps", label: "Build apps", icon: Wrench },
];

const EMPTY_PROFILE: RoadmapProfile = {
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


function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const newProject = (): RoadmapProject => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  technologies: [],
  contribution: "",
  status: "completed",
});

function RoadmapPage() {
  const {
    analysis,
    roadmapInput,
    setRoadmapInput,
  } = useCareerMapSession();
  const location = useLocation();

  const [setupMode, setSetupMode] = useState<SetupMode>("entry");

  const [profileStep, setProfileStep] = useState(1);

  const [profile, setProfile] = useState<RoadmapProfile>(EMPTY_PROFILE);
  const [generationState, setGenerationState] = useState<"idle" | "loading" | "success">("idle");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationReady, setGenerationReady] = useState(false);
  const [pendingRoadmapResult, setPendingRoadmapResult] = useState<{
    payload: {
      source: "manual" | "cv";
      targetJobRole: string;
      profile?: RoadmapProfile;
      extractedResume?: Record<string, unknown>;
      resumeMetadata?: { name: string; type: string; size: number };
    };
    roadmap: GeneratedRoadmap;
    generatedAt: string;
  } | null>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeExtracting, setResumeExtracting] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [extractedResume, setExtractedResume] = useState<Record<string, unknown> | null>(null);

  const [customSkill, setCustomSkill] = useState("");
  const [customEducationField, setCustomEducationField] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [projectDraft, setProjectDraft] =
    useState<RoadmapProject>(newProject());

  const generatedRoadmap = useMemo<GeneratedRoadmap | null>(() => {
    if (!isRecord(roadmapInput)) return null;
    const value = roadmapInput.generatedRoadmap;
    return isRecord(value) ? (value as unknown as GeneratedRoadmap) : null;
  }, [roadmapInput]);

  const cameFromAnalyzer =
    location.state &&
    typeof location.state === "object" &&
    "from" in location.state &&
    location.state.from === "analyzer";

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateProfile = <K extends keyof RoadmapProfile>(
    key: K,
    value: RoadmapProfile[K],
  ) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetProfileFlow = () => {
    setProfile(EMPTY_PROFILE);
    setResumeFile(null);
    setResumeExtracting(false);
    setResumeError(null);
    setExtractedResume(null);
    setCustomSkill("");
    setCustomEducationField("");
    setCustomRole("");
    setProjectDraft(newProject());
    setProfileStep(1);
    setGenerationState("idle");
    setGenerationError(null);
    setGenerationReady(false);
    setPendingRoadmapResult(null);
  };

  const startManualProfile = () => {
    resetProfileFlow();
    setSetupMode("manual-profile");
  };

  const startCvUpload = () => {
    resetProfileFlow();
    setSetupMode("cv-upload");
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleResumeFile = async (file: File | null) => {
    if (!file) return;

    setResumeError(null);

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    const fileName = file.name.toLowerCase();
    const validExtension =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc");

    if (
      !allowedTypes.includes(file.type) &&
      !validExtension
    ) {
      setResumeError(
        "Please upload a PDF, DOCX, or DOC resume.",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResumeError(
        "Your resume should be 10 MB or smaller.",
      );
      return;
    }

    setResumeFile(file);
    setResumeExtracting(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(
        "/api/roadmap/resume/extract",
        {
          method: "POST",
          body: formData,
        },
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "detail" in payload
            ? String(payload.detail)
            : "We could not extract your resume. Please try again.";

        throw new Error(message);
      }

      const extracted =
        payload && typeof payload === "object"
          ? (("profile" in payload && payload.profile) ||
              ("resumeProfile" in payload && payload.resumeProfile) ||
              ("data" in payload && payload.data) ||
              payload)
          : null;

      if (!extracted || typeof extracted !== "object") {
        throw new Error(
          "The resume was uploaded, but no structured profile was returned.",
        );
      }

      setExtractedResume(
        extracted as Record<string, unknown>,
      );

      setSetupMode("cv-role");
    } catch (error) {
      setResumeError(
        error instanceof Error
          ? error.message
          : "Resume extraction failed. Please try again.",
      );
      return;
    } finally {
      setResumeExtracting(false);
    }
  };

  const toggleSkill = (name: string) => {
    setProfile((current) => {
      const exists = current.skills.some(
        (skill) =>
          skill.name.toLowerCase() === name.toLowerCase(),
      );

      return {
        ...current,
        skills: exists
          ? current.skills.filter(
              (skill) =>
                skill.name.toLowerCase() !== name.toLowerCase(),
            )
          : [
              ...current.skills,
              {
                name,
                level: "intermediate",
              },
            ],
      };
    });
  };

  const addCustomSkill = () => {
    const value = customSkill.trim();

    if (!value) return;

    if (
      !profile.skills.some(
        (skill) =>
          skill.name.toLowerCase() === value.toLowerCase(),
      )
    ) {
      setProfile((current) => ({
        ...current,
        skills: [
          ...current.skills,
          {
            name: value,
            level: "intermediate",
          },
        ],
      }));
    }

    setCustomSkill("");
  };

  const updateSkillLevel = (
    skillName: string,
    level: RoadmapSkill["level"],
  ) => {
    setProfile((current) => ({
      ...current,
      skills: current.skills.map((skill) =>
        skill.name === skillName
          ? {
              ...skill,
              level,
            }
          : skill,
      ),
    }));
  };

  const toggleExperienceType = (type: string) => {
    setProfile((current) => ({
      ...current,
      experience: {
        ...current.experience,
        types: current.experience.types.includes(type)
          ? current.experience.types.filter(
              (value) => value !== type,
            )
          : [
              ...current.experience.types,
              type,
            ],
      },
    }));
  };

  const addProject = () => {
    const name = projectDraft.name.trim();

    if (!name) return;

    setProfile((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          ...projectDraft,
          name,
        },
      ],
    }));

    setProjectDraft(newProject());
  };

  const removeProject = (id: string) => {
    setProfile((current) => ({
      ...current,
      projects: current.projects.filter(
        (project) => project.id !== id,
      ),
    }));
  };

  const toggleLearningPreference = (
    value: string,
  ) => {
    setProfile((current) => ({
      ...current,
      learningPreferences:
        current.learningPreferences.includes(value)
          ? current.learningPreferences.filter(
              (item) => item !== value,
            )
          : [
              ...current.learningPreferences,
              value,
            ],
    }));
  };

  const manualStepValid = useMemo(() => {
    switch (profileStep) {
      case 1:
        return Boolean(
          profile.preferredRole.trim(),
        );
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
        return Boolean(
          profile.experience.level,
        );
      case 6:
        return profile.skills.length > 0;
      case 7:
        return true;
      case 8:
        return Boolean(
          profile.learningTimePerWeek,
        );
      case 9:
        return Boolean(
          profile.targetTimeline,
        );
      case 10:
        return (
          profile.learningPreferences.length > 0
        );
      default:
        return false;
    }
  }, [profile, profileStep]);

  const nextProfileStep = () => {
    if (!manualStepValid) return;

    if (
      profileStep === TOTAL_PROFILE_STEPS
    ) {
      setSetupMode("manual-review");
      return;
    }

    setProfileStep((current) =>
      Math.min(
        TOTAL_PROFILE_STEPS,
        current + 1,
      ),
    );
  };

  const previousProfileStep = () => {
    if (profileStep > 1) {
      setProfileStep((current) =>
        current - 1,
      );
      return;
    }

    setSetupMode("entry");
  };

  const generateRoadmap = async (payload: {
    source: "manual" | "cv";
    targetJobRole: string;
    profile?: RoadmapProfile;
    extractedResume?: Record<string, unknown>;
    resumeMetadata?: { name: string; type: string; size: number };
  }) => {
    const targetJobRole = payload.targetJobRole.trim();
    if (!targetJobRole) return;

    setGenerationState("loading");
    setGenerationError(null);

    try {
      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: payload.source,
          targetJobRole,
          profile: payload.profile ?? null,
          extractedResume: payload.extractedResume ?? null,
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
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          result && typeof result === "object" && "detail" in result
            ? String(result.detail)
            : "We could not generate your roadmap. Please try again.";
        throw new Error(message);
      }

      if (
        !result ||
        typeof result !== "object" ||
        !result.roadmap ||
        typeof result.roadmap !== "object"
      ) {
        throw new Error("The roadmap service returned an incomplete result.");
      }

      setPendingRoadmapResult({
        payload: {
          ...payload,
          targetJobRole,
        },
        roadmap: result.roadmap as GeneratedRoadmap,
        generatedAt: new Date().toISOString(),
      });
      setGenerationReady(true);
    } catch (error) {
      setGenerationState("idle");
      setGenerationReady(false);
      setPendingRoadmapResult(null);
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Personalized roadmap generation failed. Please try again.",
      );
    }
  };

  const finishRoadmapGeneration = () => {
    if (!pendingRoadmapResult) return;

    setRoadmapInput({
      ...pendingRoadmapResult.payload,
      generatedRoadmap: pendingRoadmapResult.roadmap,
      generatedAt: pendingRoadmapResult.generatedAt,
    });

    setPendingRoadmapResult(null);
    setGenerationReady(false);
    setGenerationState("success");
  };

  const generateFromManualReview = async () => {
    await generateRoadmap({
      source: "manual",
      targetJobRole: profile.preferredRole,
      profile,
    });
  };

  const generateFromResume = async () => {
    const targetJobRole = profile.preferredRole.trim();

    if (!targetJobRole || !resumeFile || !extractedResume) return;

    await generateRoadmap({
      source: "cv",
      targetJobRole,
      extractedResume,
      resumeMetadata: {
        name: resumeFile.name,
        type: resumeFile.type,
        size: resumeFile.size,
      },
    });
  };

  const selectRoleSuggestion = (
    role: string,
  ) => {
    setProfile((current) => ({
      ...current,
      preferredRole: role,
    }));
  };

  const isGenerating = generationState === "loading";

  if (isGenerating) {
    const generationRole =
      profile.preferredRole ||
      (isRecord(roadmapInput) && typeof roadmapInput.targetJobRole === "string"
        ? roadmapInput.targetJobRole
        : "your target role");

    return (
      <RoadmapGenerationScreen
        targetRole={generationRole}
        generationReady={generationReady}
        onComplete={finishRoadmapGeneration}
      />
    );
  }

  if (generatedRoadmap) {
    return (
      <RoadmapResultsScreen
        roadmap={generatedRoadmap}
        source={
          isRecord(roadmapInput) && typeof roadmapInput.source === "string"
            ? roadmapInput.source
            : null
        }
        generatedAt={
          isRecord(roadmapInput) && typeof roadmapInput.generatedAt === "string"
            ? roadmapInput.generatedAt
            : null
        }
        cameFromAnalyzer={cameFromAnalyzer}
        onStartOver={() => {
          setRoadmapInput(null);
          resetProfileFlow();
          setSetupMode("entry");
        }}
      />
    );
  }

  if (setupMode === "entry") {
    return (
      <EntryScreen
        onResume={startCvUpload}
        onManual={startManualProfile}
      />
    );
  }

  if (setupMode === "cv-upload") {
    return (
      <ResumeUploadScreen
        fileInputRef={fileInputRef}
        resumeFile={resumeFile}
        isExtracting={resumeExtracting}
        errorMessage={resumeError}
        onBack={() => setSetupMode("entry")}
        onOpenPicker={openFilePicker}
        onFileSelected={handleResumeFile}
      />
    );
  }

  if (setupMode === "cv-role") {
    return (
      <ResumeRoleScreen
        resumeFile={resumeFile}
        extractionReady={Boolean(extractedResume)}
        role={profile.preferredRole}
        customRole={customRole}
        suggestions={ROLE_SUGGESTIONS}
        onRoleChange={(value) => {
          setProfile((current) => ({
            ...current,
            preferredRole: value,
          }));
        }}
        onSuggestion={(suggestion) => {
          setCustomRole("");
          selectRoleSuggestion(suggestion);
        }}
        onCustomRoleChange={setCustomRole}
        onBack={() =>
          setSetupMode("cv-upload")
        }
        onGenerate={generateFromResume}
        isGenerating={isGenerating}
        generationError={generationError}
        generationSuccess={generationState === "success"}
      />
    );
  }

  if (
    setupMode === "manual-profile"
  ) {
    return (
      <ManualProfileScreen
        profile={profile}
        step={profileStep}
        totalSteps={TOTAL_PROFILE_STEPS}
        valid={manualStepValid}
        customSkill={customSkill}
        customEducationField={
          customEducationField
        }
        projectDraft={projectDraft}
        onBack={previousProfileStep}
        onNext={nextProfileStep}
        updateProfile={updateProfile}
        toggleSkill={toggleSkill}
        addCustomSkill={addCustomSkill}
        setCustomSkill={setCustomSkill}
        updateSkillLevel={updateSkillLevel}
        toggleExperienceType={
          toggleExperienceType
        }
        setCustomEducationField={
          setCustomEducationField
        }
        addProject={addProject}
        setProjectDraft={
          setProjectDraft
        }
        removeProject={removeProject}
        toggleLearningPreference={
          toggleLearningPreference
        }
      />
    );
  }

  if (setupMode === "manual-review") {
    return (
      <ManualReviewScreen
        profile={profile}
        onBack={() => {
          setProfileStep(
            TOTAL_PROFILE_STEPS,
          );
          setSetupMode(
            "manual-profile",
          );
        }}
        onModify={() => {
          setProfileStep(1);
          setSetupMode(
            "manual-profile",
          );
        }}
        onGenerate={
          generateFromManualReview
        }
        isGenerating={isGenerating}
        generationError={generationError}
        generationSuccess={generationState === "success"}
      />
    );
  }

  return <Navigate to="/roadmap" replace />;
}

type GenerationStep = {
  id: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
};

const ROADMAP_GENERATION_STEPS: GenerationStep[] = [
  {
    id: "profile",
    title: "Reviewing your profile",
    description: "Understanding your current level, experience, skills, and goals.",
    icon: UserRound,
  },
  {
    id: "gaps",
    title: "Mapping your skill gaps",
    description: "Connecting what you already know with what your target role requires.",
    icon: Target,
  },
  {
    id: "plan",
    title: "Designing your learning path",
    description: "Building progressive Learn → Practice → Build → Prove phases.",
    icon: Map,
  },
  {
    id: "resources",
    title: "Curating study materials",
    description: "Selecting phase-relevant videos, courses, tutorials, and documentation.",
    icon: BookOpen,
  },
  {
    id: "finalize",
    title: "Finalizing your roadmap",
    description: "Validating the roadmap structure and preparing your personalized result.",
    icon: Sparkles,
  },
];

function RoadmapGenerationScreen({
  targetRole,
  generationReady,
  onComplete,
}: {
  targetRole: string;
  generationReady: boolean;
  onComplete: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const finalStepIndex = ROADMAP_GENERATION_STEPS.length - 1;

  useEffect(() => {
    if (activeStep >= finalStepIndex) {
      if (!generationReady) return;

      const timer = window.setTimeout(() => {
        onComplete();
      }, 700);

      return () => window.clearTimeout(timer);
    }

    const delay = generationReady ? 360 : 1350;
    const timer = window.setTimeout(() => {
      setActiveStep((current) => Math.min(finalStepIndex, current + 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [activeStep, finalStepIndex, generationReady, onComplete]);

  const activeLabel = generationReady
    ? activeStep === finalStepIndex
      ? "Roadmap ready"
      : "Finishing your roadmap"
    : "Processing your request";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <BackgroundGlow />

      <div className="relative w-full max-w-3xl">
        <motion.section
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_90px_-40px_rgba(15,23,42,0.3)]"
        >
          <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-5 py-8 sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-blue-200/20 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-white shadow-sm"
              >
                <Sparkles className="h-7 w-7 text-indigo-600" strokeWidth={1.8} />
              </motion.div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                CareerMap AI
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Building your personalized roadmap
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                We’re analyzing your starting point and creating a learning path for
                <span className="font-semibold text-slate-900"> {targetRole}</span>.
              </p>

              <div
                className="mt-6 flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-2 text-[10px] font-semibold text-slate-600 backdrop-blur-sm"
                aria-live="polite"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-600" />
                </span>
                {activeLabel}
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Processing
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {Math.min(activeStep + 1, ROADMAP_GENERATION_STEPS.length)} / {ROADMAP_GENERATION_STEPS.length}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-indigo-600"
                  animate={{
                    width: `${Math.max(8, ((activeStep + 1) / ROADMAP_GENERATION_STEPS.length) * 100)}%`,
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {ROADMAP_GENERATION_STEPS.map((step, index) => {
                const complete = index < activeStep;
                const active = index === activeStep;
                const StepIcon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={[
                      "flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-colors sm:px-4 sm:py-3.5",
                      active
                        ? "border-indigo-200 bg-indigo-50/70"
                        : complete
                          ? "border-emerald-100 bg-emerald-50/60"
                          : "border-slate-100 bg-slate-50/60",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                        active
                          ? "border-indigo-200 bg-white text-indigo-600"
                          : complete
                            ? "border-emerald-200 bg-white text-emerald-600"
                            : "border-slate-200 bg-white text-slate-400",
                      ].join(" ")}
                    >
                      {complete ? (
                        <Check className="h-4 w-4" strokeWidth={2.4} />
                      ) : active ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
                          className="flex"
                        >
                          <StepIcon className="h-4 w-4" strokeWidth={1.9} />
                        </motion.span>
                      ) : (
                        <StepIcon className="h-4 w-4" strokeWidth={1.8} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{step.title}</p>
                        {active ? (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-indigo-700">
                            Working
                          </span>
                        ) : null}
                        {complete ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                            Done
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 text-center">
              <p className="text-[11px] leading-5 text-slate-500">
                These processing stages are a guided view of the generation flow.
                CareerMap only shows your roadmap when the backend returns a validated result.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function RoadmapResultsScreen({
  roadmap,
  source,
  generatedAt,
  cameFromAnalyzer,
  onStartOver,
}: {
  roadmap: GeneratedRoadmap;
  source: string | null;
  generatedAt: string | null;
  cameFromAnalyzer: boolean;
  onStartOver: () => void;
}) {
  const navigate = useNavigate();

  const totalPhases = roadmap.phases.length;
  const totalMilestones = roadmap.phases.reduce(
    (sum, phase) => sum + phase.milestones.length,
    0,
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <BackgroundGlow />

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_-30px_rgba(15,23,42,0.28)]">
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Personalized roadmap
                </div>
                <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Your path to {roadmap.target_role}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  {roadmap.profile_summary}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600">
                  {totalPhases} phases
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600">
                  {totalMilestones} milestones
                </span>
                {source ? (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600">
                    {source === "cv" ? "Resume-based" : "Profile-based"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-b border-slate-200 p-5 sm:grid-cols-2 sm:p-8">
            <InsightCard
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Starting strengths"
              items={roadmap.starting_strengths}
              tone="positive"
              emptyLabel="No specific starting strengths were provided."
            />
            <InsightCard
              icon={<Target className="h-4 w-4" />}
              title="Priority gaps"
              items={roadmap.priority_gaps}
              tone="attention"
              emptyLabel="No priority gaps were highlighted."
            />
          </div>

          <section className="px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Step-by-step plan
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                  Your career journey
                </h2>
              </div>
              <span className="hidden text-right text-xs text-slate-500 sm:block">
                Foundations → applied skills → proof → readiness
              </span>
            </div>

            <div className="mt-7 space-y-6">
              {roadmap.phases.map((phase, index) => (
                <PhaseCard
                  key={`${phase.phase}-${phase.title}`}
                  phase={phase}
                  index={index}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-4 border-t border-slate-200 bg-slate-50/50 p-5 sm:grid-cols-2 sm:p-8">
            <RoadmapListCard
              icon={<Clock3 className="h-4 w-4" />}
              title="Weekly routine"
              items={roadmap.weekly_routine.map((item) =>
                `${item.day} (${item.estimated_minutes} min): ${item.focus} — ${item.activities.join("; ")}`
              )}
            />
            <RoadmapListCard
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              title="Portfolio outcomes"
              items={roadmap.portfolio_outcomes.map((item) =>
                `${item.title}: ${item.description}`
              )}
            />
          </section>

          <section className="border-t border-slate-200 px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h2 className="text-lg font-black text-slate-950">
                Final readiness checklist
              </h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {roadmap.final_readiness_checklist.map((item, index) => (
                <div
                  key={`${index}-${item}`}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <p className="text-sm leading-5 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {roadmap.grounding_notes.length > 0 ? (
            <section className="border-t border-slate-200 bg-white px-5 py-7 sm:px-8 sm:py-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <h2 className="text-base font-black text-slate-950">
                  Grounding notes
                </h2>
              </div>
              <div className="mt-4 space-y-2">
                {roadmap.grounding_notes.map((note, index) => (
                  <p
                    key={`${index}-${note}`}
                    className="text-xs leading-5 text-slate-500"
                  >
                    {note}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Your roadmap is stored only in this temporary CareerMap session.
              </p>
              {generatedAt ? (
                <p className="mt-1 text-[10px] text-slate-500">
                  Generated {formatRoadmapDate(generatedAt)}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {cameFromAnalyzer ? (
                <button
                  type="button"
                  onClick={() => navigate("/analyzer")}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Resume & JD Analyzer
                </button>
              ) : null}
              <button
                type="button"
                onClick={onStartOver}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Build another roadmap
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  items,
  tone,
  emptyLabel,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  tone: "positive" | "attention";
  emptyLabel: string;
}) {
  const toneClasses =
    tone === "positive"
      ? "border-emerald-100 bg-emerald-50/60 text-emerald-700"
      : "border-amber-100 bg-amber-50/60 text-amber-700";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${toneClasses}`}>
          {icon}
        </span>
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
      </div>
      {items.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {items.map((item, index) => (
            <div key={`${index}-${item}`} className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <p className="text-xs leading-5 text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs leading-5 text-slate-500">{emptyLabel}</p>
      )}
    </article>
  );
}

function PhaseCard({
  phase,
  index,
}: {
  phase: GeneratedRoadmapPhase;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xs font-black text-white">
              {String(phase.phase).padStart(2, "0")}
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                Phase {phase.phase}
              </p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                {phase.title}
              </h3>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600">
            <Clock3 className="h-3.5 w-3.5" />
            {phase.duration}
          </span>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          {phase.purpose}
        </p>
        {phase.focus_skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {phase.focus_skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Milestones
          </p>
          <div className="mt-3 space-y-3">
            {phase.milestones.map((milestone, milestoneIndex) => (
              <div
                key={`${milestoneIndex}-${milestone.title}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
                    {milestoneIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900">
                      {milestone.title}
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {milestone.outcome}
                    </p>
                    {milestone.tasks.length > 0 ? (
                      <div className="mt-3 space-y-1.5">
                        {milestone.tasks.map((task, taskIndex) => (
                          <p
                            key={`${taskIndex}-${task}`}
                            className="flex items-start gap-2 text-[11px] leading-4.5 text-slate-500"
                          >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                            {task}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-center gap-2 text-indigo-700">
              <Code2 className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
                Practical project
              </p>
            </div>
            <p className="mt-2 text-sm font-semibold leading-5 text-indigo-950">
              {phase.build.project}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
                Completion signal
              </p>
            </div>
            <p className="mt-2 text-sm font-semibold leading-5 text-emerald-950">
              {phase.completion_signal}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function RoadmapListCard({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </span>
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
      </div>
      <div className="mt-4 space-y-2.5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={`${index}-${item}`} className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              <p className="text-xs leading-5 text-slate-600">{item}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500">Nothing was specified.</p>
        )}
      </div>
    </article>
  );
}

function formatRoadmapDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SetupShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white">
      <BackgroundGlow />

      <section className="careermap-section relative">
        <div className="careermap-container">
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
            }}
            className="mx-auto max-w-xl"
          >
            {children}
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function Badge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-indigo-700">
      {children}
    </span>
  );
}

function EmptyReview({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center">
      <p className="text-[9px] leading-4 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function capitalize(
  value: string,
) {
  if (!value) return "Not provided";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function MiniValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[8px] font-medium text-slate-400">
        {label}
      </span>
      <span className="max-w-[120px] truncate text-right text-[8px] font-bold text-slate-700">
        {value}
      </span>
    </div>
  );
}

function ProfileProgressPanel({
  step,
  stepCopy,
  profile,
}: {
  step: number;
  stepCopy: string[][];
  profile: RoadmapProfile;
}) {
  return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Your profile
      </p>

      <div className="mt-3 space-y-2">
        {stepCopy.map(
          ([label], index) => {
            const itemStep =
              index + 1;

            const completed =
              itemStep < step;

            const current =
              itemStep === step;

            return (
              <div
                key={label}
                className="flex items-center gap-2"
              >
                <span
                  className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold",
                    completed
                      ? "bg-emerald-100 text-emerald-700"
                      : current
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-400 ring-1 ring-slate-200",
                  ].join(" ")}
                >
                  {completed ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    itemStep
                  )}
                </span>

                <span
                  className={[
                    "truncate text-[9px] font-semibold",
                    current
                      ? "text-slate-900"
                      : completed
                        ? "text-slate-600"
                        : "text-slate-400",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
            );
          },
        )}
      </div>

      <div className="mt-5 rounded-xl border border-white bg-white p-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Already captured
        </p>

        <div className="mt-2 space-y-1.5">
          <MiniValue
            label="Role"
            value={
              profile.preferredRole ||
              "—"
            }
          />
          <MiniValue
            label="Skills"
            value={
              profile.skills.length
                ? `${profile.skills.length} selected`
                : "—"
            }
          />
          <MiniValue
            label="Projects"
            value={
              profile.projects.length
                ? `${profile.projects.length} added`
                : "None"
            }
          />
        </div>
      </div>
    </div>
  );
}

function EntryScreen({
  onResume,
  onManual,
}: {
  onResume: () => void;
  onManual: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const cameFromAnalyzer = location.state?.from === "analyzer";

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white">
      <BackgroundGlow />

      <section className="careermap-section relative">
        <div className="careermap-container">
          <motion.div
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="mx-auto max-w-4xl"
          >
            {cameFromAnalyzer && (
              <div className="mb-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/analyzer", { state: { from: "roadmap" } })}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10"
                >
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.9} />
                  Go to Resume & JD Analyzer
                </button>
              </div>
            )}

            <header className="mx-auto max-w-2xl text-center">
              <Badge>
                <Map
                  className="h-3.5 w-3.5"
                  strokeWidth={1.9}
                />
                Personalized career roadmap
              </Badge>

              <h1 className="mt-4 text-[2rem] font-bold leading-[1.06] tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Build your path without
                building a long form.
              </h1>

              <p className="mt-3 text-xs leading-5.5 text-slate-500 sm:text-sm sm:leading-6">
                Start with your resume for the
                fastest route, or answer a few
                simple choices to build a profile.
              </p>
            </header>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <EntryCard
                icon={
                  <Upload
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                }
                eyebrow="Fastest setup"
                title="Upload Your Resume"
                description="We extract the information from your resume. You’ll only choose the target job role."
                action="Upload & continue"
                onClick={onResume}
                featured
              />

              <EntryCard
                icon={
                  <UserRound
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                }
                eyebrow="No resume needed"
                title="Haven’t Resume? No Problem — Make Your Profile"
                description="Answer a few simple questions using choices instead of long forms."
                action="Build my profile"
                onClick={onManual}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 sm:p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  strokeWidth={1.9}
                />
                <div>
                  <p className="text-[10px] font-bold text-emerald-900">
                    Privacy-first by design
                  </p>
                  <p className="mt-0.5 text-[9px] leading-4 text-emerald-800/80">
                    Your roadmap profile stays temporary
                    in this session. Nothing is saved as
                    a permanent account profile.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function ResumeUploadScreen({
  fileInputRef,
  resumeFile,
  isExtracting,
  errorMessage,
  onBack,
  onOpenPicker,
  onFileSelected,
}: {
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  resumeFile: File | null;
  isExtracting: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onOpenPicker: () => void;
  onFileSelected: (
    file: File | null,
  ) => void;
}) {
  return (
    <SetupShell>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900"
      >
        <ArrowLeft
          className="h-3.5 w-3.5"
          strokeWidth={1.9}
        />
        Back
      </button>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.055)] sm:p-7">
        <Badge>
          <FileText
            className="h-3.5 w-3.5"
            strokeWidth={1.9}
          />
          Resume setup
        </Badge>

        <h1 className="mt-4 text-[1.8rem] font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-3xl">
          Upload your resume.
        </h1>

        <p className="mt-2.5 text-xs leading-5.5 text-slate-500 sm:text-sm sm:leading-6">
          We’ll use your resume as the source
          of your profile. You will not be asked
          to re-enter education, experience,
          skills, or projects.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(event) => {
            onFileSelected(
              event.target.files?.[0] ||
                null,
            );
            event.currentTarget.value = "";
          }}
        />

        <button
          type="button"
          onClick={onOpenPicker}
          disabled={isExtracting}
          className={[
            "mt-6 flex min-h-48 w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed px-5 text-center outline-none transition",
            isExtracting
              ? "border-indigo-200 bg-indigo-50/50"
              : resumeFile
                ? "border-emerald-200 bg-emerald-50/40"
                : "border-slate-200 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/40",
            "focus-visible:ring-4 focus-visible:ring-indigo-500/10",
          ].join(" ")}
        >
          <div
            className={[
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              resumeFile
                ? "bg-emerald-100 text-emerald-700"
                : "bg-white text-indigo-600 ring-1 ring-slate-200",
            ].join(" ")}
          >
            {isExtracting ? (
              <Spinner />
            ) : resumeFile ? (
              <CheckCircle2
                className="h-6 w-6"
                strokeWidth={1.9}
              />
            ) : (
              <Upload
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            )}
          </div>

          {isExtracting ? (
            <>
              <p className="mt-4 text-xs font-bold text-indigo-900">
                Preparing your resume…
              </p>
              <p className="mt-1 text-[9px] text-indigo-700/70">
                You’ll only be asked for the target role next.
              </p>
            </>
          ) : resumeFile ? (
            <>
              <p className="mt-4 max-w-full truncate px-4 text-xs font-bold text-emerald-900">
                {resumeFile.name}
              </p>
              <p className="mt-1 text-[9px] text-emerald-700/75">
                Resume selected
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 text-xs font-bold text-slate-900">
                Choose your resume
              </p>
              <p className="mt-1 text-[9px] text-slate-500">
                PDF, DOCX, or DOC • up to 10 MB
              </p>
            </>
          )}
        </button>

        {errorMessage && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
            <p className="text-[9px] font-semibold leading-4 text-rose-700">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-3">
          <ShieldCheck
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600"
            strokeWidth={1.9}
          />
          <p className="text-[9px] leading-4 text-indigo-800">
            We keep the interaction minimal:
            upload → choose target role →
            generate roadmap.
          </p>
        </div>
      </div>
    </SetupShell>
  );
}

function ResumeRoleScreen({
  resumeFile,
  extractionReady,
  role,
  customRole,
  suggestions,
  onRoleChange,
  onSuggestion,
  onCustomRoleChange,
  onBack,
  onGenerate,
  isGenerating,
  generationError,
  generationSuccess,
}: {
  resumeFile: File | null;
  extractionReady: boolean;
  role: string;
  customRole: string;
  suggestions: string[];
  onRoleChange: (value: string) => void;
  onSuggestion: (value: string) => void;
  onCustomRoleChange: (
    value: string,
  ) => void;
  onBack: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationError: string | null;
  generationSuccess: boolean;
}) {
  const effectiveRole =
    role.trim() || customRole.trim();

  return (
    <SetupShell>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900"
      >
        <ArrowLeft
          className="h-3.5 w-3.5"
          strokeWidth={1.9}
        />
        Back
      </button>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.055)] sm:p-7">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3.5 py-3">
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-emerald-600"
            strokeWidth={1.9}
          />
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700">
              {extractionReady ? "Resume extracted" : "Resume selected"}
            </p>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-emerald-900">
              {resumeFile?.name || "Your resume"}
            </p>
          </div>
        </div>

        <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.13em] text-indigo-600">
          Target job role
        </p>

        <h1 className="mt-2 text-[1.8rem] font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-3xl">
          What role are you aiming for?
        </h1>

        <p className="mt-2.5 text-xs leading-5.5 text-slate-500 sm:text-sm sm:leading-6">
          Choose a role suggestion or type
          your own. We keep typing to the
          absolute minimum.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {suggestions.map((suggestion) => (
            <ChoiceButton
              key={suggestion}
              selected={
                role.toLowerCase() ===
                suggestion.toLowerCase()
              }
              onClick={() =>
                onSuggestion(suggestion)
              }
            >
              {suggestion}
            </ChoiceButton>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
          <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
            <Search
              className="h-3.5 w-3.5"
              strokeWidth={1.9}
            />
            Your role
          </label>
          <input
            value={
              customRole || role
            }
            onChange={(event) => {
              const value =
                event.target.value;
              onCustomRoleChange(value);
              onRoleChange(value);
            }}
            placeholder="e.g. AI Engineer"
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        {generationError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
            <p className="text-[9px] font-semibold leading-4 text-rose-700">{generationError}</p>
          </div>
        )}

        {generationSuccess && !generationError && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <p className="text-[9px] font-semibold leading-4 text-emerald-700">
              Roadmap generated successfully. It is stored in your temporary CareerMap session.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isGenerating}
            onClick={onBack}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 hover:border-slate-300 hover:text-slate-900"
          >
            Change resume
          </button>

          <button
            type="button"
            disabled={!effectiveRole || isGenerating}
            onClick={onGenerate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 text-[10px] font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,0.16)] outline-none transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-4 focus-visible:ring-indigo-500/20"
          >
            {isGenerating ? "Building your roadmap…" : "Generate Personalised Roadmap"}
            {isGenerating ? (
              <Spinner />
            ) : (
              <ArrowRight
                className="h-3.5 w-3.5"
                strokeWidth={1.9}
              />
            )}
          </button>
        </div>
      </div>
    </SetupShell>
  );
}

function ManualProfileScreen({
  profile,
  step,
  totalSteps,
  valid,
  customSkill,
  customEducationField,
  projectDraft,
  onBack,
  onNext,
  updateProfile,
  toggleSkill,
  addCustomSkill,
  setCustomSkill,
  updateSkillLevel,
  toggleExperienceType,
  setCustomEducationField,
  addProject,
  setProjectDraft,
  removeProject,
  toggleLearningPreference,
}: {
  profile: RoadmapProfile;
  step: number;
  totalSteps: number;
  valid: boolean;
  customSkill: string;
  customEducationField: string;
  projectDraft: RoadmapProject;
  onBack: () => void;
  onNext: () => void;
  updateProfile: <
    K extends keyof RoadmapProfile,
  >(
    key: K,
    value: RoadmapProfile[K],
  ) => void;
  toggleSkill: (name: string) => void;
  addCustomSkill: () => void;
  setCustomSkill: (
    value: string,
  ) => void;
  updateSkillLevel: (
    skillName: string,
    level: RoadmapSkill["level"],
  ) => void;
  toggleExperienceType: (
    type: string,
  ) => void;
  setCustomEducationField: (
    value: string,
  ) => void;
  addProject: () => void;
  setProjectDraft: Dispatch<SetStateAction<RoadmapProject>>;
  removeProject: (id: string) => void;
  toggleLearningPreference: (
    value: string,
  ) => void;
}) {
  const stepCopy = [
    ["Your target", "What role are you aiming for?"],
    ["Your starting point", "How would you describe your current level?"],
    ["Your goal", "What are you trying to achieve next?"],
    ["Your background", "What is your education background?"],
    ["Your experience", "How much experience do you already have?"],
    ["Your toolkit", "Which skills do you already have?"],
    ["Your proof", "Do you have projects to build from?"],
    ["Your time", "How much time can you learn each week?"],
    ["Your deadline", "When would you like to become ready?"],
    ["Your style", "How do you learn best?"],
  ];

  const progress =
    ((step - 1) /
      (totalSteps - 1)) *
    100;

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white">
      <BackgroundGlow />

      <section className="careermap-section relative">
        <div className="careermap-container">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900"
              >
                <ArrowLeft
                  className="h-3.5 w-3.5"
                  strokeWidth={1.9}
                />
                Back
              </button>

              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Step {step} of {totalSteps}
              </span>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
                animate={{
                  width: `${Math.max(progress, 7)}%`,
                }}
                transition={{
                  duration: 0.3,
                }}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -12,
                    }}
                    transition={{
                      duration: 0.22,
                    }}
                  >
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.055)] sm:p-7">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          {getStepIcon(step)}
                        </span>

                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                            {stepCopy[
                              step - 1
                            ][0]}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            Quick choice • no long form
                          </p>
                        </div>
                      </div>

                      <h1 className="mt-5 text-[1.75rem] font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-3xl">
                        {stepCopy[
                          step - 1
                        ][1]}
                      </h1>

                      <p className="mt-2.5 text-xs leading-5.5 text-slate-500 sm:text-sm sm:leading-6">
                        {step === 1 &&
                          "Pick a suggestion or type your own. This is the main place where custom typing may be useful."}
                        {step === 2 &&
                          "Choose the closest fit. There is no wrong answer."}
                        {step === 3 &&
                          "Choose the outcome that matters most right now."}
                        {step === 4 &&
                          "Choose the closest education option and only type when none fits."}
                        {step === 5 &&
                          "Choose your experience level. Optional details stay compact."}
                        {step === 6 &&
                          "Tap the skills you already have, then set confidence only for selected skills."}
                        {step === 7 &&
                          "Projects are optional. Starting with no projects is completely fine."}
                        {step === 8 &&
                          "Choose a realistic weekly commitment rather than an ideal one."}
                        {step === 9 &&
                          "Choose a timeline so the roadmap can pace your learning properly."}
                        {step === 10 &&
                          "Choose the learning formats you are most likely to use consistently."}
                      </p>

                      <div className="mt-6">
                        {step === 1 && (
                          <RoleProfileStep
                            profile={profile}
                            onSelect={(
                              role,
                            ) =>
                              updateProfile(
                                "preferredRole",
                                role,
                              )
                            }
                            onChange={(
                              value,
                            ) =>
                              updateProfile(
                                "preferredRole",
                                value,
                              )
                            }
                          />
                        )}

                        {step === 2 && (
                          <div className="space-y-2.5">
                            {LEVEL_OPTIONS.map(
                              (option) => {
                                const Icon =
                                  option.icon;

                                return (
                                  <ChoiceRow
                                    key={
                                      option.value
                                    }
                                    selected={
                                      profile.currentLevel ===
                                      option.value
                                    }
                                    onClick={() =>
                                      updateProfile(
                                        "currentLevel",
                                        option.value,
                                      )
                                    }
                                    icon={
                                      <Icon className="h-4 w-4" />
                                    }
                                    title={
                                      option.title
                                    }
                                    description={
                                      option.description
                                    }
                                  />
                                );
                              },
                            )}
                          </div>
                        )}

                        {step === 3 && (
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {GOAL_OPTIONS.map(
                              (option) => (
                                <ChoiceButton
                                  key={
                                    option.value
                                  }
                                  selected={
                                    profile.careerGoal ===
                                    option.value
                                  }
                                  onClick={() =>
                                    updateProfile(
                                      "careerGoal",
                                      option.value,
                                    )
                                  }
                                  className="min-h-[82px] text-left"
                                >
                                  <span className="block">
                                    {option.title}
                                  </span>
                                  <span className="mt-1 block text-[9px] font-medium leading-4 text-slate-500">
                                    {
                                      option.description
                                    }
                                  </span>
                                </ChoiceButton>
                              ),
                            )}
                          </div>
                        )}

                        {step === 4 && (
                          <EducationStep
                            profile={profile}
                            customEducationField={
                              customEducationField
                            }
                            updateProfile={
                              updateProfile
                            }
                            setCustomEducationField={
                              setCustomEducationField
                            }
                          />
                        )}

                        {step === 5 && (
                          <ExperienceStep
                            profile={profile}
                            updateProfile={
                              updateProfile
                            }
                            toggleExperienceType={
                              toggleExperienceType
                            }
                          />
                        )}

                        {step === 6 && (
                          <SkillsStep
                            profile={profile}
                            customSkill={
                              customSkill
                            }
                            setCustomSkill={
                              setCustomSkill
                            }
                            toggleSkill={
                              toggleSkill
                            }
                            addCustomSkill={
                              addCustomSkill
                            }
                            updateSkillLevel={
                              updateSkillLevel
                            }
                          />
                        )}

                        {step === 7 && (
                          <ProjectsStep
                            profile={profile}
                            projectDraft={
                              projectDraft
                            }
                            setProjectDraft={
                              setProjectDraft
                            }
                            addProject={
                              addProject
                            }
                            removeProject={
                              removeProject
                            }
                          />
                        )}

                        {step === 8 && (
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {LEARNING_TIME_OPTIONS.map(
                              (value) => (
                                <ChoiceButton
                                  key={value}
                                  selected={
                                    profile.learningTimePerWeek ===
                                    value
                                  }
                                  onClick={() =>
                                    updateProfile(
                                      "learningTimePerWeek",
                                      value,
                                    )
                                  }
                                  className="min-h-14"
                                >
                                  {value}
                                </ChoiceButton>
                              ),
                            )}
                          </div>
                        )}

                        {step === 9 && (
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {TIMELINE_OPTIONS.map(
                              (value) => (
                                <ChoiceButton
                                  key={value}
                                  selected={
                                    profile.targetTimeline ===
                                    value
                                  }
                                  onClick={() =>
                                    updateProfile(
                                      "targetTimeline",
                                      value,
                                    )
                                  }
                                  className="min-h-14"
                                >
                                  {value}
                                </ChoiceButton>
                              ),
                            )}
                          </div>
                        )}

                        {step === 10 && (
                          <LearningPreferencesStep
                            profile={profile}
                            toggle={
                              toggleLearningPreference
                            }
                          />
                        )}
                      </div>

                      <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <p className="text-[9px] text-slate-400">
                          {step === 1
                            ? "About 2–4 minutes"
                            : "Answers stay temporary in this session."}
                        </p>

                        <button
                          type="button"
                          disabled={!valid}
                          onClick={onNext}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 text-[10px] font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,0.16)] outline-none transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-4 focus-visible:ring-indigo-500/20"
                        >
                          {step ===
                          totalSteps
                            ? "Review my profile"
                            : "Continue"}
                          {step ===
                          totalSteps ? (
                            <ArrowRight
                              className="h-3.5 w-3.5"
                              strokeWidth={1.9}
                            />
                          ) : (
                            <ArrowRight
                              className="h-3.5 w-3.5"
                              strokeWidth={1.9}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <aside className="hidden lg:block">
                <ProfileProgressPanel
                  step={step}
                  stepCopy={stepCopy}
                  profile={profile}
                />
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function RoleProfileStep({
  profile,
  onSelect,
  onChange,
}: {
  profile: RoadmapProfile;
  onSelect: (
    role: string,
  ) => void;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ROLE_SUGGESTIONS.map(
          (role) => (
            <ChoiceButton
              key={role}
              selected={
                profile.preferredRole.toLowerCase() ===
                role.toLowerCase()
              }
              onClick={() =>
                onSelect(role)
              }
            >
              {role}
            </ChoiceButton>
          ),
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
        <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
          <Search
            className="h-3.5 w-3.5"
            strokeWidth={1.9}
          />
          Your role
        </label>

        <input
          value={profile.preferredRole}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder="e.g. AI Engineer"
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>

    </div>
  );
}

function EducationStep({
  profile,
  customEducationField,
  updateProfile,
  setCustomEducationField,
}: {
  profile: RoadmapProfile;
  customEducationField: string;
  updateProfile: <
    K extends keyof RoadmapProfile,
  >(
    key: K,
    value: RoadmapProfile[K],
  ) => void;
  setCustomEducationField: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
        Education level
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EDUCATION_LEVELS.map(
          (level) => (
            <ChoiceButton
              key={level}
              selected={
                profile.education.level ===
                level
              }
              onClick={() =>
                updateProfile(
                  "education",
                  {
                    ...profile.education,
                    level,
                  },
                )
              }
            >
              {level}
            </ChoiceButton>
          ),
        )}
      </div>

      <p className="mb-2 mt-5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
        Field
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EDUCATION_FIELDS.map(
          (field) => (
            <ChoiceButton
              key={field}
              selected={
                profile.education.field ===
                field
              }
              onClick={() =>
                updateProfile(
                  "education",
                  {
                    ...profile.education,
                    field,
                  },
                )
              }
            >
              {field}
            </ChoiceButton>
          ),
        )}
      </div>

      {profile.education.field ===
        "Other" && (
        <input
          value={
            customEducationField
          }
          onChange={(event) => {
            const value =
              event.target.value;

            setCustomEducationField(
              value,
            );

            updateProfile(
              "education",
              {
                ...profile.education,
                field: value,
              },
            );
          }}
          placeholder="Type your field"
          className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />
      )}
    </div>
  );
}

function ExperienceStep({
  profile,
  updateProfile,
  toggleExperienceType,
}: {
  profile: RoadmapProfile;
  updateProfile: <
    K extends keyof RoadmapProfile,
  >(
    key: K,
    value: RoadmapProfile[K],
  ) => void;
  toggleExperienceType: (
    type: string,
  ) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EXPERIENCE_OPTIONS.map(
          (level) => (
            <ChoiceButton
              key={level}
              selected={
                profile.experience
                  .level === level
              }
              onClick={() =>
                updateProfile(
                  "experience",
                  {
                    ...profile.experience,
                    level,
                  },
                )
              }
            >
              {level}
            </ChoiceButton>
          ),
        )}
      </div>

      <p className="mb-2 mt-5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
        Experience type
        <span className="ml-1 normal-case font-medium tracking-normal text-slate-400">
          optional
        </span>
      </p>

      <div className="flex flex-wrap gap-2">
        {EXPERIENCE_TYPES.map(
          (type) => {
            const selected =
              profile.experience.types.includes(
                type,
              );

            return (
              <button
                type="button"
                key={type}
                onClick={() =>
                  toggleExperienceType(
                    type,
                  )
                }
                className={[
                  "rounded-full border px-3 py-2 text-[9px] font-semibold transition",
                  selected
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                ].join(" ")}
              >
                {selected && (
                  <Check className="mr-1 inline h-3 w-3" />
                )}
                {type}
              </button>
            );
          },
        )}
      </div>

      <textarea
        value={
          profile.experience.details
        }
        onChange={(event) =>
          updateProfile(
            "experience",
            {
              ...profile.experience,
              details:
                event.target.value,
            },
          )
        }
        rows={2}
        placeholder="Optional: one line about your most relevant experience"
        className="mt-4 w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
      />
    </div>
  );
}

function SkillsStep({
  profile,
  customSkill,
  setCustomSkill,
  toggleSkill,
  addCustomSkill,
  updateSkillLevel,
}: {
  profile: RoadmapProfile;
  customSkill: string;
  setCustomSkill: (
    value: string,
  ) => void;
  toggleSkill: (
    name: string,
  ) => void;
  addCustomSkill: () => void;
  updateSkillLevel: (
    skillName: string,
    level: RoadmapSkill["level"],
  ) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SKILL_SUGGESTIONS.map(
          (skill) => {
            const selected =
              profile.skills.some(
                (item) =>
                  item.name.toLowerCase() ===
                  skill.toLowerCase(),
              );

            return (
              <button
                type="button"
                key={skill}
                onClick={() =>
                  toggleSkill(skill)
                }
                className={[
                  "rounded-full border px-3 py-2 text-[9px] font-semibold transition",
                  selected
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                ].join(" ")}
              >
                {selected && (
                  <Check className="mr-1 inline h-3 w-3" />
                )}
                {skill}
              </button>
            );
          },
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={customSkill}
          onChange={(event) =>
            setCustomSkill(
              event.target.value,
            )
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomSkill();
            }
          }}
          placeholder="Add another skill"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />

        <button
          type="button"
          onClick={addCustomSkill}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[10px] font-bold text-slate-700 hover:border-slate-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {profile.skills.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
            Your confidence
          </p>

          {profile.skills.map(
            (skill) => (
              <div
                key={skill.name}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-[10px] font-semibold text-slate-800">
                    {skill.name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      toggleSkill(
                        skill.name,
                      )
                    }
                    className="text-slate-400 hover:text-slate-700"
                    aria-label={`Remove ${skill.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2 flex gap-1.5">
                  {(
                    [
                      "beginner",
                      "intermediate",
                      "strong",
                    ] as const
                  ).map(
                    (level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          updateSkillLevel(
                            skill.name,
                            level,
                          )
                        }
                        className={[
                          "rounded-lg px-2.5 py-1.5 text-[8px] font-bold capitalize transition",
                          skill.level ===
                            level
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-500 ring-1 ring-slate-200",
                        ].join(" ")}
                      >
                        {level}
                      </button>
                    ),
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function ProjectsStep({
  profile,
  projectDraft,
  setProjectDraft,
  addProject,
  removeProject,
}: {
  profile: RoadmapProfile;
  projectDraft: RoadmapProject;
  setProjectDraft: Dispatch<SetStateAction<RoadmapProject>>;
  addProject: () => void;
  removeProject: (id: string) => void;
}) {
  const hasProjects =
    profile.projects.length > 0;

  return (
    <div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <ChoiceButton
          selected={!hasProjects}
          onClick={() => {
            if (hasProjects) {
              return;
            }
          }}
          className="min-h-[82px] text-left"
        >
          <span className="block">
            Not yet
          </span>
          <span className="mt-1 block text-[9px] font-medium text-slate-500">
            That’s okay — projects can be
            built inside the roadmap.
          </span>
        </ChoiceButton>

        <ChoiceButton
          selected={hasProjects}
          onClick={() => {
            if (!hasProjects) {
              setProjectDraft(
                newProject(),
              );
            }
          }}
          className="min-h-[82px] text-left"
        >
          <span className="block">
            Yes, I have projects
          </span>
          <span className="mt-1 block text-[9px] font-medium text-slate-500">
            Add only the projects that matter
            most.
          </span>
        </ChoiceButton>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-800">
              Add a project
            </p>
            <p className="mt-0.5 text-[9px] text-slate-500">
              Keep it lightweight.
            </p>
          </div>
          <Plus className="h-4 w-4 text-slate-400" />
        </div>

        <input
          value={projectDraft.name}
          onChange={(event) =>
            setProjectDraft(
              (current) => ({
                ...current,
                name:
                  event.target.value,
              }),
            )
          }
          placeholder="Project name"
          className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />

        <input
          value={projectDraft.technologies.join(
            ", ",
          )}
          onChange={(event) =>
            setProjectDraft(
              (current) => ({
                ...current,
                technologies:
                  event.target.value
                    .split(",")
                    .map(
                      (item) =>
                        item.trim(),
                    )
                    .filter(
                      Boolean,
                    ),
              }),
            )
          }
          placeholder="Technologies (e.g. Python, SQL, Power BI)"
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />

        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              [
                "completed",
                "Completed",
              ],
              [
                "in-progress",
                "In progress",
              ],
              [
                "idea",
                "Idea",
              ],
            ] as const
          ).map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setProjectDraft(
                    (current) => ({
                      ...current,
                      status:
                        value,
                    }),
                  )
                }
                className={[
                  "rounded-full border px-3 py-1.5 text-[8px] font-bold",
                  projectDraft.status ===
                    value
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-500",
                ].join(" ")}
              >
                {label}
              </button>
            ),
          )}
        </div>

        <input
          value={
            projectDraft.contribution
          }
          onChange={(event) =>
            setProjectDraft(
              (current) => ({
                ...current,
                contribution:
                  event.target.value,
              }),
            )
          }
          placeholder="Optional: what did you personally build?"
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />

        <button
          type="button"
          onClick={addProject}
          disabled={
            !projectDraft.name.trim()
          }
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-[10px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Add project
        </button>
      </div>

      {hasProjects && (
        <div className="mt-4 space-y-2">
          {profile.projects.map(
            (project) => (
              <div
                key={project.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-slate-800">
                    {project.name}
                  </p>
                  <p className="mt-1 text-[8px] text-slate-400">
                    {project.technologies.length
                      ? project.technologies.join(
                          " • ",
                        )
                      : "No technologies added"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeProject(
                      project.id,
                    )
                  }
                  className="shrink-0 text-slate-400 hover:text-rose-500"
                  aria-label={`Remove ${project.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function LearningPreferencesStep({
  profile,
  toggle,
}: {
  profile: RoadmapProfile;
  toggle: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {LEARNING_STYLE_OPTIONS.map(
          (option) => {
            const Icon = option.icon;

            const selected =
              profile.learningPreferences.includes(
                option.value,
              );

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  toggle(
                    option.value,
                  )
                }
                className={[
                  "flex min-h-20 flex-col items-start justify-between rounded-2xl border p-3 text-left outline-none transition",
                  selected
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                ].join(" ")}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50">
                  <Icon className="h-4 w-4" />
                </span>

                <span className="text-[9px] font-bold">
                  {option.label}
                </span>
              </button>
            );
          },
        )}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-3">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" />
        <p className="text-[9px] leading-4 text-indigo-800">
          Pick the formats you are most likely
          to use consistently. You can select
          more than one.
        </p>
      </div>
    </div>
  );
}

function ManualReviewScreen({
  profile,
  onBack,
  onModify,
  onGenerate,
  isGenerating,
  generationError,
  generationSuccess,
}: {
  profile: RoadmapProfile;
  onBack: () => void;
  onModify: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationError: string | null;
  generationSuccess: boolean;
}) {
  const goalLabel =
    GOAL_OPTIONS.find(
      (option) =>
        option.value === profile.careerGoal,
    )?.title || "Not provided";

  const learningStyles = profile.learningPreferences
    .map(
      (value) =>
        LEARNING_STYLE_OPTIONS.find(
          (option) =>
            option.value === value,
        )?.label,
    )
    .filter(Boolean) as string[];

  const scrollToSection = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50/70 pb-28 sm:pb-32">
      <BackgroundGlow />

      <section className="careermap-section relative">
        <div className="careermap-container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto max-w-5xl"
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10"
              >
                <ArrowLeft
                  className="h-3.5 w-3.5"
                  strokeWidth={1.9}
                />
                Back
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-emerald-600"
                  strokeWidth={1.9}
                />
                <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  Profile complete
                </span>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:rounded-[2rem]">
              <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-6 sm:px-8 sm:py-8">
                <div className="pointer-events-none absolute right-[-4rem] top-[-5rem] h-40 w-40 rounded-full bg-violet-100/40 blur-3xl" />
                <div className="pointer-events-none absolute bottom-[-4rem] left-[35%] h-32 w-32 rounded-full bg-blue-100/35 blur-3xl" />

                <div className="relative">
                  <div className="flex flex-col gap-4">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5">
                        <FileText
                          className="h-3.5 w-3.5 text-indigo-600"
                          strokeWidth={1.9}
                        />
                        <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-indigo-700">
                          Career profile
                        </span>
                      </div>

                      <h1 className="mt-4 break-words text-[1.85rem] font-bold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-[2.7rem]">
                        {profile.preferredRole ||
                          "Your career profile"}
                      </h1>

                      <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        A quick, resume-style snapshot of
                        everything you entered. Check it once
                        before generating your roadmap.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <ReviewHeaderPill
                        icon={
                          <Target className="h-3 w-3" />
                        }
                        label={
                          profile.preferredRole ||
                          "Target role not set"
                        }
                      />
                      <ReviewHeaderPill
                        icon={
                          <Code2 className="h-3 w-3" />
                        }
                        label={`${profile.skills.length} skills`}
                      />
                      <ReviewHeaderPill
                        icon={
                          <Hammer className="h-3 w-3" />
                        }
                        label={`${profile.projects.length} projects`}
                      />
                    </div>
                  </div>
                </div>
              </header>

              <div className="border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
                <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Jump to
                </p>

                <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {[
                    ["career-review", "Career"],
                    ["education-review", "Education"],
                    ["experience-review", "Experience"],
                    ["skills-review", "Skills"],
                    ["projects-review", "Projects"],
                    ["learning-review", "Learning"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => scrollToSection(id)}
                      className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[8px] font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-5 sm:px-8 sm:py-8">
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:hidden">
                  <div className="flex items-center gap-2">
                    <FileText
                      className="h-3.5 w-3.5 text-slate-500"
                      strokeWidth={1.9}
                    />
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-700">
                      Review checklist
                    </p>
                  </div>
                  <p className="mt-1 text-[9px] leading-4 text-slate-500">
                    Scan the sections below. You can modify
                    anything before generating.
                  </p>
                </div>

                <div
                  id="career-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="01"
                    title="Career Target"
                    description="Where you are headed and why."
                    icon={
                      <Target className="h-3.5 w-3.5" />
                    }
                  />

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <ReviewFact
                      label="Preferred role"
                      value={
                        profile.preferredRole ||
                        "Not provided"
                      }
                    />
                    <ReviewFact
                      label="Current level"
                      value={capitalize(
                        profile.currentLevel,
                      )}
                    />
                    <ReviewFact
                      label="Career goal"
                      value={goalLabel}
                    />
                  </div>
                </div>

                <div className="my-6 h-px bg-slate-100 sm:my-7" />

                <div
                  id="education-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="02"
                    title="Education"
                    description="The background your roadmap can build from."
                    icon={
                      <GraduationCap className="h-3.5 w-3.5" />
                    }
                  />

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <ReviewFact
                      label="Education"
                      value={
                        profile.education.level ||
                        "Not provided"
                      }
                    />
                    <ReviewFact
                      label="Field"
                      value={
                        profile.education.field ||
                        "Not provided"
                      }
                    />
                  </div>
                </div>

                <div className="my-6 h-px bg-slate-100 sm:my-7" />

                <div
                  id="experience-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="03"
                    title="Experience"
                    description="What you already know from real or academic work."
                    icon={
                      <BriefcaseBusiness className="h-3.5 w-3.5" />
                    }
                  />

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <ReviewFact
                      label="Experience"
                      value={
                        profile.experience.level ||
                        "Not provided"
                      }
                    />
                    <ReviewFact
                      label="Experience type"
                      value={
                        profile.experience.types.length
                          ? profile.experience.types.join(
                              " • ",
                            )
                          : "Not provided"
                      }
                    />
                  </div>

                  {profile.experience.details && (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                      <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-slate-400">
                        Relevant detail
                      </p>
                      <p className="mt-1 text-[10px] leading-4.5 text-slate-600">
                        {profile.experience.details}
                      </p>
                    </div>
                  )}
                </div>

                <div className="my-6 h-px bg-slate-100 sm:my-7" />

                <div
                  id="skills-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="04"
                    title="Skills"
                    description="Your current toolkit and confidence level."
                    icon={
                      <Code2 className="h-3.5 w-3.5" />
                    }
                    meta={`${profile.skills.length} selected`}
                  />

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/55 p-3.5 sm:p-4">
                    {profile.skills.length ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <div
                            key={skill.name}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm"
                          >
                            <p className="text-[9px] font-bold text-slate-800">
                              {skill.name}
                            </p>
                            <p className="mt-0.5 text-[8px] font-semibold capitalize text-slate-400">
                              {skill.level}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyReview text="No skills added." />
                    )}
                  </div>
                </div>

                <div className="my-6 h-px bg-slate-100 sm:my-7" />

                <div
                  id="projects-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="05"
                    title="Projects"
                    description="Evidence you can build from or opportunities to add."
                    icon={
                      <Hammer className="h-3.5 w-3.5" />
                    }
                    meta={
                      profile.projects.length
                        ? `${profile.projects.length} added`
                        : "None yet"
                    }
                  />

                  <div className="mt-3">
                    {profile.projects.length ? (
                      <div className="space-y-2.5">
                        {profile.projects.map(
                          (project, index) => (
                            <div
                              key={project.id}
                              className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[8px] font-bold text-slate-500">
                                  {String(
                                    index + 1,
                                  ).padStart(2, "0")}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-[10px] font-bold text-slate-800">
                                      {project.name}
                                    </p>
                                    <span className="rounded-full bg-slate-50 px-2 py-1 text-[8px] font-semibold capitalize text-slate-500 ring-1 ring-slate-200">
                                      {project.status.replace(
                                        "-",
                                        " ",
                                      )}
                                    </span>
                                  </div>

                                  {project.technologies.length >
                                    0 && (
                                    <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
                                      {project.technologies.join(
                                        " • ",
                                      )}
                                    </p>
                                  )}

                                  {project.contribution && (
                                    <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
                                      {project.contribution}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <EmptyReview text="No projects yet. Your roadmap can include project-building." />
                    )}
                  </div>
                </div>

                <div className="my-6 h-px bg-slate-100 sm:my-7" />

                <div
                  id="learning-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="06"
                    title="Learning Plan"
                    description="How your roadmap should fit into your life."
                    icon={
                      <Clock3 className="h-3.5 w-3.5" />
                    }
                  />

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <ReviewFact
                      label="Weekly learning time"
                      value={
                        profile.learningTimePerWeek ||
                        "Not provided"
                      }
                    />
                    <ReviewFact
                      label="Target timeline"
                      value={
                        profile.targetTimeline ||
                        "Not provided"
                      }
                    />
                  </div>

                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-slate-400">
                      Learning preferences
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {learningStyles.length ? (
                        learningStyles.map(
                          (style) => (
                            <span
                              key={style}
                              className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[9px] font-semibold text-indigo-700"
                            >
                              {style}
                            </span>
                          ),
                        )
                      ) : (
                        <span className="text-[9px] text-slate-400">
                          None selected.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-7 hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 p-4 sm:block sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.18)]">
                      <Sparkles
                        className="h-4 w-4"
                        strokeWidth={1.9}
                      />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-indigo-600">
                        Ready for the next step
                      </p>
                      <h2 className="mt-1 text-sm font-bold tracking-tight text-slate-900">
                        Everything looks good?
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {generationError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                <p className="text-[9px] font-semibold leading-4 text-rose-700">{generationError}</p>
              </div>
            )}

            {generationSuccess && !generationError && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <p className="text-[9px] font-semibold leading-4 text-emerald-700">
                  Roadmap generated successfully. It is stored in your temporary CareerMap session.
                </p>
              </div>
            )}

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:absolute sm:relative sm:mt-5 sm:border sm:rounded-2xl sm:bg-white sm:px-4 sm:shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:backdrop-blur-none">
              <div className="mx-auto flex max-w-5xl items-center gap-2">
                <div className="hidden min-w-0 flex-1 sm:block">
                  <p className="text-[9px] font-bold text-slate-800">
                    Ready to build your roadmap?
                  </p>
                  <p className="mt-0.5 text-[8px] text-slate-400">
                    You can still modify your profile before generating.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={onModify}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 sm:flex-none sm:min-w-[110px]"
                >
                  <FileText
                    className="h-3.5 w-3.5"
                    strokeWidth={1.9}
                  />
                  Modify
                </button>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={onGenerate}
                  className="inline-flex min-h-11 flex-[1.35] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 text-[10px] font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,0.2)] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 sm:flex-none sm:min-w-[240px]"
                >
                  {isGenerating ? "Building your roadmap…" : "Generate Personalised Roadmap"}
                  {isGenerating ? (
                    <Spinner />
                  ) : (
                    <ArrowRight
                      className="h-3.5 w-3.5"
                      strokeWidth={1.9}
                    />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function ReviewSectionLabel({
  eyebrow,
  title,
  description,
  icon,
  meta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  meta?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </span>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold tracking-[0.08em] text-slate-400">
              {eyebrow}
            </span>
            <h2 className="text-[11px] font-bold text-slate-900">
              {title}
            </h2>
          </div>

          <p className="mt-0.5 max-w-xl text-[9px] leading-4 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {meta && (
        <span className="shrink-0 rounded-full bg-slate-50 px-2 py-1 text-[8px] font-semibold text-slate-400 ring-1 ring-slate-100">
          {meta}
        </span>
      )}
    </div>
  );
}

function ReviewFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-[10px] font-semibold leading-4.5 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function ReviewHeaderPill({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/90 bg-white/80 px-2.5 py-1.5 text-[8px] font-semibold text-slate-600 shadow-sm">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}


function ChoiceRow({
  selected,
  onClick,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3.5 text-left outline-none transition",
        selected
          ? "border-indigo-200 bg-indigo-50/80"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          selected
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={[
            "block text-[10px] font-bold",
            selected
              ? "text-indigo-900"
              : "text-slate-800",
          ].join(" ")}
        >
          {title}
        </span>
        <span className="mt-0.5 block text-[9px] leading-4 text-slate-500">
          {description}
        </span>
      </span>

      <CheckCircle2
        className={[
          "h-4 w-4 shrink-0",
          selected
            ? "text-indigo-600"
            : "text-slate-200",
        ].join(" ")}
        strokeWidth={1.9}
      />
    </button>
  );
}


function getStepIcon(
  step: number,
) {
  switch (step) {
    case 1:
      return (
        <Target className="h-4 w-4" />
      );
    case 2:
      return (
        <Sparkles className="h-4 w-4" />
      );
    case 3:
      return (
        <Flag className="h-4 w-4" />
      );
    case 4:
      return (
        <GraduationCap className="h-4 w-4" />
      );
    case 5:
      return (
        <BriefcaseBusiness className="h-4 w-4" />
      );
    case 6:
      return (
        <Code2 className="h-4 w-4" />
      );
    case 7:
      return (
        <Hammer className="h-4 w-4" />
      );
    case 8:
      return (
        <Clock3 className="h-4 w-4" />
      );
    case 9:
      return (
        <Target className="h-4 w-4" />
      );
    default:
      return (
        <Heart className="h-4 w-4" />
      );
  }
}

function BackgroundGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-blue-100/25 blur-3xl" />
      <div className="absolute right-[-8rem] top-10 h-80 w-80 rounded-full bg-violet-100/20 blur-3xl" />
    </div>
  );
}

function Spinner() {
  return (
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
  );
}

export default RoadmapPage;
