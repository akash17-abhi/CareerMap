import type {
  Dispatch,
  SetStateAction,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import type {
  RoadmapProfile,
  RoadmapProject,
  RoadmapSkill,
} from "../../types/roadmap";

import {
  BackgroundGlow,
} from "../shared/RoadmapUI";

import ProfileProgressPanel from "../shared/ProfileProgressPanel";

import {
  ProfileStepContent,
} from "./ProfileStepContent";

interface ManualProfileScreenProps {
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
  setCustomSkill: (value: string) => void;

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

  setProjectDraft: Dispatch<
    SetStateAction<RoadmapProject>
  >;

  removeProject: (id: string) => void;

  toggleLearningPreference: (
    value: string,
  ) => void;
}

const STEP_COPY = [
  [
    "Your target",
    "What role are you aiming for?",
  ],
  [
    "Your starting point",
    "How would you describe your current level?",
  ],
  [
    "Your goal",
    "What are you trying to achieve next?",
  ],
  [
    "Your background",
    "What is your education background?",
  ],
  [
    "Your experience",
    "How much experience do you already have?",
  ],
  [
    "Your toolkit",
    "Which skills do you already have?",
  ],
  [
    "Your proof",
    "Do you have projects to build from?",
  ],
  [
    "Your time",
    "How much time can you learn each week?",
  ],
  [
    "Your deadline",
    "When would you like to become ready?",
  ],
  [
    "Your style",
    "How do you learn best?",
  ],
] as const;

const STEP_DESCRIPTIONS = [
  "Pick a suggestion or type your own. This is the main place where custom typing may be useful.",
  "Choose the closest fit. There is no wrong answer.",
  "Choose the outcome that matters most right now.",
  "Choose the closest education option and only type when none fits.",
  "Choose your experience level. Optional details stay compact.",
  "Tap the skills you already have, then set confidence only for selected skills.",
  "Projects are optional. Starting with no projects is completely fine.",
  "Choose a realistic weekly commitment rather than an ideal one.",
  "Choose a timeline so the roadmap can pace your learning properly.",
  "Choose the learning formats you are most likely to use consistently.",
] as const;

export default function ManualProfileScreen({
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
}: ManualProfileScreenProps) {
  const safeStep = Math.min(
    Math.max(step, 1),
    totalSteps,
  );

  const progress =
    totalSteps > 1
      ? ((safeStep - 1) /
          (totalSteps - 1)) *
        100
      : 100;

  const currentCopy =
    STEP_COPY[safeStep - 1] ??
    STEP_COPY[0];

  const currentDescription =
    STEP_DESCRIPTIONS[safeStep - 1] ??
    STEP_DESCRIPTIONS[0];

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
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10"
              >
                <ArrowLeft
                  className="h-3.5 w-3.5"
                  strokeWidth={1.9}
                />

                Back
              </button>

              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Step {safeStep} of {totalSteps}
              </span>
            </div>

            <div
              className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100"
              aria-label={`Profile completion: ${Math.round(progress)}%`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
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
                <AnimatePresence
                  mode="wait"
                >
                  <motion.div
                    key={safeStep}
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
                          <ProfileStepContent
                            step={safeStep}
                            profile={profile}
                            customSkill={customSkill}
                            customEducationField={
                              customEducationField
                            }
                            projectDraft={projectDraft}
                            updateProfile={
                              updateProfile
                            }
                            toggleSkill={
                              toggleSkill
                            }
                            addCustomSkill={
                              addCustomSkill
                            }
                            setCustomSkill={
                              setCustomSkill
                            }
                            updateSkillLevel={
                              updateSkillLevel
                            }
                            toggleExperienceType={
                              toggleExperienceType
                            }
                            setCustomEducationField={
                              setCustomEducationField
                            }
                            addProject={
                              addProject
                            }
                            setProjectDraft={
                              setProjectDraft
                            }
                            removeProject={
                              removeProject
                            }
                            toggleLearningPreference={
                              toggleLearningPreference
                            }
                            iconOnly
                          />
                        </span>

                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                            {currentCopy[0]}
                          </p>

                          <p className="text-[9px] text-slate-400">
                            Quick choice • no long form
                          </p>
                        </div>
                      </div>

                      <h1 className="mt-5 text-[1.75rem] font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-3xl">
                        {currentCopy[1]}
                      </h1>

                      <p className="mt-2.5 text-xs leading-5.5 text-slate-500 sm:text-sm sm:leading-6">
                        {currentDescription}
                      </p>

                      <div className="mt-6">
                        <ProfileStepContent
                          step={safeStep}
                          profile={profile}
                          customSkill={customSkill}
                          customEducationField={
                            customEducationField
                          }
                          projectDraft={projectDraft}
                          updateProfile={
                            updateProfile
                          }
                          toggleSkill={
                            toggleSkill
                          }
                          addCustomSkill={
                            addCustomSkill
                          }
                          setCustomSkill={
                            setCustomSkill
                          }
                          updateSkillLevel={
                            updateSkillLevel
                          }
                          toggleExperienceType={
                            toggleExperienceType
                          }
                          setCustomEducationField={
                            setCustomEducationField
                          }
                          addProject={
                            addProject
                          }
                          setProjectDraft={
                            setProjectDraft
                          }
                          removeProject={
                            removeProject
                          }
                          toggleLearningPreference={
                            toggleLearningPreference
                          }
                        />
                      </div>

                      <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <p className="text-[9px] text-slate-400">
                          {safeStep === 1
                            ? "About 2–4 minutes"
                            : "Answers stay temporary in this session."}
                        </p>

                        <button
                          type="button"
                          disabled={!valid}
                          onClick={onNext}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 text-[10px] font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,0.16)] outline-none transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20"
                        >
                          {safeStep ===
                          totalSteps
                            ? "Review my profile"
                            : "Continue"}

                          <ArrowRight
                            className="h-3.5 w-3.5"
                            strokeWidth={1.9}
                          />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <aside className="hidden lg:block">
                <ProfileProgressPanel
                  step={safeStep}
                  stepCopy={
                    STEP_COPY as unknown as string[][]
                  }
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

export {
  STEP_COPY,
};