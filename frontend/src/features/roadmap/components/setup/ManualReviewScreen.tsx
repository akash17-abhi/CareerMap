import type { ReactNode } from "react";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Code2,
  FileText,
  GraduationCap,
  Hammer,
  Sparkles,
  Target,
} from "lucide-react";

import type {
  RoadmapProfile,
  RoadmapProject,
  RoadmapSkill,
} from "../../types/roadmap";

import {
  GOAL_OPTIONS,
  LEARNING_STYLE_OPTIONS,
} from "../../utils/roadmapConstants";

import { capitalize } from "../../utils/roadmapFormatters";

import {
  BackgroundGlow,
  EmptyReview,
  Spinner,
} from "../shared/RoadmapUI";

interface ManualReviewScreenProps {
  profile: RoadmapProfile;
  onBack: () => void;
  onModify: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationError: string | null;
  generationSuccess: boolean;
}

const REVIEW_SECTIONS = [
  ["career-review", "Career"],
  ["education-review", "Education"],
  ["experience-review", "Experience"],
  ["skills-review", "Skills"],
  ["projects-review", "Projects"],
  ["learning-review", "Learning"],
] as const;

export default function ManualReviewScreen({
  profile,
  onBack,
  onModify,
  onGenerate,
  isGenerating,
  generationError,
  generationSuccess,
}: ManualReviewScreenProps) {
  const goalLabel =
    GOAL_OPTIONS.find(
      (option) => option.value === profile.careerGoal,
    )?.title || "Not provided";

  const learningStyles = profile.learningPreferences
    .map(
      (value) =>
        LEARNING_STYLE_OPTIONS.find(
          (option) => option.value === value,
        )?.label,
    )
    .filter(Boolean) as string[];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50/60 pb-28 text-slate-900 sm:pb-10">
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
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto w-full max-w-6xl"
          >
            {/* Top navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 sm:px-4"
              >
                <ArrowLeft
                  className="h-3.5 w-3.5"
                  strokeWidth={1.9}
                />
                Back
              </button>

              <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-700 sm:px-3.5 sm:text-[9px]">
                <CheckCircle2
                  className="h-3.5 w-3.5 text-emerald-600"
                  strokeWidth={1.9}
                />
                Profile complete
              </div>
            </div>

            {/* Main review workspace */}
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:mt-5 sm:rounded-[2rem]">
              {/* Hero */}
              <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/80">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-[-5rem] top-[-5rem] h-44 w-44 rounded-full bg-violet-100/35 blur-3xl sm:h-56 sm:w-56"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-[-5rem] left-[32%] h-36 w-36 rounded-full bg-blue-100/30 blur-3xl sm:h-44 sm:w-44"
                />

                <div className="relative px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0 max-w-3xl">
                      <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-indigo-100 bg-white/85 px-3 text-[8px] font-bold uppercase tracking-[0.13em] text-indigo-700 shadow-sm sm:min-h-9 sm:px-3.5 sm:text-[9px]">
                        <FileText
                          className="h-3.5 w-3.5 text-indigo-600"
                          strokeWidth={1.9}
                        />
                        Career profile
                      </div>

                      <h1 className="mt-4 break-words text-[1.8rem] font-bold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-[2.55rem] lg:text-[2.9rem]">
                        {profile.preferredRole ||
                          "Your career profile"}
                      </h1>

                      <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        A quick snapshot of everything you
                        entered. Review it once before
                        generating your personalized roadmap.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
                      <ReviewHeaderPill
                        icon={
                          <Target
                            className="h-3 w-3"
                            strokeWidth={2}
                          />
                        }
                        label={
                          profile.preferredRole ||
                          "Target role not set"
                        }
                      />

                      <ReviewHeaderPill
                        icon={
                          <Code2
                            className="h-3 w-3"
                            strokeWidth={2}
                          />
                        }
                        label={`${profile.skills.length} skills`}
                      />

                      <ReviewHeaderPill
                        icon={
                          <Hammer
                            className="h-3 w-3"
                            strokeWidth={2}
                          />
                        }
                        label={`${profile.projects.length} projects`}
                      />
                    </div>
                  </div>
                </div>
              </header>

              {/* Mobile jump navigation */}
              <div className="border-b border-slate-200 bg-white px-4 py-3.5 sm:hidden">
                <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Jump to section
                </p>

                <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {REVIEW_SECTIONS.map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        scrollToSection(id)
                      }
                      className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[8px] font-bold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review content */}
              <div className="px-4 py-5 sm:px-7 sm:py-7 lg:px-9 lg:py-8">
                {/* Mobile review note */}
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:hidden">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                      <FileText
                        className="h-3.5 w-3.5"
                        strokeWidth={1.9}
                      />
                    </span>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-700">
                        Review checklist
                      </p>

                      <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
                        Check the details below. You can
                        modify anything before generation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Career */}
                <div
                  id="career-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="01"
                    title="Career Target"
                    description="Where you are headed and what you want to achieve."
                    icon={
                      <Target
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                      />
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

                <ReviewDivider />

                {/* Education */}
                <div
                  id="education-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="02"
                    title="Education"
                    description="The academic background your roadmap can build from."
                    icon={
                      <GraduationCap
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                      />
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

                <ReviewDivider />

                {/* Experience */}
                <div
                  id="experience-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="03"
                    title="Experience"
                    description="What you already know from real, academic, or personal work."
                    icon={
                      <BriefcaseBusiness
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                      />
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

                  {profile.experience.details ? (
                    <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50/65 p-3.5 sm:p-4">
                      <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-slate-400">
                        Relevant detail
                      </p>

                      <p className="mt-1.5 text-[10px] leading-4.5 text-slate-600 sm:text-[11px] sm:leading-5">
                        {profile.experience.details}
                      </p>
                    </div>
                  ) : null}
                </div>

                <ReviewDivider />

                {/* Skills */}
                <div
                  id="skills-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="04"
                    title="Skills"
                    description="Your current toolkit and confidence level."
                    icon={
                      <Code2
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                      />
                    }
                    meta={`${profile.skills.length} selected`}
                  />

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/55 p-3.5 sm:p-4">
                    {profile.skills.length ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map(
                          (skill: RoadmapSkill) => (
                            <div
                              key={skill.name}
                              className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-[0_1px_4px_rgba(15,23,42,0.04)]"
                            >
                              <p className="text-[9px] font-bold text-slate-800">
                                {skill.name}
                              </p>

                              <p className="mt-0.5 text-[8px] font-semibold capitalize text-slate-400">
                                {skill.level}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <EmptyReview text="No skills added." />
                    )}
                  </div>
                </div>

                <ReviewDivider />

                {/* Projects */}
                <div
                  id="projects-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="05"
                    title="Projects"
                    description="Evidence you can build from and opportunities to strengthen your portfolio."
                    icon={
                      <Hammer
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                      />
                    }
                    meta={
                      profile.projects.length
                        ? `${profile.projects.length} added`
                        : "None yet"
                    }
                  />

                  <div className="mt-3">
                    {profile.projects.length ? (
                      <div className="grid gap-2.5 lg:grid-cols-2">
                        {profile.projects.map(
                          (
                            project: RoadmapProject,
                            index,
                          ) => (
                            <div
                              key={project.id}
                              className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_5px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_5px_18px_rgba(15,23,42,0.06)] sm:p-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[8px] font-bold text-slate-500">
                                  {String(
                                    index + 1,
                                  ).padStart(2, "0")}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-start gap-2">
                                    <p className="min-w-0 break-words text-[10px] font-bold text-slate-800 sm:text-[11px]">
                                      {project.name}
                                    </p>

                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[8px] font-semibold capitalize text-slate-500">
                                      {project.status.replace(
                                        "-",
                                        " ",
                                      )}
                                    </span>
                                  </div>

                                  {project.technologies
                                    .length > 0 ? (
                                    <p className="mt-1.5 break-words text-[9px] leading-4 text-slate-500">
                                      {project.technologies.join(
                                        " • ",
                                      )}
                                    </p>
                                  ) : null}

                                  {project.contribution ? (
                                    <p className="mt-1.5 break-words text-[9px] leading-4 text-slate-500 sm:text-[10px] sm:leading-4.5">
                                      {project.contribution}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <EmptyReview text="No projects yet. Your roadmap can include project-building opportunities." />
                    )}
                  </div>
                </div>

                <ReviewDivider />

                {/* Learning */}
                <div
                  id="learning-review"
                  className="scroll-mt-20"
                >
                  <ReviewSectionLabel
                    eyebrow="06"
                    title="Learning Plan"
                    description="How your roadmap should fit into your available time and preferred learning style."
                    icon={
                      <Clock3
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                      />
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

                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50/65 p-3.5 sm:p-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-slate-400">
                      Learning preferences
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {learningStyles.length ? (
                        learningStyles.map((style) => (
                          <span
                            key={style}
                            className="inline-flex min-h-7 items-center rounded-full border border-indigo-100 bg-indigo-50 px-2.5 text-[9px] font-semibold text-indigo-700"
                          >
                            {style}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-400">
                          None selected.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop readiness card */}
                <div className="mt-7 hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/75 via-white to-violet-50/70 p-4 sm:block sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                      <Sparkles
                        className="h-4 w-4"
                        strokeWidth={1.9}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-indigo-600">
                        Ready for the next step
                      </p>

                      <h2 className="mt-1 text-sm font-bold tracking-tight text-slate-900">
                        Everything looks good?
                      </h2>

                      <p className="mt-1 text-[9px] leading-4 text-slate-500">
                        You can still modify your profile before
                        generating the roadmap.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generation feedback */}
            {generationError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 sm:px-4">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 ring-1 ring-rose-100">
                    <span className="text-[10px] font-bold">
                      !
                    </span>
                  </span>

                  <p
                    role="alert"
                    className="text-[9px] font-semibold leading-4 text-rose-700 sm:text-[10px]"
                  >
                    {generationError}
                  </p>
                </div>
              </div>
            ) : null}

            {generationSuccess && !generationError ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 sm:px-4">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    strokeWidth={1.9}
                  />

                  <p className="text-[9px] font-semibold leading-4 text-emerald-700 sm:text-[10px]">
                    Roadmap generated successfully. It is
                    stored in your temporary CareerMap session.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Bottom action bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:relative sm:mt-5 sm:rounded-2xl sm:border sm:bg-white sm:px-4 sm:py-3.5 sm:shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:backdrop-blur-none">
              <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
                <div className="hidden min-w-0 flex-1 sm:block">
                  <p className="text-[10px] font-bold text-slate-800">
                    Ready to build your roadmap?
                  </p>

                  <p className="mt-0.5 text-[8px] text-slate-400">
                    Review complete. You can still modify your
                    profile before generating.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={onModify}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:min-w-[112px]"
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
                  className="inline-flex min-h-11 flex-[1.35] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-[10px] font-bold text-white shadow-[0_8px_22px_rgba(79,70,229,0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:flex-none sm:min-w-[250px]"
                >
                  {isGenerating
                    ? "Building your roadmap…"
                    : "Generate Personalised Roadmap"}

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

function ReviewDivider() {
  return (
    <div
      aria-hidden="true"
      className="my-6 h-px bg-slate-100 sm:my-7"
    />
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
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold tracking-[0.08em] text-slate-400">
              {eyebrow}
            </span>

            <h2 className="text-[11px] font-bold text-slate-900 sm:text-xs">
              {title}
            </h2>
          </div>

          <p className="mt-0.5 max-w-2xl text-[9px] leading-4 text-slate-500 sm:text-[10px] sm:leading-4.5">
            {description}
          </p>
        </div>
      </div>

      {meta ? (
        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[8px] font-semibold text-slate-400">
          {meta}
        </span>
      ) : null}
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
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_5px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(15,23,42,0.05)] sm:p-3.5">
      <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-[10px] font-semibold leading-4.5 text-slate-700 sm:text-[11px] sm:leading-5">
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
    <span className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-white/90 bg-white/85 px-2.5 text-[8px] font-semibold text-slate-600 shadow-sm sm:min-h-9 sm:px-3">
      <span className="shrink-0 text-indigo-600">
        {icon}
      </span>

      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}