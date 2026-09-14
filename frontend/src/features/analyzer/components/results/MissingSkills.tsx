import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { CareerAnalysis } from "@/features/analyzer/types/careerAnalysis";

interface MissingSkillsProps {
  missingSkills: CareerAnalysis["missingSkills"];
}

type Gap = CareerAnalysis["missingSkills"][number];

function priorityMeta(value: unknown) {
  const p = typeof value === "string" ? value.toLowerCase() : "medium";
  if (p === "high") {
    return {
      label: "High priority",
      badge: "border-rose-100 bg-rose-50 text-rose-700",
      icon: "bg-rose-50 text-rose-600",
    };
  }
  if (p === "low") {
    return {
      label: "Low priority",
      badge: "border-slate-200 bg-slate-50 text-slate-600",
      icon: "bg-slate-100 text-slate-600",
    };
  }
  return {
    label: "Medium priority",
    badge: "border-amber-100 bg-amber-50 text-amber-700",
    icon: "bg-amber-50 text-amber-600",
  };
}

function gapStatus(gap: Gap) {
  const text = `${gap.reason ?? ""} ${gap.action ?? ""}`.toLowerCase();
  return text.includes("partial") || text.includes("partially")
    ? {
        label: "Partial support",
        badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
      }
    : {
        label: "Needs support",
        badge: "border-rose-100 bg-rose-50 text-rose-700",
      };
}

