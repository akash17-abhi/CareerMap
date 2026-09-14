import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  FileText,
  Lightbulb,
  Target,
} from "lucide-react";

import type {
  CareerAnalysis,
  Improvement,
} from "@/features/analyzer/types/careerAnalysis";

interface ImprovementListProps {
  analysis?: CareerAnalysis | null;
  improvements?: Improvement[];
}

type Priority = Improvement["priority"];

function getPriorityMeta(priority: Priority) {
  if (priority === "high") {
    return {
      label: "High priority",
      shortLabel: "High",
      badge: "border-rose-100 bg-rose-50 text-rose-700",
      number: "bg-rose-50 text-rose-600",
      icon: "bg-rose-50 text-rose-600",
      accent: "from-rose-400 via-orange-400 to-indigo-500",
      panel: "border-rose-100 bg-rose-50/45",
    };
  }

  if (priority === "medium") {
    return {
      label: "Medium priority",
      shortLabel: "Medium",
      badge: "border-amber-100 bg-amber-50 text-amber-700",
      number: "bg-amber-50 text-amber-600",
      icon: "bg-amber-50 text-amber-600",
      accent: "from-amber-300 via-blue-400 to-indigo-500",
      panel: "border-amber-100 bg-amber-50/35",
    };
  }

  return {
    label: "Lower priority",
    shortLabel: "Low",
    badge: "border-slate-200 bg-slate-50 text-slate-600",
    number: "bg-slate-100 text-slate-600",
    icon: "bg-slate-100 text-slate-600",
    accent: "from-slate-300 via-indigo-300 to-violet-400",
    panel: "border-slate-200 bg-slate-50/60",
  };
}

function getImprovementIcon(index: number) {
  const icons = [Target, Lightbulb, FileText, CircleAlert];
  return icons[index % icons.length];
}

function sortImprovements(items: Improvement[]) {
  const rank: Record<string, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return [...items].sort(
    (a, b) =>
      (rank[String(a.priority).toLowerCase()] ?? 3) -
      (rank[String(b.priority).toLowerCase()] ?? 3),
  );
}

function ImprovementCard({
  improvement,
  index,
  expanded,
  onToggle,
}: {
  improvement: Improvement;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = getImprovementIcon(index);
  const priority = getPriorityMeta(improvement.priority);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index, 7) * 0.045,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_7px_24px_rgba(15,23,42,0.03)]"
    >
      <div className={`h-1 bg-gradient-to-r ${priority.accent}`} />

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-inset"
      >
        <div className="flex min-h-[76px] items-start gap-3 p-4 sm:items-center sm:px-5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[9px] font-bold ${priority.number}`}
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[7px] font-bold ${priority.badge}`}
              >
                {priority.label}
              </span>
            </div>

            <div className="mt-1.5 flex items-start gap-2">
              <Icon
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <h3 className="min-w-0 text-xs font-bold leading-5 text-slate-900 sm:text-sm">
                {improvement.title}
              </h3>
            </div>
          </div>

          <ChevronDown
            className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform sm:mt-0 ${
              expanded ? "rotate-180" : ""
            }`}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/45 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-white p-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <CircleAlert className="h-3.5 w-3.5" strokeWidth={1.8} />
                </div>
                <p className="text-[8px] font-bold uppercase tracking-[0.09em] text-rose-600">
                  Problem
                </p>
              </div>
              <p className="mt-2 text-[9px] leading-4.5 text-slate-600">
                {improvement.problem}
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
                  <Target className="h-3.5 w-3.5" strokeWidth={1.8} />
                </div>
                <p className="text-[8px] font-bold uppercase tracking-[0.09em] text-blue-600">
                  Why it matters
                </p>
              </div>
              <p className="mt-2 text-[9px] leading-4.5 text-slate-600">
                {improvement.whyItMatters}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/55 p-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-emerald-600 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                </div>
                <p className="text-[8px] font-bold uppercase tracking-[0.09em] text-emerald-700">
                  Solution
                </p>
              </div>
              <p className="mt-2 text-[9px] leading-4.5 text-slate-600">
                {improvement.action}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-3.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.09em] text-indigo-600">
              Recommended next action
            </p>
            <div className="mt-2 flex items-start gap-2.5">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <ArrowRight className="h-3 w-3" strokeWidth={1.9} />
              </div>
              <p className="text-[9px] leading-4.5 text-slate-600">
                {improvement.action}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.article>
  );
}

