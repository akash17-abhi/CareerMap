import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import type {
  GeneratedRoadmap,
  GeneratedRoadmapPhase,
} from "../../types/roadmap";

import { formatRoadmapDate } from "../../utils/roadmapFormatters";

import { BackgroundGlow } from "../shared/RoadmapUI";

interface RoadmapResultsScreenProps {
  roadmap: GeneratedRoadmap;
  source: string | null;
  generatedAt: string | null;
  cameFromAnalyzer: boolean;
  onStartOver: () => void;
}

export default function RoadmapResultsScreen({
  roadmap,
  source,
  generatedAt,
  cameFromAnalyzer,
  onStartOver,
}: RoadmapResultsScreenProps) {
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
                    {source === "cv"
                      ? "Resume-based"
                      : "Profile-based"}
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
              items={roadmap.weekly_routine}
            />

            <RoadmapListCard
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              title="Portfolio outcomes"
              items={roadmap.portfolio_outcomes}
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
              {roadmap.final_readiness_checklist.map(
                (item, index) => (
                  <div
                    key={`${index}-${item}`}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check
                        className="h-3.5 w-3.5"
                        strokeWidth={2.5}
                      />
                    </span>

                    <p className="text-sm leading-5 text-slate-700">
                      {item}
                    </p>
                  </div>
                ),
              )}
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
                {roadmap.grounding_notes.map(
                  (note, index) => (
                    <p
                      key={`${index}-${note}`}
                      className="text-xs leading-5 text-slate-500"
                    >
                      {note}
                    </p>
                  ),
                )}
              </div>
            </section>
          ) : null}

          <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Your roadmap is stored only in this temporary
                CareerMap session.
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
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl border ${toneClasses}`}
        >
          {icon}
        </span>

        <h3 className="text-sm font-black text-slate-950">
          {title}
        </h3>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {items.map((item, index) => (
            <div
              key={`${index}-${item}`}
              className="flex items-start gap-2.5"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />

              <p className="text-xs leading-5 text-slate-600">
                {item}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          {emptyLabel}
        </p>
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
        delay: Math.min(index * 0.05, 0.25),
      }}
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
            {phase.milestones.map(
              (milestone, milestoneIndex) => (
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
                          {milestone.tasks.map(
                            (task, taskIndex) => (
                              <p
                                key={`${taskIndex}-${task}`}
                                className="flex items-start gap-2 text-[11px] leading-4.5 text-slate-500"
                              >
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                                {task}
                              </p>
                            ),
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ),
            )}
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
              {phase.project}
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

        <h3 className="text-sm font-black text-slate-950">
          {title}
        </h3>
      </div>

      <div className="mt-4 space-y-2.5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${index}-${item}`}
              className="flex items-start gap-2.5"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />

              <p className="text-xs leading-5 text-slate-600">
                {item}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500">
            Nothing was specified.
          </p>
        )}
      </div>
    </article>
  );
}