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
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50/70 pb-28 sm:pb-32">
      <BackgroundGlow />

      <section className="careermap-section relative">
        <div className="careermap-container">
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
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
                        {profile.skills.map(
                          (skill: RoadmapSkill) => (
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
                          ),
                        )}
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
                          (
                            project: RoadmapProject,
                            index,
                          ) => (
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

                                  {project.technologies
                                    .length > 0 && (
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
                        learningStyles.map((style) => (
                          <span
                            key={style}
                            className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[9px] font-semibold text-indigo-700"
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
                <p className="text-[9px] font-semibold leading-4 text-rose-700">
                  {generationError}
                </p>
              </div>
            )}

            {generationSuccess && !generationError && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <p className="text-[9px] font-semibold leading-4 text-emerald-700">
                  Roadmap generated successfully. It is
                  stored in your temporary CareerMap session.
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
                    You can still modify your profile before
                    generating.
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