function ImprovementList({
  analysis,
  improvements: improvementsProp,
}: ImprovementListProps) {
  const improvements = useMemo(
    () =>
      sortImprovements(
        Array.isArray(improvementsProp)
          ? improvementsProp
          : analysis?.improvements ?? [],
      ),
    [analysis?.improvements, improvementsProp],
  );

  const [expandedId, setExpandedId] = useState<string | null>(
    improvements[0]?.id ?? null,
  );
  const [filter, setFilter] = useState<"all" | Priority>("all");
  const [showAll, setShowAll] = useState(false);

  const highCount = improvements.filter(
    (item) => item.priority === "high",
  ).length;
  const mediumCount = improvements.filter(
    (item) => item.priority === "medium",
  ).length;

  const filtered = useMemo(() => {
    const result =
      filter === "all"
        ? improvements
        : improvements.filter((item) => item.priority === filter);

    return showAll ? result : result.slice(0, 8);
  }, [filter, improvements, showAll]);

  if (improvements.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
            <Lightbulb className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-950 sm:text-lg">
              Recommended Improvements
            </h2>
            <p className="mt-1 text-[10px] leading-4.5 text-slate-400 sm:text-[11px]">
              Practical changes that can make your resume stronger for the
              target role.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-center sm:p-7">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
            <FileText className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <p className="mt-3 text-sm font-bold text-slate-900">
            No specific improvements were returned
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500 sm:text-[11px]">
            A more detailed job description can produce more targeted
            recommendations.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/30 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8"
      aria-labelledby="improvements-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-100/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-100/25 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              <Lightbulb className="h-5 w-5" strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h2
                id="improvements-title"
                className="text-base font-bold tracking-[-0.025em] text-slate-950 sm:text-lg"
              >
                Recommended Improvements
              </h2>
              <p className="mt-0.5 max-w-2xl text-[10px] leading-4.5 text-slate-400 sm:text-[11px]">
                Practical changes that can make your resume stronger for this
                specific target role.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[8px] font-bold text-blue-700">
            <Target className="h-3.5 w-3.5" strokeWidth={1.9} />
            {improvements.length} recommendation
            {improvements.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.025)]">
            <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-slate-400">
              Total
            </p>
            <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950">
              {improvements.length}
            </p>
            <p className="mt-1 text-[8px] leading-4 text-slate-400">
              Recommended actions from the analysis.
            </p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/45 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-rose-700">
              High priority
            </p>
            <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950">
              {highCount}
            </p>
            <p className="mt-1 text-[8px] leading-4 text-slate-500">
              Address these before lower-impact polish.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/45 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-amber-700">
              Medium priority
            </p>
            <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950">
              {mediumCount}
            </p>
            <p className="mt-1 text-[8px] leading-4 text-slate-500">
              Useful improvements after the highest-impact work.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/75 via-white to-violet-50/50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-indigo-100">
              <Target className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-indigo-700">
                Recommended approach
              </p>
              <p className="mt-1 text-xs font-bold tracking-tight text-slate-900">
                Fix the highest-impact issue, then work downward.
              </p>
              <p className="mt-1.5 text-[9px] leading-4.5 text-slate-500">
                Open a recommendation to see the problem, why it matters, and
                the concrete action suggested by the analyzer.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-blue-600">
                Action queue
              </p>
              <p className="mt-1 text-sm font-bold tracking-tight text-slate-900">
                Improve your resume step by step
              </p>
            </div>

            <div className="-mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 pb-1">
              {(
                [
                  ["all", "All"],
                  ["high", "High"],
                  ["medium", "Medium"],
                  ["low", "Low"],
                ] as const
              ).map(([value, label]) => {
                const active = filter === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setFilter(value);
                      setShowAll(false);
                    }}
                    className={`min-h-9 shrink-0 rounded-xl border px-3 text-[9px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                      active
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                    }`}
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-center">
              <p className="text-xs font-bold text-slate-800">
                No recommendations in this priority level
              </p>
              <p className="mt-1 text-[9px] leading-4.5 text-slate-500">
                Choose another filter to view the remaining recommendations.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filtered.map((improvement, index) => (
                <ImprovementCard
                  key={improvement.id}
                  improvement={improvement}
                  index={index}
                  expanded={expandedId === improvement.id}
                  onToggle={() =>
                    setExpandedId(
                      expandedId === improvement.id
                        ? null
                        : improvement.id,
                    )
                  }
                />
              ))}
            </div>
          )}

          {(
            filter === "all"
              ? improvements.length
              : improvements.filter((item) => item.priority === filter).length
          ) > 8 && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 shadow-[0_4px_14px_rgba(15,23,42,0.025)] hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {showAll
                ? "Show fewer recommendations"
                : `Show all ${
                    filter === "all"
                      ? improvements.length
                      : improvements.filter(
                          (item) => item.priority === filter,
                        ).length
                  } recommendations`}
            </button>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/45 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 ring-1 ring-emerald-100">
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.9} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-emerald-700">
                Keep it truthful
              </p>
              <p className="mt-1 text-xs font-bold tracking-tight text-slate-900">
                Improve the resume without inventing anything.
              </p>
              <p className="mt-1.5 text-[9px] leading-4.5 text-slate-500">
                These recommendations are grounded in the supplied resume and
                target job description. Never add a skill, experience, result,
                or achievement you cannot genuinely support.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 border-t border-slate-100 pt-5 text-center text-[8px] leading-4 text-slate-400 sm:text-[9px]">
          Recommendations are diagnostic guidance derived from the analyzer.
          They do not represent an employer decision.
        </p>
      </div>
    </section>
  );
}

export default ImprovementList;
