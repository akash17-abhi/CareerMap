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

  const isLastStep =
    safeStep === totalSteps;

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white">
      <BackgroundGlow />

      {/* Additional subtle ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-14rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-indigo-100/20 blur-3xl" />

        <div className="absolute bottom-[-12rem] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-violet-100/15 blur-3xl" />
      </div>

      <section className="relative">
        <div className="careermap-container">
          <div className="mx-auto max-w-6xl">
            {/* Top navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="group inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:text-slate-950 hover:shadow-md active:scale-[0.995] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 sm:min-h-10 sm:rounded-xl sm:px-3.5 sm:text-xs"
              >
                <ArrowLeft
                  className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:-translate-x-0.5"
                  strokeWidth={1.9}
                />

                Back
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] font-medium text-slate-400 sm:inline">
                  Profile setup
                </span>

                <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:px-3 sm:text-[10px]">
                  Step {safeStep} of {totalSteps}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div
              className="mt-4"
              aria-label="Profile progress"
            >
              <div
                className="h-1.5 overflow-hidden rounded-full bg-slate-100"
                aria-label={`Profile completion: ${Math.round(progress)}%`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[9px] font-medium text-slate-400 sm:text-[10px]">
                  Building your profile
                </span>

                <span className="text-[9px] font-bold text-indigo-600 sm:text-[10px]">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Main workspace */}
            <div className="mt-5 grid gap-5 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_270px]">
              {/* Question card */}
              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={safeStep}
                    className="motion-reduce:!transform-none"
                    initial={{
                      opacity: 0,
                      x: 10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -10,
                    }}
                    transition={{
                      duration: 0.22,
                      ease: "easeOut",
                    }}
                  >
                    <div
                      aria-labelledby="roadmap-profile-question"
                      className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.055)] sm:rounded-[1.75rem] sm:shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                      {/* Question header */}
                      <div className="px-4 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-7 lg:px-8">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 sm:h-10 sm:w-10">
                            <span className="text-[11px] font-bold sm:text-xs">
                              {String(
                                safeStep,
                              ).padStart(2, "0")}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-indigo-600 sm:text-[11px]">
                              {currentCopy[0]}
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">
                              Quick choice · no long form
                            </p>
                          </div>
                        </div>

                        <h1 id="roadmap-profile-question" className="mt-5 max-w-3xl text-[1.75rem] font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:mt-6 sm:text-[2.35rem] lg:text-[2.5rem]">
                          {currentCopy[1]}
                        </h1>

                        <p className="mt-3 max-w-2xl text-[13px] leading-5.5 text-slate-500 sm:mt-4 sm:text-[14px] sm:leading-6.5">
                          {currentDescription}
                        </p>
                      </div>

                      {/* Step content */}
                      <div className="border-t border-slate-100 px-4 py-5 sm:px-7 sm:py-7 lg:px-8">
                        <ProfileStepContent
                          step={safeStep}
                          profile={profile}
                          customSkill={customSkill}
                          customEducationField={
                            customEducationField
                          }
                          projectDraft={
                            projectDraft
                          }
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

                      {/* Footer actions */}
                      <div className="border-t border-slate-100 bg-slate-50/45 px-4 py-4 sm:px-7 sm:py-5 lg:px-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="order-2 sm:order-1">
                            <p className="text-[9px] leading-4 text-slate-400 sm:text-[10px] sm:leading-5">
                              {safeStep === 1
                                ? "Takes about 2–4 minutes"
                                : "Your answers stay temporary in this session."}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={!valid}
                            onClick={onNext}
                            className="order-1 inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-[11px] font-bold text-white shadow-[0_8px_22px_rgba(79,70,229,0.16)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-[0_12px_28px_rgba(79,70,229,0.2)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 sm:order-2 sm:w-auto sm:text-xs"
                          >
                            {isLastStep
                              ? "Review My Profile"
                              : "Continue"}

                            <ArrowRight
                              className="h-3.5 w-3.5"
                              strokeWidth={1.9}
                            />
                          </button>
                        </div>

                        {!valid ? (
                          <p className="mt-2 text-right text-[9px] font-medium text-slate-400 sm:text-[10px]">
                            Complete the required selection above to continue.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Desktop progress panel */}
              <aside aria-label="Profile setup progress" className="hidden lg:block lg:sticky lg:top-24">
                <ProfileProgressPanel
                  step={safeStep}
                  stepCopy={
                    STEP_COPY as unknown as string[][]
                  }
                  profile={profile}
                />
              </aside>
            </div>

            {/* Mobile progress summary */}
            <div className="mt-4 lg:hidden">
              <div className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Current step
                    </p>

                    <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-700">
                      {currentCopy[0]}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[10px] font-bold text-indigo-600">
                      {safeStep}
                    </span>

                    <span className="text-[10px] text-slate-300">
                      /
                    </span>

                    <span className="text-[10px] font-semibold text-slate-400">
                      {totalSteps}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-10 gap-1">
                  {Array.from({
                    length: totalSteps,
                  }).map((_, index) => {
                    const stepNumber =
                      index + 1;

                    const completed =
                      stepNumber < safeStep;

                    const current =
                      stepNumber === safeStep;

                    return (
                      <div
                        key={stepNumber}
                        className={[
                          "h-1 rounded-full transition-colors duration-200",
                          completed
                            ? "bg-indigo-500"
                            : current
                              ? "bg-indigo-300"
                              : "bg-slate-100",
                        ].join(" ")}
                      />
                    );
                  })}
                </div>
              </div>
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