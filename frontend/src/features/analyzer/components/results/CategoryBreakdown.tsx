import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Target,
  TrendingUp,
} from "lucide-react";

import type { CareerAnalysis } from "@/features/analyzer/types/careerAnalysis";

interface CategoryBreakdownProps {
  analysis: CareerAnalysis;
}

interface CategoryItem {
  id: string;
  name: string;
  score: number;
  description: string;
  icon: typeof BarChart3;
  weight: number;
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getStatus(score: number) {
  if (score >= 85) {
    return {
      label: "Strong",
      textClass: "text-emerald-700",
      barClass: "bg-emerald-500",
      trackClass: "bg-emerald-50",
      iconClass: "text-emerald-600",
      borderClass: "border-emerald-100",
    };
  }

  if (score >= 70) {
    return {
      label: "Good",
      textClass: "text-blue-700",
      barClass: "bg-blue-500",
      trackClass: "bg-blue-50",
      iconClass: "text-blue-600",
      borderClass: "border-blue-100",
    };
  }

  if (score >= 50) {
    return {
      label: "Partial",
      textClass: "text-amber-700",
      barClass: "bg-amber-500",
      trackClass: "bg-amber-50",
      iconClass: "text-amber-600",
      borderClass: "border-amber-100",
    };
  }

  return {
    label: "Needs attention",
    textClass: "text-rose-700",
    barClass: "bg-rose-500",
    trackClass: "bg-rose-50",
    iconClass: "text-rose-600",
    borderClass: "border-rose-100",
  };
}

function getGapMessage(score: number, name: string) {
  if (score >= 85) {
    return `${name} is currently one of the strongest signals in your role-fit analysis.`;
  }

  if (score >= 70) {
    return `${name} is in a healthy range, with room for targeted refinement.`;
  }

  if (score >= 50) {
    return `${name} shows some alignment, but stronger evidence or development could improve the result.`;
  }

  return `${name} is currently the biggest scoring opportunity and deserves focused attention.`;
}

export default function CategoryBreakdown({
  analysis,
}: CategoryBreakdownProps) {
  const categories: CategoryItem[] = [
    {
      id: "skills",
      name: "Skills Match",
      score: clampScore(analysis.skillsMatchScore),
      description:
        "How closely your current role-relevant skills align with the job requirements.",
      icon: Target,
      weight: 0.4,
    },
    {
      id: "keywords",
      name: "Keyword Match",
      score: clampScore(analysis.keywordMatchScore),
      description:
        "How well the important terminology from the job description appears in your resume.",
      icon: BarChart3,
      weight: 0.2,
    },
    {
      id: "experience",
      name: "Experience Match",
      score: clampScore(analysis.experienceMatchScore),
      description:
        "How closely your demonstrated experience aligns with the role expectations.",
      icon: TrendingUp,
      weight: 0.2,
    },
    {
      id: "education",
      name: "Education Match",
      score: clampScore(analysis.educationMatchScore),
      description:
        "How well your education background aligns with the role requirements.",
      icon: CheckCircle2,
      weight: 0.1,
    },
    {
      id: "semantic",
      name: "Semantic Similarity",
      score: clampScore(analysis.semanticSimilarityScore),
      description:
        "How closely the meaning of your resume aligns with the job description.",
      icon: BarChart3,
      weight: 0.1,
    },
  ];

  const overallScore = clampScore(analysis.matchScore);

  const strongestCategory = [...categories].sort(
    (a, b) => b.score - a.score,
  )[0];

  const weakestCategory = [...categories].sort(
    (a, b) => a.score - b.score,
  )[0];

  const strongCount = categories.filter(
    (category) => category.score >= 85,
  ).length;

  const attentionCount = categories.filter(
    (category) => category.score < 50,
  ).length;

  const totalWeight = categories.reduce(
    (sum, category) => sum + category.weight,
    0,
  );

  const weightedSignal = totalWeight
    ? Math.round(
        categories.reduce(
          (sum, category) => sum + category.score * category.weight,
          0,
        ) / totalWeight,
      )
    : overallScore;

  return (
    <motion.section
      aria-labelledby="category-breakdown-title"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)]"
    >
      <div className="p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <BarChart3
                className="h-4 w-4"
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Detailed scoring
              </p>

              <h2
                id="category-breakdown-title"
                className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-slate-950 sm:text-xl"
              >
                Analysis Breakdown
              </h2>

              <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-[11px] sm:leading-5">
                See exactly how each deterministic role-fit signal contributes
                to your result.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:shrink-0">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Role fit
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-950 sm:text-xl">
                {overallScore}%
              </p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-right">
              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-indigo-500">
                Signal view
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-indigo-700 sm:text-xl">
                {weightedSignal}
              </p>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4">
          <div className="flex items-start gap-2.5">
            <CircleAlert
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500"
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                How this score works
              </p>

