import type { ReactNode } from "react";

import { motion } from "framer-motion";

import {
  CheckCircle2,
  Clock3,
  Code2,
  Hammer,
  Lightbulb,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

import type {
  GeneratedRoadmapPhase,
} from "../../types/roadmap";

import RoadmapStudyMaterials from "./RoadmapStudyMaterials";

interface RoadmapPhaseCardProps {
  phase: GeneratedRoadmapPhase;
  index?: number;
}

export default function RoadmapPhaseCard({
  phase,
  index = 0,
}: RoadmapPhaseCardProps) {
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
        ease: [0.22, 1, 0.36, 1],
      }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Phase header */}
      <header className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xs font-black text-white">
              {String(phase.phase).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                Phase {phase.phase}
              </p>

              <h3 className="mt-1 break-words text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                {phase.title}
              </h3>
            </div>
          </div>

          <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600">
            <Clock3 className="h-3.5 w-3.5" />
            {phase.duration}
          </span>
        </div>

        {phase.purpose ? (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            {phase.purpose}
          </p>
        ) : null}

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
      </header>

      {/* Phase content */}
      <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
        {/* Learn */}
        <StageCard
          number="01"
          label="Learn"
          icon={<Lightbulb className="h-4 w-4" />}
          tone="indigo"
          objective={phase.learn.objective}
        >
          {phase.learn.topics.length > 0 ? (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Topics
              </p>

              <div className="mt-2 space-y-2">
                {phase.learn.topics.map(
                  (topic, topicIndex) => (
                    <div
                      key={`${topicIndex}-${topic}`}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />

                      <p className="text-xs leading-5 text-slate-600">
                        {topic}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-4">
            <RoadmapStudyMaterials phase={phase} />
          </div>
        </StageCard>

        {/* Practice */}
        <StageCard
          number="02"
          label="Practice"
          icon={<Code2 className="h-4 w-4" />}
          tone="blue"
          objective={phase.practice.objective}
        >
          {phase.practice.activities.length > 0 ? (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Activities
              </p>

              <div className="mt-2 space-y-2">
                {phase.practice.activities.map(
                  (activity, activityIndex) => (
                    <div
                      key={`${activityIndex}-${activity}`}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />

                      <p className="text-xs leading-5 text-slate-600">
                        {activity}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}

          {phase.practice.success_criteria.length > 0 ? (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
              <div className="flex items-center gap-2">
                <ListChecks className="h-3.5 w-3.5 text-blue-600" />

                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  Success criteria
                </p>
              </div>

              <div className="mt-2 space-y-1.5">
                {phase.practice.success_criteria.map(
                  (criterion, criterionIndex) => (
                    <p
                      key={`${criterionIndex}-${criterion}`}
                      className="text-[11px] leading-4.5 text-slate-600"
                    >
                      • {criterion}
                    </p>
                  ),
                )}
              </div>
            </div>
          ) : null}
        </StageCard>

        {/* Build */}
        <StageCard
          number="03"
          label="Build"
          icon={<Hammer className="h-4 w-4" />}
          tone="violet"
          objective={phase.build.objective}
        >
          <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-600">
              Practical project
            </p>

            <p className="mt-2 break-words text-sm font-bold leading-5 text-violet-950">
              {phase.build.project}
            </p>
          </div>

          {phase.build.requirements.length > 0 ? (
            <div className="mt-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Requirements
              </p>

              <div className="mt-2 space-y-2">
                {phase.build.requirements.map(
                  (requirement, requirementIndex) => (
                    <div
                      key={`${requirementIndex}-${requirement}`}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />

                      <p className="text-xs leading-5 text-slate-600">
                        {requirement}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}

          {phase.build.deliverables.length > 0 ? (
            <div className="mt-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Deliverables
              </p>

              <div className="mt-2 space-y-2">
                {phase.build.deliverables.map(
                  (deliverable, deliverableIndex) => (
                    <div
                      key={`${deliverableIndex}-${deliverable}`}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />

                      <p className="text-xs leading-5 text-slate-600">
                        {deliverable}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}
        </StageCard>

        {/* Prove */}
        <StageCard
          number="04"
          label="Prove"
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="emerald"
          objective={phase.prove.objective}
        >
          {phase.prove.evidence.length > 0 ? (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Evidence
              </p>

              <div className="mt-2 space-y-2">
                {phase.prove.evidence.map(
                  (evidence, evidenceIndex) => (
                    <div
                      key={`${evidenceIndex}-${evidence}`}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

                      <p className="text-xs leading-5 text-slate-600">
                        {evidence}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}

          {phase.prove.portfolio_signal ? (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                Portfolio signal
              </p>

              <p className="mt-1.5 text-xs leading-5 text-emerald-950">
                {phase.prove.portfolio_signal}
              </p>
            </div>
          ) : null}
        </StageCard>

        {/* Milestones */}
        <section className="border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-slate-500" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Checkpoints
              </p>

              <h4 className="mt-0.5 text-sm font-black text-slate-900">
                Milestones
              </h4>
            </div>
          </div>

          {phase.milestones.length > 0 ? (
            <div className="mt-4 space-y-3">
              {phase.milestones.map(
                (milestone, milestoneIndex) => (
                  <div
                    key={`${milestoneIndex}-${milestone.title}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white text-[10px] font-black text-indigo-600 shadow-sm ring-1 ring-slate-200">
                        {milestoneIndex + 1}
                      </span>

                      <div className="min-w-0">
                        <h5 className="break-words text-sm font-bold text-slate-900">
                          {milestone.title}
                        </h5>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {milestone.outcome}
                        </p>

                        {milestone.tasks.length > 0 ? (
                          <div className="mt-3 space-y-1.5">
                            {milestone.tasks.map(
                              (task, taskIndex) => (
                                <div
                                  key={`${taskIndex}-${task}`}
                                  className="flex items-start gap-2"
                                >
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />

                                  <p className="text-[11px] leading-4.5 text-slate-500">
                                    {task}
                                  </p>
                                </div>
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
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-center">
              <p className="text-xs text-slate-500">
                No milestones were specified for this phase.
              </p>
            </div>
          )}
        </section>

        {/* Completion signal */}
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
    </motion.article>
  );
}

/* ─────────────────────────────────────────────
   STAGE CARD
───────────────────────────────────────────── */

function StageCard({
  number,
  label,
  icon,
  tone,
  objective,
  children,
}: {
  number: string;
  label: string;
  icon: ReactNode;
  tone: "indigo" | "blue" | "violet" | "emerald";
  objective: string;
  children: ReactNode;
}) {
  const styles = getStageStyles(tone);

  return (
    <section
      className={[
        "rounded-2xl border p-4 sm:p-5",
        styles.border,
        styles.background,
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white",
            styles.iconBackground,
          ].join(" ")}
        >
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={[
                "text-[9px] font-black tracking-[0.12em]",
                styles.text,
              ].join(" ")}
            >
              {number}
            </span>

            <p
              className={[
                "text-[10px] font-bold uppercase tracking-[0.16em]",
                styles.text,
              ].join(" ")}
            >
              {label}
            </p>
          </div>

          <p className="mt-1 text-sm font-bold leading-5 text-slate-900">
            {objective}
          </p>

          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   STAGE STYLES
───────────────────────────────────────────── */

function getStageStyles(
  tone: "indigo" | "blue" | "violet" | "emerald",
) {
  switch (tone) {
    case "indigo":
      return {
        border: "border-indigo-100",
        background: "bg-indigo-50/30",
        iconBackground: "bg-indigo-600",
        text: "text-indigo-700",
      };

    case "blue":
      return {
        border: "border-blue-100",
        background: "bg-blue-50/30",
        iconBackground: "bg-blue-600",
        text: "text-blue-700",
      };

    case "violet":
      return {
        border: "border-violet-100",
        background: "bg-violet-50/30",
        iconBackground: "bg-violet-600",
        text: "text-violet-700",
      };

    case "emerald":
      return {
        border: "border-emerald-100",
        background: "bg-emerald-50/30",
        iconBackground: "bg-emerald-600",
        text: "text-emerald-700",
      };

    default:
      return {
        border: "border-slate-200",
        background: "bg-slate-50",
        iconBackground: "bg-slate-600",
        text: "text-slate-700",
      };
  }
}