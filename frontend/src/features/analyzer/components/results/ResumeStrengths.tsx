import { useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import type { CareerAnalysis } from "@/features/analyzer/types/careerAnalysis";

interface ResumeStrengthsProps {
  analysis: CareerAnalysis;
}

type StrengthItem = {
  id: string;
  title: string;
  description: string;
  evidence: string;
  confidence: string;
};


function confidenceLabel(value: unknown): string {
  if (typeof value !== "string") return "Confidence available";
  const normalized = value.trim().toLowerCase();

  if (normalized === "high") return "High confidence";
  if (normalized === "medium") return "Medium confidence";
  if (normalized === "low") return "Low confidence";

  return value;
}

function strengthTone(confidence: string) {
  const normalized = confidence.toLowerCase();

  if (normalized.includes("high")) {
    return {
      icon: "bg-emerald-50 text-emerald-600",
      badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
      line: "from-emerald-400 via-blue-500 to-indigo-500",
    };
  }

  if (normalized.includes("medium")) {
    return {
      icon: "bg-indigo-50 text-indigo-600",
      badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
      line: "from-blue-400 via-indigo-500 to-violet-500",
    };
  }

  return {
    icon: "bg-slate-100 text-slate-600",
    badge: "border-slate-200 bg-slate-50 text-slate-600",
    line: "from-slate-300 via-indigo-400 to-violet-400",
  };
}

function normalizeStrengths(analysis: CareerAnalysis): StrengthItem[] {
  const source = Array.isArray(analysis.strengths) ? analysis.strengths : [];

  return source
    .map((item, index) => ({
      id:
        typeof item.id === "string" && item.id.trim()
          ? item.id
          : `strength-${index + 1}`,
      title:
        typeof item.title === "string" && item.title.trim()
          ? item.title.trim()
          : "Resume strength",
      description:
        typeof item.description === "string" && item.description.trim()
          ? item.description.trim()
          : "The local analysis identified this as a useful strength.",
      evidence:
        typeof item.evidence === "string" && item.evidence.trim()
          ? item.evidence.trim()
          : "Supported by evidence found in the analyzed resume.",
      confidence:
        typeof item.confidence === "string" && item.confidence.trim()
          ? confidenceLabel(item.confidence)
          : "Confidence available",
    }))
    .filter((item) => item.title.length > 0);
}

function inferStrengthSignal(
  title: string,
  description: string,
): {
  label: string;
  detail: string;
} {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes("project") ||
    text.includes("built") ||
    text.includes("develop")
  ) {
    return {
      label: "Practical evidence",
      detail: "This strength is supported by applied work or project evidence.",
    };
  }

  if (
    text.includes("skill") ||
    text.includes("technical") ||
    text.includes("technology")
  ) {
    return {
      label: "Technical foundation",
      detail: "This strength reflects a relevant technical capability.",
    };
  }

  if (
    text.includes("experience") ||
    text.includes("intern") ||
    text.includes("work")
  ) {
    return {
      label: "Experience evidence",
      detail: "This strength is supported by experience-related evidence.",
    };
  }

  return {
    label: "Profile evidence",
    detail: "This strength was identified from evidence in the analyzed resume.",
  };
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-center sm:p-7">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm">
        <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <p className="mt-3 text-sm font-bold text-slate-900">
        No resume strengths were returned
      </p>
      <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-slate-500 sm:text-[11px]">
        The current analysis did not produce structured strength signals.
        Re-run the analysis after reviewing the resume content.
      </p>
    </div>
  );
}

