import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileWarning,
  Gauge as GaugeIcon,
  LayoutTemplate,
  ListChecks,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { CareerAnalysis } from "@/features/analyzer/types/careerAnalysis";

interface ATSReadinessProps {
  analysis: CareerAnalysis;
}

type MetricKey =
  | "structure"
  | "sectionClarity"
  | "keywordReadability"
  | "contentOrganization"
  | "formatting";

type Metric = {
  key: MetricKey;
  label: string;
  value: number;
  icon: typeof LayoutTemplate;
  problem: string;
  solution: string;
};

function clamp(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : 0;
}

function rounded(value: unknown): number {
  return Math.round(clamp(value));
}

function getStatus(score: number): {
  label: string;
  text: string;
  bg: string;
  border: string;
  ring: string;
  description: string;
  tone: "excellent" | "good" | "attention" | "improvement";
} {
  if (score >= 85) {
    return {
      label: "Excellent",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      ring: "rgb(236 253 245)",
      description:
        "Your resume is strongly prepared for automated parsing and screening.",
      tone: "excellent",
    };
  }

  if (score >= 70) {
    return {
      label: "Good",
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-100",
      ring: "rgb(255 251 235)",
      description:
        "Your resume has a workable ATS foundation with room for focused improvements.",
      tone: "good",
    };
  }

  if (score >= 50) {
    return {
      label: "Needs attention",
      text: "text-indigo-700",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      ring: "rgb(238 242 255)",
      description:
        "Several areas could make the resume easier for automated systems to interpret.",
      tone: "attention",
    };
  }

  return {
    label: "Needs improvement",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-100",
    ring: "rgb(255 241 242)",
    description:
      "Your resume has multiple ATS-readiness opportunities worth addressing before applying.",
    tone: "improvement",
  };
}

function getMetricStatus(score: number): ReturnType<typeof getStatus> {
  return getStatus(score);
}

function Gauge({ value }: { value: number }) {
  const score = rounded(value);
  const status = getStatus(score);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative mx-auto h-52 w-52 xs:h-56 xs:w-56 sm:h-64 sm:w-64"
      role="img"
      aria-label={`ATS readiness score ${score} out of 100`}
    >
      <svg
        viewBox="0 0 160 160"
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="ats-readiness-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="52%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={status.ring}
          strokeWidth="11"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#ats-readiness-gradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <circle
          cx="80"
          cy="80"
          r="42"
          fill="white"
          stroke="rgb(226 232 240)"
          strokeWidth="1"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-1.5">
          <GaugeIcon className={`h-4 w-4 ${status.text}`} strokeWidth={1.9} />
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
            ATS
          </span>
        </div>

        <p className="mt-1 text-[3.15rem] font-bold leading-none tracking-[-0.065em] text-slate-950 xs:text-[3.35rem]">
          {score}
        </p>

        <span
          className={`mt-2 rounded-full border px-3 py-1 text-[9px] font-bold ${status.bg} ${status.border} ${status.text}`}
        >
          {status.label}
        </span>

        <span className="mt-1 text-[8px] font-medium text-slate-400">
          out of 100
        </span>
      </div>
    </div>
  );
}