              <p className="mt-1 text-[10px] leading-5 text-slate-600 sm:text-[11px]">
                The role-fit score is the authoritative overall result.
                These five signals show the underlying components and their
                starting weights: Skills 40%, Keywords 20%, Experience 20%,
                Education 10%, and Semantic Similarity 10%.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic score bars */}
        <div className="mt-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-950">
                Score by signal
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
                Bar length and status update directly from the analysis.
              </p>
            </div>

            <span className="hidden text-[9px] font-medium text-slate-400 sm:block">
              0–100
            </span>
          </div>

          <div className="space-y-4">
            {categories.map((category, index) => {
              const status = getStatus(category.score);
              const Icon = category.icon;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.05 + index * 0.04,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        "bg-white",
                        status.borderClass,
                      ].join(" ")}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 ${status.iconClass}`}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-[11px] font-bold text-slate-800 sm:text-xs">
                              {category.name}
                            </p>

                            <span
                              className={[
                                "rounded-full border px-1.5 py-0.5",
                                "text-[7px] font-bold uppercase tracking-[0.05em]",
                                status.borderClass,
                                status.trackClass,
                                status.textClass,
                              ].join(" ")}
                            >
                              {status.label}
                            </span>
                          </div>

                          <p className="mt-1 text-[9px] leading-4 text-slate-400 sm:text-[10px]">
                            {category.description}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={[
                              "text-sm font-bold tabular-nums sm:text-base",
                              status.textClass,
                            ].join(" ")}
                          >
                            {category.score}
                          </p>
                          <p className="text-[7px] font-medium text-slate-400">
                            {Math.round(category.weight * 100)}% weight
                          </p>
                        </div>
                      </div>

                      <div
                        className={[
                          "mt-2 h-2 overflow-hidden rounded-full ring-1 ring-inset ring-slate-200/60",
                          status.trackClass,
                        ].join(" ")}
                        role="progressbar"
                        aria-label={`${category.name} score`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={category.score}
                      >
                        <div
                          className={[
                            "h-full rounded-full transition-[width] duration-700 ease-out",
                            status.barClass,
                          ].join(" ")}
                          style={{
                            width: `${category.score}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Interpretation */}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/45 p-3.5">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className="h-3.5 w-3.5 text-emerald-600"
                strokeWidth={1.9}
                aria-hidden="true"
              />
              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                Strongest signal
              </p>
            </div>

            <p className="mt-1.5 text-xs font-bold text-slate-800">
              {strongestCategory.name} · {strongestCategory.score}
            </p>

            <p className="mt-1 text-[9px] leading-4 text-slate-500">
              {getGapMessage(
                strongestCategory.score,
                strongestCategory.name,
              )}
            </p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/45 p-3.5">
            <div className="flex items-center gap-2">
              <CircleAlert
                className="h-3.5 w-3.5 text-amber-600"
                strokeWidth={1.9}
                aria-hidden="true"
              />
              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-amber-700">
                Biggest opportunity
              </p>
            </div>

            <p className="mt-1.5 text-xs font-bold text-slate-800">
              {weakestCategory.name} · {weakestCategory.score}
            </p>

            <p className="mt-1 text-[9px] leading-4 text-slate-500">
              {getGapMessage(
                weakestCategory.score,
                weakestCategory.name,
              )}
            </p>
          </div>
        </div>

        {/* Skill context */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Strong
            </p>
            <p className="mt-1 text-base font-bold text-slate-950">
              {analysis.skills.filter(
                (skill) => skill.status === "strong",
              ).length}
            </p>
            <p className="mt-0.5 text-[8px] text-slate-400">
              skill signals
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Partial
            </p>
            <p className="mt-1 text-base font-bold text-slate-950">
              {analysis.skills.filter(
                (skill) => skill.status === "partial",
              ).length}
            </p>
            <p className="mt-0.5 text-[8px] text-slate-400">
              need evidence
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Missing
            </p>
            <p className="mt-1 text-base font-bold text-slate-950">
              {analysis.skills.filter(
                (skill) => skill.status === "missing",
              ).length}
            </p>
            <p className="mt-0.5 text-[8px] text-slate-400">
              need attention
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/35 p-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-indigo-600">
            Practical takeaway
          </p>

          <p className="mt-1 text-[9px] leading-4 text-slate-600 sm:text-[10px] sm:leading-5">
            {attentionCount > 0
              ? `${attentionCount} scoring signal${
                  attentionCount === 1 ? "" : "s"
                } currently fall below 50. Start with the lowest area, then work upward through the evidence and improvement recommendations.`
              : strongCount > 0
                ? `${strongCount} of the five core signals are already strong. Focus on the remaining areas without weakening the evidence that is already working.`
                : "Use the lowest-scoring signals as your starting point and review the supporting evidence before making broader changes."}
          </p>
        </div>

        <p className="mt-3 text-[8px] leading-4 text-slate-400 sm:text-[9px]">
          The score values above come from the deterministic analysis. They
          are diagnostic estimates based on your resume and the target job
          description, not employer hiring decisions.
        </p>
      </div>
    </motion.section>
  );
}