export default function ResumeStrengths({
  analysis,
}: ResumeStrengthsProps) {
  const strengths = useMemo(
    () => normalizeStrengths(analysis),
    [analysis],
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const strongSkillCount = useMemo(
    () =>
      Array.isArray(analysis.skills)
        ? analysis.skills.filter(
            (skill) => skill.status === "strong",
          ).length
        : 0,
    [analysis.skills],
  );

  const averageStrengthConfidence = useMemo(() => {
    if (!strengths.length) return "—";

    const highCount = strengths.filter((item) =>
      item.confidence.toLowerCase().includes("high"),
    ).length;

    const ratio = highCount / strengths.length;

    if (ratio >= 0.67) return "High";
    if (ratio >= 0.34) return "Moderate";
    return "Mixed";
  }, [strengths]);

  const primaryStrengths = strengths.slice(0, 3);

  return (
    <section
      className="
        relative overflow-hidden rounded-[2rem]
        border border-slate-200
        bg-gradient-to-br from-white via-white to-emerald-50/35
        p-4 shadow-[0_18px_55px_rgba(15,23,42,0.055)]
        sm:p-6 lg:p-8
      "
      aria-labelledby="resume-strengths-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-100/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-indigo-100/25 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                <Award className="h-5 w-5" strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <p
                  id="resume-strengths-title"
                  className="text-base font-bold tracking-[-0.025em] text-slate-950 sm:text-lg"
                >
                  Resume Strengths
                </p>
                <p className="mt-0.5 max-w-2xl text-[10px] leading-4.5 text-slate-400 sm:text-[11px]">
                  The strongest evidence signals your resume currently gives
                  for the target role.
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[8px] font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.9} />
            {strengths.length} strength{strengths.length === 1 ? "" : "s"} found
          </div>
        </div>

        {strengths.length === 0 ? (
          <div className="mt-6">
            <EmptyState />
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.025)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <span className="text-lg font-bold text-slate-950">
                    {strengths.length}
                  </span>
                </div>
                <p className="mt-3 text-[10px] font-bold text-slate-800">
                  Evidence-backed strengths
                </p>
                <p className="mt-1 text-[8px] leading-4 text-slate-400">
                  Structured strengths returned by the analyzer.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.025)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <TrendingUp className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <span className="text-lg font-bold text-slate-950">
                    {strongSkillCount}
                  </span>
                </div>
                <p className="mt-3 text-[10px] font-bold text-slate-800">
                  Strong skill signals
                </p>
                <p className="mt-1 text-[8px] leading-4 text-slate-400">
                  Skills currently marked strong by the local analysis.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.025)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <span className="text-lg font-bold text-slate-950">
                    {averageStrengthConfidence}
                  </span>
                </div>
                <p className="mt-3 text-[10px] font-bold text-slate-800">
                  Strength confidence
                </p>
                <p className="mt-1 text-[8px] leading-4 text-slate-400">
                  Based on the confidence labels attached to strength signals.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-indigo-600">
                    Top signals
                  </p>
                  <p className="mt-1 text-sm font-bold tracking-tight text-slate-900">
                    What your resume does best today
                  </p>
                </div>
                <p className="text-[8px] font-medium text-slate-400 sm:text-[9px]">
                  Based on local evidence
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                {primaryStrengths.map((strength, index) => {
                  const tone = strengthTone(strength.confidence);
                  const signal = inferStrengthSignal(
                    strength.title,
                    strength.description,
                  );

                  return (
                    <article
                      key={strength.id}
                      className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_7px_24px_rgba(15,23,42,0.03)]"
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.line}`}
                      />

                      <div className="flex items-start gap-3 pt-1">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
                        >
                          {index === 0 ? (
                            <Award
                              className="h-4 w-4"
                              strokeWidth={1.8}
                            />
                          ) : (
                            <Target
                              className="h-4 w-4"
                              strokeWidth={1.8}
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                              Strength {index + 1}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[7px] font-bold ${tone.badge}`}
                            >
                              {strength.confidence}
                            </span>
                          </div>
                          <h3 className="mt-1 text-sm font-bold leading-5 text-slate-900">
                            {strength.title}
                          </h3>
                        </div>
                      </div>

                      <p className="mt-3 text-[10px] leading-5 text-slate-500">
                        {strength.description}
                      </p>

                      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <div className="flex items-center gap-2">
                          <FileText
                            className="h-3.5 w-3.5 text-indigo-500"
                            strokeWidth={1.8}
                          />
                          <span className="text-[8px] font-bold uppercase tracking-[0.09em] text-slate-500">
                            {signal.label}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
                          {signal.detail}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {strengths.length > 3 && (
              <div className="mt-6">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">
                      Full strength evidence
                    </p>
                    <p className="mt-1 text-sm font-bold tracking-tight text-slate-900">
                      Inspect every identified strength
                    </p>
                  </div>

                  <span className="text-[8px] font-medium text-slate-400">
                    {strengths.length - 3} more
                  </span>
                </div>

                <div className="space-y-2.5">
                  {strengths.slice(3).map((strength) => {
                    const expanded = expandedId === strength.id;
                    const tone = strengthTone(strength.confidence);

                    return (
                      <div
                        key={strength.id}
                        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_5px_18px_rgba(15,23,42,0.025)]"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(
                              expanded ? null : strength.id,
                            )
                          }
                          aria-expanded={expanded}
                          className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-inset"
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
                          >
                            <CheckCircle2
                              className="h-4 w-4"
                              strokeWidth={1.8}
                            />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[10px] font-bold text-slate-800">
                              {strength.title}
                            </span>
                            <span className="mt-0.5 block truncate text-[8px] font-medium text-slate-400">
                              {strength.confidence}
                            </span>
                          </span>

                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                              expanded ? "rotate-180" : ""
                            }`}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </button>

                        {expanded && (
                          <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                            <p className="text-[9px] leading-4.5 text-slate-500">
                              {strength.description}
                            </p>
                            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                              <p className="text-[8px] font-bold uppercase tracking-[0.09em] text-slate-400">
                                Evidence
                              </p>
                              <p className="mt-1.5 text-[9px] leading-4.5 text-slate-600">
                                {strength.evidence}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_0.72fr]">
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/75 via-white to-blue-50/45 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2
                      className="h-4 w-4"
                      strokeWidth={1.9}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-emerald-700">
                      How to use these strengths
                    </p>
                    <p className="mt-1 text-xs font-bold tracking-tight text-slate-900">
                      Keep the strongest evidence visible.
                    </p>
                    <p className="mt-1.5 text-[9px] leading-4.5 text-slate-500">
                      Place your most relevant strengths close to the work,
                      projects, and outcomes that prove them. Strong evidence
                      is most useful when recruiters can see the connection
                      immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/45 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Target
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-indigo-700">
                      Next use
                    </p>
                    <p className="mt-1 text-xs font-bold tracking-tight text-slate-900">
                      Use strengths to frame your gaps.
                    </p>
                    <p className="mt-1.5 text-[9px] leading-4.5 text-slate-500">
                      Pair these proven strengths with the skills that need
                      stronger evidence in the rest of the report.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <p className="mt-6 border-t border-slate-100 pt-5 text-center text-[8px] leading-4 text-slate-400 sm:text-[9px]">
          Resume strengths are grounded in the evidence returned by the local
          analysis. They are diagnostic signals, not a hiring decision.
        </p>
      </div>
    </section>
  );
}