function MetricBar({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  const score = rounded(metric.value);
  const status = getMetricStatus(score);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_6px_22px_rgba(15,23,42,0.035)] sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${status.bg} ${status.text}`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold text-slate-800 sm:text-[11px]">
              {metric.label}
            </p>
            <p className={`mt-0.5 text-[8px] font-semibold ${status.text}`}>
              {status.label}
            </p>
          </div>
        </div>

        <span className={`text-sm font-bold ${status.text}`}>{score}</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-[width] duration-700 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="mt-1.5 flex justify-between text-[7px] font-medium text-slate-400">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

function DiagnosticCard({ metric }: { metric: Metric }) {
  const score = rounded(metric.value);
  const status = getMetricStatus(score);
  const healthy = score >= 70;

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_7px_24px_rgba(15,23,42,0.035)] sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${status.bg} ${status.text}`}
        >
          {healthy ? (
            <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={1.9} />
          ) : (
            <AlertTriangle className="h-4.5 w-4.5" strokeWidth={1.9} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[11px] font-bold text-slate-900 sm:text-xs">
              {metric.label}
            </h4>
            <span
              className={`rounded-full border px-2 py-0.5 text-[7px] font-bold uppercase tracking-wide ${status.bg} ${status.border} ${status.text}`}
            >
              {status.label} · {score}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="rounded-xl border border-rose-100/90 bg-rose-50/45 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-rose-500 shadow-sm">
                  <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.9} />
                </div>
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-rose-600">
                  Problem
                </p>
              </div>
              <p className="mt-2 text-[9px] leading-4.5 text-slate-600 sm:text-[10px] sm:leading-5">
                {healthy
                  ? "No significant ATS concern was flagged in this area by the current diagnostic."
                  : metric.problem}
              </p>
            </div>

            <div className="rounded-xl border border-indigo-100/90 bg-indigo-50/40 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                </div>
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-indigo-600">
                  Solution
                </p>
              </div>
              <p className="mt-2 text-[9px] leading-4.5 text-slate-600 sm:text-[10px] sm:leading-5">
                {metric.solution}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function normalizeIssue(issue: unknown): string {
  if (typeof issue === "string") return issue.trim();
  if (!issue || typeof issue !== "object") return "";

  const value = issue as Record<string, unknown>;
  const candidates = [
    value.message,
    value.description,
    value.issue,
    value.title,
    value.detail,
  ];

  const text = candidates.find(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  return text?.trim() ?? "";
}

export default function ATSReadiness({ analysis }: ATSReadinessProps) {
  const ats = analysis.localAnalysis?.ats;
  const [showIssues, setShowIssues] = useState(false);

  const metrics = useMemo<Metric[]>(
    () => [
      {
        key: "structure",
        label: "Resume structure",
        value: clamp(ats?.structureScore),
        icon: LayoutTemplate,
        problem:
          "The resume structure may make important information harder for automated parsers to identify consistently.",
        solution:
          "Use a simple one-column layout, standard section headings, consistent spacing, and avoid decorative elements that can interrupt parsing.",
      },
      {
        key: "sectionClarity",
        label: "Section clarity",
        value: clamp(ats?.sectionClarityScore),
        icon: FileCheck2,
        problem:
          "Some section organization may not be clear enough for an ATS to classify content reliably.",
        solution:
          "Use conventional headings such as Summary, Skills, Experience, Projects, Education, and Certifications, with each item placed under the correct section.",
      },
      {
        key: "keywordReadability",
        label: "Keyword readability",
        value: clamp(ats?.keywordReadabilityScore),
        icon: ScanSearch,
        problem:
          "Relevant role terminology may not be presented in a way that is easy for screening systems to detect.",
        solution:
          "Use exact role-relevant skill names naturally in your Skills, Projects, and Experience sections, especially for requirements supported by your background.",
      },
      {
        key: "contentOrganization",
        label: "Content organization",
        value: clamp(ats?.contentOrganizationScore),
        icon: Sparkles,
        problem:
          "Useful evidence may be harder to discover when achievements, skills, and experience are not presented with clear hierarchy.",
        solution:
          "Lead each project or experience entry with the most relevant evidence, use concise bullets, and keep related technologies close to the work they support.",
      },
      {
        key: "formatting",
        label: "Formatting",
        value: clamp(ats?.formattingScore),
        icon: FileWarning,
        problem:
          "Formatting choices may reduce reliable parsing even when the underlying content is relevant.",
        solution:
          "Prefer readable fonts, consistent dates, plain bullet points, predictable spacing, and minimal tables, columns, icons, or graphics.",
      },
    ],
    [
      ats?.structureScore,
      ats?.sectionClarityScore,
      ats?.keywordReadabilityScore,
      ats?.contentOrganizationScore,
      ats?.formattingScore,
    ],
  );

  const score = clamp(analysis.atsScore ?? ats?.score ?? 0);
  const roundedScore = rounded(score);
  const status = getStatus(roundedScore);
  const healthyCount = metrics.filter((item) => rounded(item.value) >= 70).length;
  const attentionCount = metrics.length - healthyCount;

  const issues = useMemo(() => {
    const source = Array.isArray(ats?.detectedIssues) ? ats.detectedIssues : [];
    return source.map(normalizeIssue).filter(Boolean);
  }, [ats?.detectedIssues]);

  const scoreRange = `${Math.min(...metrics.map((item) => rounded(item.value)))}–${Math.max(
    ...metrics.map((item) => rounded(item.value)),
  )}`;

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-white to-amber-50/35 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.055)] xs:p-5 sm:p-7 lg:p-8"
      aria-labelledby="ats-readiness-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-5rem] top-[-5rem] h-64 w-64 rounded-full bg-amber-100/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-5rem] left-1/3 h-60 w-60 rounded-full bg-indigo-100/25 blur-3xl"
      />

      <div className="relative">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
              <GaugeIcon className="h-5 w-5" strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h3
                id="ats-readiness-title"
                className="text-base font-bold tracking-[-0.025em] text-slate-950 sm:text-lg"
              >
                ATS Readiness
              </h3>
              <p className="mt-1 max-w-xl text-[10px] leading-4.5 text-slate-500 sm:text-[11px] sm:leading-5">
                A diagnostic view of how clearly your resume can be parsed,
                interpreted, and screened.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[8px] font-bold ${status.bg} ${status.border} ${status.text}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status.label}
          </span>
        </header>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-9">
          <div className="flex min-w-0 flex-col items-center">
            <Gauge value={score} />

            <div className="mt-4 w-full max-w-sm text-center">
              <p className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                {status.description}
              </p>
              <p className="mt-2 text-[9px] leading-4.5 text-slate-500 sm:text-[10px] sm:leading-5">
                Current diagnostic score: {score.toFixed(1)} / 100. The five
                supporting areas currently range from {scoreRange}.
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 xs:flex-row xs:items-end xs:justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Diagnostic profile
                </p>
                <p className="mt-1 text-lg font-bold tracking-[-0.035em] text-slate-950 sm:text-xl">
                  {healthyCount} of {metrics.length} areas look healthy
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 xs:w-auto">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-center">
                  <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                    Healthy
                  </p>
                  <p className="mt-0.5 text-base font-bold text-slate-950">
                    {healthyCount}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-center">
                  <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-amber-700">
                    Attention
                  </p>
                  <p className="mt-0.5 text-base font-bold text-slate-950">
                    {attentionCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {metrics.map((metric) => (
                <MetricBar key={metric.key} metric={metric} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-7">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ListChecks className="h-4.5 w-4.5" strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                Diagnostic results
              </p>
              <h4 className="mt-1 text-base font-bold tracking-[-0.025em] text-slate-950 sm:text-lg">
                Problems found — and how to fix them
              </h4>
              <p className="mt-1.5 max-w-2xl text-[9px] leading-4.5 text-slate-500 sm:text-[10px] sm:leading-5">
                Each item connects the measured ATS signal to a practical resume
                improvement. Healthy areas are intentionally kept concise so the
                report stays easy to scan on smaller screens.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {metrics.map((metric) => (
              <DiagnosticCard key={metric.key} metric={metric} />
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/65">
          <button
            type="button"
            onClick={() => setShowIssues((current) => !current)}
            className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset sm:px-5"
            aria-expanded={showIssues}
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-900 sm:text-[11px]">
                  Specific detected ATS issues
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[7px] font-bold text-slate-500">
                  {issues.length}
                </span>
              </span>
              <span className="mt-1 block text-[8px] leading-4 text-slate-500 sm:text-[9px]">
                View the exact issue signals returned by the local ATS analysis.
              </span>
            </span>

            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${showIssues ? "rotate-180" : ""}`}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </button>

          {showIssues && (
            <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
              {issues.length > 0 ? (
                <div className="space-y-2.5">
                  {issues.map((issue, index) => (
                    <div
                      key={`${issue}-${index}`}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[8px] font-bold text-amber-700">
                        {index + 1}
                      </span>
                      <p className="min-w-0 pt-0.5 text-[9px] leading-4.5 text-slate-600 sm:text-[10px] sm:leading-5">
                        {issue}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/55 p-3.5">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    strokeWidth={1.9}
                  />
                  <p className="text-[9px] leading-4.5 text-slate-600 sm:text-[10px] sm:leading-5">
                    No specific ATS issue text was returned by the current local
                    analysis.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-900 sm:text-[11px]">
                Best next move
              </p>
              <p className="mt-1 text-[9px] leading-4.5 text-slate-600 sm:text-[10px] sm:leading-5">
                {attentionCount > 0
                  ? "Start with the lowest-scoring diagnostic areas, then keep your strongest ATS signals intact."
                  : "Your diagnostic areas are currently healthy. Focus on preserving this structure while tailoring the resume to each target role."}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[8px] leading-4 text-slate-400 sm:text-[9px] sm:leading-4.5">
          ATS readiness is a diagnostic estimate. It does not guarantee how a
          specific employer&apos;s ATS will process your resume.
        </p>
      </div>
    </section>
  );
}
