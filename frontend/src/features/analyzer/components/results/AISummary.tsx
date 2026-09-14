import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Brain,
  CheckCircle2,
  CircleAlert,
  Sparkles,
} from "lucide-react";

import type { CareerAnalysis } from "@/features/analyzer/types/careerAnalysis";

interface AISummaryProps {
  analysis: CareerAnalysis;
}

function getMatchLabel(matchScore: number) {
  if (matchScore >= 85) return "Strong match";
  if (matchScore >= 70) return "Good match";
  if (matchScore >= 50) return "Partial match";
  return "Early-stage match";
}

function getMatchTone(matchScore: number) {
  if (matchScore >= 85) {
    return {
      badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    };
  }

  if (matchScore >= 70) {
    return {
      badge: "border-blue-100 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    };
  }

  if (matchScore >= 50) {
    return {
      badge: "border-amber-100 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    };
  }

  return {
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
  };
}

function getFocusMessage(matchScore: number) {
  if (matchScore >= 85) {
    return "Refine the remaining gaps and keep your strongest evidence easy to verify.";
  }

  if (matchScore >= 70) {
    return "Prioritize the most relevant gaps and strengthen the evidence already present in your resume.";
  }

  if (matchScore >= 50) {
    return "Address the highest-impact missing requirements and build stronger practical evidence before applying.";
  }

  return "Start with the highest-impact missing requirements and build evidence before making broader resume changes.";
}

function getGapSummary(analysis: CareerAnalysis) {
  const high = analysis.missingSkills.filter(
    (skill) => skill.importance === "high",
  ).length;
  const medium = analysis.missingSkills.filter(
    (skill) => skill.importance === "medium",
  ).length;

  return { high, medium };
}

function AISummary({ analysis }: AISummaryProps) {
  const role = analysis.role?.trim() || "target role";
  const matchScore = Number.isFinite(analysis.matchScore)
    ? Math.round(analysis.matchScore)
    : 0;

  const matchLabel = getMatchLabel(matchScore);
  const tone = getMatchTone(matchScore);
  const focusMessage = getFocusMessage(matchScore);
  const { high: highPriorityGaps, medium: mediumPriorityGaps } =
    getGapSummary(analysis);

  const strongSkills = analysis.skills
    .filter((skill) => skill.status === "strong")
    .slice(0, 3)
    .map((skill) => skill.name);

  const topGaps = [...analysis.missingSkills]
    .sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return (
        priority[a.importance] - priority[b.importance] ||
        a.name.localeCompare(b.name)
      );
    })
    .slice(0, 3);

  const hasStrengths = strongSkills.length > 0;
  const hasGaps = topGaps.length > 0;
  const hasAiSummary = Boolean(analysis.aiSummary?.trim());

  const strengthText = hasStrengths
    ? strongSkills.join(", ")
    : "the strongest evidence currently present in your resume";

  return (
    <motion.section
      aria-labelledby="ai-summary-heading"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 shadow-[0_10px_35px_rgba(79,70,229,0.05)]"
    >
      <div className="p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_6px_18px_rgba(79,70,229,0.14)]">
              <Brain
                className="h-4 w-4"
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h2
                id="ai-summary-heading"
                className="text-sm font-semibold tracking-tight text-slate-900"
              >
                AI Summary
              </h2>

              <p className="mt-0.5 text-[10px] leading-4 text-slate-400 sm:text-[11px]">
                A grounded interpretation of the analyzed resume and role.
              </p>
            </div>
          </div>

          <span
            className={[
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1",
              "text-[9px] font-bold uppercase tracking-[0.06em] sm:text-[10px]",
              tone.badge,
            ].join(" ")}
          >
            <span
              className={["h-1.5 w-1.5 rounded-full", tone.dot].join(" ")}
              aria-hidden="true"
            />
            {matchLabel}
          </span>
        </div>

        {/* Primary interpretation */}
        <div className="mt-5 rounded-xl border border-white/90 bg-white/80 p-4 shadow-[0_4px_16px_rgba(15,23,42,0.035)] backdrop-blur-sm sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
              <Sparkles
                className="h-3.5 w-3.5"
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm leading-6 tracking-[-0.01em] text-slate-700 sm:text-[15px] sm:leading-7">
                <span className="font-semibold text-slate-950">
                  {matchLabel}
                </span>{" "}
                for{" "}
                <span className="font-semibold text-slate-900">
                  {role}
                </span>
                .
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[15px] sm:leading-7">
                Your strongest advantage is{" "}
                <span className="font-medium text-slate-800">
                  {strengthText}
                </span>
                .
              </p>
            </div>
          </div>

          {/* Evidence signals */}
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
                <p className="text-[9px] font-bold uppercase tracking-[0.07em] text-slate-400">
                  Strongest signal
                </p>
              </div>

              <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-800">
                {hasStrengths
                  ? `${strongSkills.length} strong role-relevant skill${
                      strongSkills.length === 1 ? "" : "s"
                    }`
                  : "No strong skill signal identified yet"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center gap-2">
                <CircleAlert
                  className="h-3.5 w-3.5 shrink-0 text-amber-600"
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
                <p className="text-[9px] font-bold uppercase tracking-[0.07em] text-slate-400">
                  Biggest focus
                </p>
              </div>

              <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-800">
                {hasGaps
                  ? highPriorityGaps > 0
                    ? `${highPriorityGaps} high-priority gap${
                        highPriorityGaps === 1 ? "" : "s"
                      }`
                    : `${mediumPriorityGaps} gap${
                        mediumPriorityGaps === 1 ? "" : "s"
                      } to strengthen`
                  : "No missing skills identified"}
              </p>
            </div>
          </div>
        </div>

        {/* Priority interpretation */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white/75 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
              <ArrowUpRight
                className="h-3.5 w-3.5"
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                What to focus on next
              </p>

              <p className="mt-1.5 text-sm leading-6 text-slate-700 sm:text-[14px] sm:leading-6">
                {focusMessage}
              </p>
            </div>
          </div>

          {hasGaps ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {topGaps.map((gap) => (
                <span
                  key={gap.id}
                  className="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700"
                >
                  <span className="truncate">{gap.name}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* AI-generated detail */}
        {hasAiSummary ? (
          <div className="mt-4 rounded-xl border border-indigo-100/80 bg-indigo-50/45 px-4 py-3.5 sm:px-4.5">
            <div className="flex items-center gap-2">
              <Brain
                className="h-3.5 w-3.5 text-indigo-500"
                strokeWidth={1.9}
                aria-hidden="true"
              />

              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-indigo-500 sm:text-[9px]">
                Analysis insight
              </p>
            </div>

            <p className="mt-1.5 text-[10px] leading-5 text-slate-600 sm:text-[11px]">
              {analysis.aiSummary}
            </p>
          </div>
        ) : null}

        {/* Bottom-line disclaimer */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-[10px] leading-4 text-slate-500 sm:text-[11px] sm:leading-5">
            <span className="font-semibold text-indigo-600">
              Bottom line:
            </span>{" "}
            This analysis is a diagnostic estimate based on the resume and
            analyzed role requirements. It is not a hiring decision.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

export default AISummary;