export default function MissingSkills({
  missingSkills,
}: MissingSkillsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const gaps = useMemo(() => {
    const items = Array.isArray(missingSkills) ? [...missingSkills] : [];
    const rank: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return items.sort(
      (a, b) =>
        (rank[String(a.importance).toLowerCase()] ?? 1) -
        (rank[String(b.importance).toLowerCase()] ?? 1),
    );
  }, [missingSkills]);

  const high = gaps.filter(
    (item) => String(item.importance).toLowerCase() === "high",
  ).length;
  const medium = gaps.filter(
    (item) => String(item.importance).toLowerCase() === "medium",
  ).length;
  const visible = showAll ? gaps : gaps.slice(0, 8);

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-white to-rose-50/25 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8"
      aria-labelledby="missing-skills-title"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-100/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-indigo-100/25 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
              <CircleAlert className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p id="missing-skills-title" className="text-base font-bold tracking-[-0.025em] text-slate-950 sm:text-lg">
                Missing & Weak Skills
              </p>
              <p className="mt-0.5 max-w-2xl text-[10px] leading-4.5 text-slate-400 sm:text-[11px]">
                Skills that need stronger evidence or development for the target role.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[8px] font-bold text-rose-700">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.9} />
            {gaps.length} gap{gaps.length === 1 ? "" : "s"} found
          </div>
        </div>

        {gaps.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-center sm:p-7">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <CheckCircle2 className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-900">No weak or missing skills were returned</p>
            <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500 sm:text-[11px]">
              The current analysis did not identify a skill gap that needs to be shown here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {([
                {
                  label: "Total gaps",
                  value: gaps.length,
                  tone: "bg-rose-50 text-rose-600",
                  Icon: CircleAlert,
                },
                {
                  label: "High priority",
                  value: high,
                  tone: "bg-amber-50 text-amber-600",
                  Icon: ArrowUpRight,
                },
                {
                  label: "Medium priority",
                  value: medium,
                  tone: "bg-indigo-50 text-indigo-600",
                  Icon: Target,
                },
              ] satisfies Array<{
                label: string;
                value: number;
                tone: string;
                Icon: LucideIcon;
              }>).map(({ label, value, tone, Icon }) => (
                <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.025)]">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone}`}>
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <p className="mt-3 text-[10px] font-bold text-slate-800">{label}</p>
                  <p className="mt-3 text-2xl font-bold tracking-[-0.04em] text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/75 via-white to-violet-50/55 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-indigo-100">
                  <BookOpen className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-indigo-700">How to read this</p>
                  <p className="mt-1 text-xs font-bold tracking-tight text-slate-900">A weak skill is not always a missing skill.</p>
                  <p className="mt-1.5 text-[9px] leading-4.5 text-slate-500">
                    Partial gaps mean some support exists but the resume does not yet demonstrate enough depth. Missing gaps mean the analyzer found no reliable supporting evidence.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-rose-600">Priority queue</p>
                  <p className="mt-1 text-sm font-bold tracking-tight text-slate-900">Start with the gaps that matter most</p>
                </div>
                <span className="text-[8px] font-medium text-slate-400">
                  {visible.length} of {gaps.length} shown
                </span>
              </div>

              <div className="space-y-3">
                {visible.map((gap, index) => {
                  const expanded = expandedId === gap.id;
                  const priority = priorityMeta(gap.importance);
                  const status = gapStatus(gap);

                  return (
                    <article key={gap.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_7px_24px_rgba(15,23,42,0.03)]">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setExpandedId(expanded ? null : gap.id)}
                        className="flex min-h-16 w-full items-start gap-3 px-4 py-3.5 text-left focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-inset sm:items-center"
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${priority.icon}`}>
                          {gap.importance === "high" ? <ArrowUpRight className="h-4 w-4" strokeWidth={1.9} /> : <Target className="h-4 w-4" strokeWidth={1.8} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[8px] font-bold uppercase tracking-[0.09em] text-slate-400">#{index + 1}</span>
                            <span className={`rounded-full border px-2 py-0.5 text-[7px] font-bold ${priority.badge}`}>
                              {priority.label}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                            <h3 className="truncate text-xs font-bold text-slate-900 sm:text-sm">{gap.name}</h3>
                            <span className={`w-fit rounded-full border px-2 py-0.5 text-[7px] font-bold ${status.badge}`}>{status.label}</span>
                          </div>
                        </div>

                        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform sm:mt-0 ${expanded ? "rotate-180" : ""}`} strokeWidth={1.8} />
                      </button>

                      {expanded && (
                        <div className="border-t border-slate-100 bg-slate-50/45 px-4 pb-4 pt-3">
                          <div className="grid gap-3 lg:grid-cols-2">
                            <div className="rounded-xl border border-slate-100 bg-white p-3">
                              <p className="text-[8px] font-bold uppercase tracking-[0.09em] text-rose-600">Problem</p>
                              <p className="mt-1.5 text-[9px] leading-4.5 text-slate-600">{gap.reason}</p>
                            </div>
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/55 p-3">
                              <p className="text-[8px] font-bold uppercase tracking-[0.09em] text-emerald-700">Solution</p>
                              <p className="mt-1.5 text-[9px] leading-4.5 text-slate-600">{gap.action}</p>
                            </div>
                          </div>

                          {gap.evidenceSummary && (
                            <div className="mt-3 rounded-xl border border-slate-100 bg-white p-3">
                              <p className="text-[8px] font-bold uppercase tracking-[0.09em] text-slate-400">Existing evidence</p>
                              <p className="mt-1.5 break-words text-[9px] leading-4.5 text-slate-600">{gap.evidenceSummary}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {gaps.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAll((value) => !value)}
                  className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 shadow-[0_4px_14px_rgba(15,23,42,0.025)] hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {showAll ? "Show fewer gaps" : `Show all ${gaps.length} gaps`}
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/45 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-rose-700">Priority rule</p>
                <p className="mt-1 text-xs font-bold tracking-tight text-slate-900">Fix required gaps first.</p>
                <p className="mt-1.5 text-[9px] leading-4.5 text-slate-500">Required gaps have a more direct effect on role alignment than lower-priority gaps.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/45 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-emerald-700">Evidence rule</p>
                <p className="mt-1 text-xs font-bold tracking-tight text-slate-900">Turn partial skills into proof.</p>
                <p className="mt-1.5 text-[9px] leading-4.5 text-slate-500">Use projects, internship work, measurable implementations, or specific resume bullets to strengthen partial support.</p>
              </div>
            </div>
          </>
        )}

        <p className="mt-6 border-t border-slate-100 pt-5 text-center text-[8px] leading-4 text-slate-400 sm:text-[9px]">
          Skill gaps are grounded in the local analyzer. A missing or weak signal means insufficient resume evidence for the analyzed role; it does not prove that you cannot perform the skill.
        </p>
      </div>
    </section>
  );
}
