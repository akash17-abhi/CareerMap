import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Target,
} from "lucide-react";

import type { CareerAnalysis } from "@/features/analyzer/types/careerAnalysis";

interface MatchOverviewProps {
  analysis?: CareerAnalysis | null;
  score?: number;
  role?: string;
  skillsScore?: number;
}

type MatchLevel = "strong" | "good" | "partial" | "needs-improvement";

interface MatchTheme {
  label: string;
  description: string;
  badgeClass: string;
  scoreClass: string;
  accentClass: string;
  subtleClass: string;
  iconClass: string;
}

interface Metric {
  label: string;
  value: number;
  weight?: number;
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getMatchLevel(score: number): MatchLevel {
  if (score >= 85) return "strong";
  if (score >= 70) return "good";
  if (score >= 50) return "partial";
  return "needs-improvement";
}

function getMatchTheme(level: MatchLevel): MatchTheme {
  switch (level) {
    case "strong":
      return {
        label: "Strong match",
        description:
          "Your profile is well aligned with this role. Focus on refining the remaining gaps and keeping your strongest evidence easy to verify.",
        badgeClass:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        scoreClass: "text-emerald-700",
        accentClass: "bg-emerald-500",
        subtleClass: "bg-emerald-50/55",
        iconClass: "text-emerald-600",
      };

    case "good":
      return {
        label: "Good match",
        description:
          "Your profile covers many important requirements. A focused set of improvements can make the application stronger.",
        badgeClass:
          "border-blue-200 bg-blue-50 text-blue-700",
        scoreClass: "text-blue-700",
        accentClass: "bg-blue-500",
        subtleClass: "bg-blue-50/55",
        iconClass: "text-blue-600",
      };

    case "partial":
      return {
        label: "Partial match",
        description:
          "Your profile shows useful alignment, but some important requirements still need stronger evidence or development.",
        badgeClass:
          "border-amber-200 bg-amber-50 text-amber-700",
        scoreClass: "text-amber-700",
        accentClass: "bg-amber-500",
        subtleClass: "bg-amber-50/55",
        iconClass: "text-amber-600",
      };

    default:
      return {
        label: "Needs improvement",
        description:
          "Your current profile has limited alignment with this role. Start with the highest-impact gaps before applying.",
        badgeClass:
          "border-slate-200 bg-slate-100 text-slate-700",
        scoreClass: "text-slate-700",
        accentClass: "bg-slate-500",
        subtleClass: "bg-slate-50",
        iconClass: "text-slate-600",
      };
  }
}

function getMetricTone(value: number) {
  if (value >= 80) {
    return {
      label: "Strong",
      text: "text-emerald-700",
      bar: "bg-emerald-500",
      track: "bg-emerald-50",
    };
  }

  if (value >= 60) {
    return {
      label: "Good",
      text: "text-blue-700",
      bar: "bg-blue-500",
      track: "bg-blue-50",
    };
  }

  if (value >= 40) {
    return {
      label: "Partial",
      text: "text-amber-700",
      bar: "bg-amber-500",
      track: "bg-amber-50",
    };
  }

  return {
    label: "Needs work",
    text: "text-rose-700",
    bar: "bg-rose-500",
    track: "bg-rose-50",
  };
}

function getScoreRingBackground(score: number) {
  const safe = clamp(score);

  if (safe >= 85) {
    return `conic-gradient(rgb(16 185 129) ${safe}%, rgb(226 232 240) ${safe}% 100%)`;
  }

  if (safe >= 70) {
    return `conic-gradient(rgb(59 130 246) ${safe}%, rgb(226 232 240) ${safe}% 100%)`;
  }

  if (safe >= 50) {
    return `conic-gradient(rgb(245 158 11) ${safe}%, rgb(226 232 240) ${safe}% 100%)`;
  }

  return `conic-gradient(rgb(100 116 139) ${safe}%, rgb(226 232 240) ${safe}% 100%)`;
}

function MetricBar({ metric }: { metric: Metric }) {
  const value = clamp(metric.value);
  const tone = getMetricTone(value);

  return (
    <div className="group">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-slate-700 sm:text-xs">
            {metric.label}
          </p>

          {typeof metric.weight === "number" ? (
            <p className="mt-0.5 text-[8px] font-medium text-slate-400">
              Weight {Math.round(metric.weight * 100)}%
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={[
              "hidden text-[8px] font-semibold sm:inline",
              tone.text,
            ].join(" ")}
          >
            {tone.label}
          </span>

          <span className="text-xs font-bold tabular-nums text-slate-900">
            {value}
          </span>
        </div>
      </div>

      <div
        className={[
          "mt-1.5 h-2 overflow-hidden rounded-full ring-1 ring-inset ring-slate-200/60",
          tone.track,
        ].join(" ")}
        aria-hidden="true"
      >
        <div
          className={[
            "h-full rounded-full transition-[width] duration-700 ease-out",
            tone.bar,
          ].join(" ")}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function MatchOverview({
  analysis,
  score,
  role,
  skillsScore,
}: MatchOverviewProps) {
  const rawMatchScore = analysis?.matchScore ?? score ?? 0;
  const matchScore = clamp(rawMatchScore);

  const targetRole =
    analysis?.role?.trim() ||
    role?.trim() ||
    "Target role";

  const currentSkillsScore = clamp(
    analysis?.skillsMatchScore ?? skillsScore ?? 0,
  );

  const currentKeywordScore = clamp(
    analysis?.keywordMatchScore ?? 0,
  );

  const currentExperienceScore = clamp(
    analysis?.experienceMatchScore ?? 0,
  );

  const currentEducationScore = clamp(
    analysis?.educationMatchScore ?? 0,
  );

  const currentSemanticScore = clamp(
    analysis?.semanticSimilarityScore ?? 0,
  );

  const matchLevel = getMatchLevel(matchScore);
  const theme = getMatchTheme(matchLevel);

  const metrics: Metric[] = [
    {
      label: "Skills match",
      value: currentSkillsScore,
      weight: 0.4,
    },
    {
      label: "Keyword match",
      value: currentKeywordScore,
      weight: 0.2,
    },
    {
      label: "Experience match",
      value: currentExperienceScore,
      weight: 0.2,
    },
    {
      label: "Education match",
      value: currentEducationScore,
      weight: 0.1,
    },
    {
      label: "Semantic similarity",
      value: currentSemanticScore,
      weight: 0.1,
    },
  ];

  const strongestMetric =
    [...metrics].sort((a, b) => b.value - a.value)[0] ?? null;

  const weakestMetric =
    [...metrics].sort((a, b) => a.value - b.value)[0] ?? null;

  const scoreRingBackground = getScoreRingBackground(matchScore);

  return (
    <motion.section
      aria-labelledby="match-overview-title"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.045)]"
    >
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-0.5 ${theme.accentClass}`}
      />

      <div className="p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 sm:text-[10px]">
              Match overview
            </p>

            <h2
              id="match-overview-title"
              className="mt-1 text-[19px] font-bold tracking-[-0.03em] text-slate-950 sm:text-xl"
            >
              Your role fit at a glance
            </h2>

            <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-600">
              <Target
                className="h-3 w-3 shrink-0 text-slate-400"
                strokeWidth={1.9}
                aria-hidden="true"
              />
              <span className="truncate">{targetRole}</span>
            </div>
          </div>

          <span
            className={[
              "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1",
              "text-[9px] font-bold uppercase tracking-[0.06em] sm:text-[10px]",
              theme.badgeClass,
            ].join(" ")}
          >
            {matchLevel === "needs-improvement" ? (
              <CircleAlert
                className="h-3 w-3"
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="h-3 w-3"
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
            {theme.label}
          </span>
        </div>

        {/* Main fit */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(230px,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-8">
          {/* Score block */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className="relative h-[112px] w-[112px] shrink-0 rounded-full p-[6px] sm:h-32 sm:w-32"
              style={{
                background: scoreRingBackground,
              }}
              role="img"
              aria-label={`Role fit score ${matchScore} percent`}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full border border-slate-100 bg-white">
                <div className="text-center">
                  <p
                    className={[
                      "text-[38px] font-bold leading-none tracking-[-0.065em] sm:text-[42px]",
                      theme.scoreClass,
                    ].join(" ")}
                  >
                    {matchScore}%
                  </p>

                  <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    role fit
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950 sm:text-[15px]">
                {theme.label}
              </p>

              <p className="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-5">
                {theme.description}
              </p>
            </div>
          </div>

          {/* Dynamic signal bars */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/65 p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Fit signals
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Actual analysis results
                </p>
              </div>

              {strongestMetric ? (
                <span className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-700 sm:inline-flex">
                  Strongest: {strongestMetric.label}
                </span>
              ) : null}
            </div>

            <div className="mt-4 space-y-3.5">
              {metrics.map((metric) => (
                <MetricBar key={metric.label} metric={metric} />
              ))}
            </div>
          </div>
        </div>

        {/* Compact diagnostic summary */}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Strongest signal
            </p>

            <p className="mt-1.5 text-xs font-bold text-slate-900">
              {strongestMetric
                ? `${strongestMetric.label} · ${strongestMetric.value}`
                : "No signal available"}
            </p>

            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              The highest scoring component in the current role-fit analysis.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Needs attention
            </p>

            <p className="mt-1.5 text-xs font-bold text-slate-900">
              {weakestMetric
                ? `${weakestMetric.label} · ${weakestMetric.value}`
                : "No signal available"}
            </p>

            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              Start here when deciding which area deserves the most attention.
            </p>
          </div>
        </div>

        {/* Diagnostic explanation */}
        <div
          className={[
            "mt-4 rounded-xl border border-slate-200 p-3.5 sm:p-4",
            theme.subtleClass,
          ].join(" ")}
        >
          <div className="flex items-start gap-2.5">
            <ArrowUpRight
              className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${theme.iconClass}`}
              strokeWidth={2}
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                How to read this
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-600 sm:text-[11px] sm:leading-5">
                The role-fit score is a diagnostic estimate based on the
                analyzed resume and job description. Each bar uses its actual
                local analysis value, so the visual changes with the results.
                It is not a hiring decision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}