import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  FileEdit,
  FileText,
  LockKeyhole,
  Sparkles,
  ShieldCheck,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { type ReactNode, useState } from "react";

import AISummary from "@/features/analyzer/components/results/AISummary";
import ATSReadiness from "@/features/analyzer/components/results/ATSReadiness";
import CategoryBreakdown from "@/features/analyzer/components/results/CategoryBreakdown";
import ImprovementList from "@/features/analyzer/components/results/ImprovementList";
import PersonalizedRoadmapCard from "@/features/analyzer/components/results/PersonalizedRoadmapCard";
import MissingSkills from "@/features/analyzer/components/results/MissingSkills";
import ResumeStrengths from "@/features/analyzer/components/results/ResumeStrengths";
import SkillsMatch from "@/features/analyzer/components/results/SkillsMatch";

import type { CareerAnalysis } from "@/features/analyzer/types/careerAnalysis";

interface AnalysisResultsProps {
  analysis: CareerAnalysis | null;
  resumeFile: File | null;
  onStartAgain: () => void;
}

type DetailSection =
  | "breakdown"
  | "ats"
  | "skills"
  | "strengths"
  | "gaps"
  | "improvements"
  | null;

const DETAIL_NAV: Array<{
  id: Exclude<DetailSection, null>;
  short: string;
}> = [
  { id: "breakdown", short: "Analysis Breakdown" },
  { id: "ats", short: "ATS Readiness" },
  { id: "skills", short: "Skills Match" },
  { id: "strengths", short: "Resume Strengths" },
  { id: "gaps", short: "Missing & Weak Skills" },
  { id: "improvements", short: "Recommended Improvements" },
];

const sectionMotion = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.35,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
  },
});

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Moderate";
  if (score >= 40) return "Partial";
  return "Limited";
}

function scoreTone(score: number): {
  text: string;
  soft: string;
  border: string;
  gradient: string;
  stroke: string;
} {
  if (score >= 70) {
    return {
      text: "text-emerald-700",
      soft: "bg-emerald-50",
      border: "border-emerald-100",
      gradient: "from-emerald-500 to-teal-400",
      stroke: "rgb(16 185 129)",
    };
  }

  if (score >= 45) {
    return {
      text: "text-indigo-700",
      soft: "bg-indigo-50",
      border: "border-indigo-100",
      gradient: "from-blue-600 to-indigo-500",
      stroke: "rgb(79 70 229)",
    };
  }

  return {
    text: "text-amber-700",
    soft: "bg-amber-50",
    border: "border-amber-100",
    gradient: "from-amber-500 to-orange-400",
    stroke: "rgb(245 158 11)",
  };
}

function Gauge({ value, size = 170 }: { value: number; size?: number }) {
  const safe = clamp(value);
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;
  const tone = scoreTone(safe);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${safe} out of 100 role match`}
    >
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="rgb(226 232 240)"
          strokeWidth="10"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={tone.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-1.5">
          <Target className={`h-3.5 w-3.5 ${tone.text}`} strokeWidth={2} />
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            role fit
          </span>
        </div>
        <p className="mt-1 text-[2.65rem] font-bold tracking-[-0.055em] text-slate-950">
          {safe}%
        </p>
        <span
          className={`mt-0.5 rounded-full border px-2 py-0.5 text-[8px] font-bold ${tone.soft} ${tone.border} ${tone.text}`}
        >
          {scoreLabel(safe)}
        </span>
      </div>
    </div>
  );
}

function MiniBarList({
  items,
}: {
  items: Array<{ label: string; value: number; weight?: number }>;
}) {
  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => {
        const score = clamp(item.value);
        const weight = item.weight ?? 0;
        const tone = scoreTone(score);

        return (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.gradient.includes("emerald") ? "bg-emerald-500" : tone.gradient.includes("amber") ? "bg-amber-500" : "bg-indigo-500"}`} />
                <span className="truncate text-[10px] font-semibold text-slate-600 sm:text-[11px]">
                  {item.label}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {weight > 0 && (
                  <span className="text-[8px] font-semibold text-slate-400">
                    {Math.round(weight * 100)}%
                  </span>
                )}
                <span className={`text-[10px] font-bold ${tone.text}`}>
                  {score}
                </span>
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/60">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${tone.gradient} transition-[width] duration-700 ease-out`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniRadar({
  skills,
  fallbackScores,
}: {
  skills: unknown[];
  fallbackScores: {
    skills: number;
    keywords: number;
    experience: number;
    education: number;
    semantic: number;
  };
}) {
  const getName = (item: unknown): string => {
    if (!item || typeof item !== "object") return "Skill";
    const record = item as Record<string, unknown>;
    const direct = record.name ?? record.skillName ?? record.skill_name;
    if (typeof direct === "string" && direct.trim()) return direct.trim();
    const nested = record.skill;
    if (nested && typeof nested === "object") {
      const nestedRecord = nested as Record<string, unknown>;
      const nestedName =
        nestedRecord.name ?? nestedRecord.skillName ?? nestedRecord.skill_name;
      if (typeof nestedName === "string" && nestedName.trim()) {
        return nestedName.trim();
      }
    }
    return "Skill";
  };

  const getScore = (item: unknown): number => {
    if (!item || typeof item !== "object") return 0;
    const record = item as Record<string, unknown>;
    const values: unknown[] = [record.score, record.matchScore, record.match_score];
    const nested = record.skill;
    if (nested && typeof nested === "object") {
      const nestedRecord = nested as Record<string, unknown>;
      values.push(
        nestedRecord.score,
        nestedRecord.matchScore,
        nestedRecord.match_score,
      );
    }
    for (const value of values) {
      if (typeof value === "number" && Number.isFinite(value)) return clamp(value);
    }
    return 0;
  };

  const selected = skills
    .map((skill) => ({ name: getName(skill), score: getScore(skill) }))
    .filter((item) => item.name !== "Skill")
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const data =
    selected.length >= 3
      ? selected
      : [
          { name: "Skills", score: clamp(fallbackScores.skills) },
          { name: "Keywords", score: clamp(fallbackScores.keywords) },
          { name: "Experience", score: clamp(fallbackScores.experience) },
          { name: "Education", score: clamp(fallbackScores.education) },
          { name: "Semantic", score: clamp(fallbackScores.semantic) },
        ];

  const cx = 72;
  const cy = 72;
  const radius = 48;
  const points = (values: number[]) =>
    values
      .map((value, index) => {
        const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
        const distance = radius * (value / 100);
        return `${cx + Math.cos(angle) * distance},${cy + Math.sin(angle) * distance}`;
      })
      .join(" ");

  return (
    <div className="mt-4 grid grid-cols-[1.05fr_0.95fr] items-center gap-3">
      <svg
        viewBox="0 0 144 144"
        className="mx-auto h-[132px] w-[132px] sm:h-[144px] sm:w-[144px]"
        role="img"
        aria-label="Skill match radar chart"
      >
        {[25, 50, 75, 100].map((level) => (
          <polygon
            key={level}
            points={points(new Array(data.length).fill(level))}
            fill="none"
            stroke="rgb(203 213 225)"
            strokeOpacity="0.75"
            strokeWidth="1"
          />
        ))}

        {data.map((item, index) => {
          const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
          return (
            <line
              key={`axis-${item.name}-${index}`}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(angle) * radius}
              y2={cy + Math.sin(angle) * radius}
              stroke="rgb(203 213 225)"
              strokeOpacity="0.55"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={points(data.map((item) => item.score))}
          fill="rgb(99 102 241 / 0.18)"
          stroke="rgb(79 70 229)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {data.map((item, index) => {
          const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
          const distance = radius * (item.score / 100);
          return (
            <circle
              key={`point-${item.name}-${index}`}
              cx={cx + Math.cos(angle) * distance}
              cy={cy + Math.sin(angle) * distance}
              r="2.5"
              fill="rgb(79 70 229)"
            />
          );
        })}
      </svg>

      <div className="min-w-0 space-y-2">
        {data.slice(0, 5).map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-[9px] font-medium text-slate-500">
              {item.name}
            </span>
            <span className="shrink-0 text-[9px] font-bold text-slate-800">
              {item.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const safe = clamp(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-semibold text-slate-500">{label}</span>
        <span className="text-[9px] font-bold text-slate-700">{safe}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

function CardShell({
  title,
  description,
  icon,
  iconClassName,
  children,
  onClick,
  className = "",
}: {
  title: string;
  description: string;
  icon: ReactNode;
  iconClassName: string;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      {...sectionMotion(0)}
      onClick={onClick}
      className={`group relative min-h-[44px] w-full min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-[0_10px_32px_rgba(15,23,42,0.045)] outline-none transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(79,70,229,0.09)] focus-visible:ring-4 focus-visible:ring-indigo-500/15 sm:p-6 ${className}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-indigo-50/70 blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-20 w-20 -translate-x-8 translate-y-8 rounded-full bg-blue-50/45 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-[-0.02em] text-slate-950 sm:text-[15px]">
                {title}
              </h2>
              <p className="mt-0.5 max-w-sm text-[9px] leading-4 text-slate-400 sm:text-[10px]">
                {description}
              </p>
            </div>
          </div>

          <ArrowRight
            className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-500"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        {children}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 sm:mt-5">
          <span className="text-[9px] font-semibold text-slate-400">Tap for detailed report</span>
          <span className="text-[9px] font-bold text-indigo-600">View details</span>
        </div>
      </div>
    </motion.button>
  );
}

function getDetailTitle(section: Exclude<DetailSection, null>): string {
  switch (section) {
    case "breakdown": return "Analysis Breakdown";
    case "ats": return "ATS Readiness";
    case "skills": return "Skills Match";
    case "strengths": return "Resume Strengths";
    case "gaps": return "Missing & Weak Skills";
    case "improvements": return "Recommended Improvements";
  }
}

function getDetailDescription(section: Exclude<DetailSection, null>): string {
  switch (section) {
    case "breakdown": return "A deeper view of the signals behind your role-match score.";
    case "ats": return "A detailed look at how clearly your resume can be parsed and screened.";
    case "skills": return "A complete comparison of the skills found in your resume against the target role.";
    case "strengths": return "The strongest evidence in your resume that supports your target role.";
    case "gaps": return "Skills that are missing or currently supported only by limited evidence.";
    case "improvements": return "Practical resume changes that can improve your fit for this target role.";
  }
}

function renderDetailedSection(
  section: Exclude<DetailSection, null>,
  analysis: CareerAnalysis,
) {
  switch (section) {
    case "breakdown": return <CategoryBreakdown analysis={analysis} />;
    case "ats": return <ATSReadiness analysis={analysis} />;
    case "skills": return <SkillsMatch analysis={analysis} />;
    case "strengths": return <ResumeStrengths analysis={analysis} />;
    case "gaps": return <MissingSkills missingSkills={analysis.missingSkills} />;
    case "improvements": return <ImprovementList analysis={analysis} />;
  }
}

export default function AnalysisResults({
  analysis,
  resumeFile,
  onStartAgain,
}: AnalysisResultsProps) {
  const [detailSection, setDetailSection] = useState<DetailSection>(null);

  if (!analysis) {
    return (
      <main className="min-w-0 overflow-x-clip bg-white" aria-labelledby="analysis-unavailable-title">
        <section className="py-14 sm:py-18">
          <div className="careermap-container">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
                <CircleAlert className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <h1 id="analysis-unavailable-title" className="mt-4 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                Analysis isn&apos;t available yet.
              </h1>
              <p className="mx-auto mt-2.5 max-w-md text-sm leading-6 text-slate-500">
                The analysis data could not be loaded. Return to the analyzer and try again.
              </p>
              <button
                type="button"
                onClick={onStartAgain}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(79,70,229,0.16)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.9} />
                Return to analyzer
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (detailSection) {
    return (
      <main className="min-w-0 overflow-x-clip bg-white" aria-labelledby="analysis-detail-title">
        <section className="py-5 sm:py-9 lg:py-14">
          <div className="careermap-container">
            <div className="mx-auto w-full max-w-5xl">
              <motion.div {...sectionMotion(0)} className="rounded-[1.5rem] border border-slate-200 bg-white p-3.5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:rounded-[1.75rem] sm:p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setDetailSection(null)}
                      className="group inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 bg-slate-950 px-4 text-[11px] font-bold text-white sm:min-h-11 shadow-[0_8px_20px_rgba(15,23,42,0.12)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:ring-4 focus-visible:ring-indigo-500/20"
                    >
                      <ArrowLeft
                        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
                        strokeWidth={2}
                      />
                      Back to overview
                    </button>

                    <span className="hidden rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-indigo-600 sm:inline-flex">
                      Detailed report
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3.5 sm:pt-4">
                    <motion.header {...sectionMotion(0.02)} className="max-w-3xl">
                      <div className="flex items-center gap-2 sm:hidden">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-indigo-600">
                          Detailed report
                        </p>
                      </div>

                      <p className="hidden text-[10px] font-bold uppercase tracking-[0.13em] text-indigo-600 sm:block">
                        Detailed report
                      </p>

                      <h1
                        id="analysis-detail-title"
                        className="mt-2 text-[1.65rem] font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:mt-2 sm:text-3xl"
                      >
                        {getDetailTitle(detailSection)}
                      </h1>

                      <p className="mt-2.5 max-w-2xl text-[11px] leading-[1.55] text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                        {getDetailDescription(detailSection)}
                      </p>
                    </motion.header>
                  </div>

                  <nav
                    aria-label="Detailed report sections"
                    className="border-t border-slate-100 pt-3"
                  >
                    <div className="flex snap-x gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {DETAIL_NAV.map((item) => {
                        const active = item.id === detailSection;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setDetailSection(item.id)}
                            aria-current={active ? "page" : undefined}
                            className={`inline-flex min-h-11 shrink-0 snap-start items-center rounded-xl border px-3 text-[10px] font-semibold outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-indigo-500/15 sm:px-3.5 sm:text-[11px] ${
                              active
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm"
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                            }`}
                          >
                            <span className="sm:hidden">
                              {item.id === "improvements"
                                ? "Improve"
                                : item.id === "strengths"
                                    ? "Strengths"
                                    : item.id === "breakdown"
                                      ? "Breakdown"
                                      : item.id === "skills"
                                        ? "Skills"
                                        : item.id === "gaps"
                                          ? "Gaps"
                                          : "ATS"}
                            </span>
                            <span className="hidden sm:inline">{item.short}</span>
                          </button>
                        );
                      })}
                    </div>
                  </nav>
                </div>
              </motion.div>

              <div className="mt-5 sm:mt-6">
                <motion.div {...sectionMotion(0.08)}>
                  {renderDetailedSection(detailSection, analysis)}
                </motion.div>
              </div>

              <div className="mt-5 flex justify-center sm:mt-6">
                <button
                  type="button"
                  onClick={() => setDetailSection(null)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-semibold text-slate-500 shadow-sm outline-none transition-colors hover:border-slate-300 hover:text-slate-800 focus-visible:ring-4 focus-visible:ring-slate-500/10"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Back to overview
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const matchScore = clamp(analysis.matchScore);
  const atsScore = clamp(analysis.atsScore);
  const skillsScore = clamp(analysis.skillsMatchScore);
  const keywordScore = clamp(analysis.keywordMatchScore);
  const experienceScore = clamp(analysis.experienceMatchScore);
  const educationScore = clamp(analysis.educationMatchScore);
  const semanticScore = clamp(analysis.semanticSimilarityScore);

  const strongSkillCount = analysis.skills.filter((skill) => skill.status === "strong").length;
  const partialSkillCount = analysis.skills.filter((skill) => skill.status === "partial").length;
  const missingSkillCount = analysis.skills.filter((skill) => skill.status === "missing").length;
  const strengthCount = analysis.strengths.length;
  const improvementCount = analysis.improvements.length;
  const totalSkills = Math.max(analysis.skills.length, 1);
  const missingCount = missingSkillCount;
  const partialCount = partialSkillCount;
  const supportedCount = strongSkillCount;
  const supportPercent = Math.round((supportedCount / totalSkills) * 100);

  const highPriority = analysis.improvements.filter((item) => String(item.priority).toLowerCase() === "high").length;
  const mediumPriority = analysis.improvements.filter((item) => String(item.priority).toLowerCase() === "medium").length;
  const lowPriority = Math.max(0, improvementCount - highPriority - mediumPriority);

  const strengthsPreview =
    analysis.strengths
      .slice(0, 3)
      .map((strength) => strength.title)
      .join(" • ") || "No strong signals yet";

  return (
    <main
      className="relative min-w-0 overflow-x-clip bg-white"
      aria-labelledby="analysis-results-title"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-8rem] h-96 w-96 rounded-full bg-blue-100/35 blur-3xl" />
        <div className="absolute right-[-11rem] top-40 h-[28rem] w-[28rem] rounded-full bg-violet-100/30 blur-3xl" />
        <div className="absolute left-1/3 top-[42rem] h-72 w-72 rounded-full bg-indigo-100/20 blur-3xl" />
      </div>

      <section className="relative py-6 sm:py-10 lg:py-14">
        <div className="careermap-container">
          <motion.header {...sectionMotion(0)} className="mx-auto w-full max-w-6xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1.5 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700 sm:text-[10px]">
                    Analysis complete
                  </span>
                </div>

                <h1
                  id="analysis-results-title"
                  className="mt-3 max-w-3xl text-[30px] font-bold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-4xl lg:text-[3.15rem]"
                >
                  Your resume, mapped to
                  <span className="careermap-text-gradient block sm:inline">
                    {" "}
                    {analysis.role?.trim() || "your target role"}.
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-[12px] leading-5.5 text-slate-500 sm:text-sm sm:leading-6">
                  A visual snapshot of your fit, evidence, ATS readiness, gaps, and the next improvements that matter most.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-start lg:self-auto">
                {resumeFile && (
                  <div className="hidden max-w-[260px] items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-[0_5px_18px_rgba(15,23,42,0.04)] sm:flex">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                      <FileText
                        className="h-3.5 w-3.5"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        Resume analyzed
                      </p>
                      <span
                        title={resumeFile.name}
                        className="mt-0.5 block truncate text-[10px] font-semibold text-slate-700"
                      >
                        {resumeFile.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.header>

          <div className="mx-auto mt-5 w-full max-w-6xl sm:mt-8">
            {/* Hero analytics panel */}
            <motion.button
              type="button"
              {...sectionMotion(0.04)}
              onClick={() => setDetailSection("breakdown")}
              className="group relative w-full overflow-hidden rounded-[2rem] border border-indigo-100 bg-white/95 text-left shadow-[0_20px_60px_rgba(79,70,229,0.08)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_75px_rgba(79,70,229,0.12)] focus-visible:ring-4 focus-visible:ring-indigo-500/15"
            >
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/70" />
              <div aria-hidden="true" className="absolute right-[-4rem] top-[-5rem] h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />
              <div aria-hidden="true" className="absolute bottom-[-6rem] left-1/3 h-52 w-52 rounded-full bg-violet-100/35 blur-3xl" />

              <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:p-8">
                <div className="flex items-center gap-5 sm:gap-7">
                  <div className="relative flex h-32 w-32 shrink-0 items-center justify-center sm:h-40 sm:w-40">
                    <div className="absolute inset-0 rounded-full bg-indigo-50/70 blur-sm" />
                    <Gauge value={matchScore} size={156} />
                  </div>

                  <div className="min-w-0 lg:hidden">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-indigo-600">Overall fit</p>
                    <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-slate-950 sm:text-2xl">{scoreLabel(matchScore)} alignment</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">Across skills, keywords, experience, education, and semantic similarity.</p>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="hidden lg:block">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-indigo-600">Overall fit</p>
                    <h2 className="mt-1.5 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                      {scoreLabel(matchScore)} alignment for this role
                    </h2>
                    <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-6">
                      Your overall score combines the core deterministic match signals. The chart below makes the strengths and weaker areas visible at a glance.
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {[
                      ["Skills", skillsScore, "from-blue-600 to-cyan-400"],
                      ["Keywords", keywordScore, "from-indigo-600 to-blue-400"],
                      ["Experience", experienceScore, "from-violet-600 to-indigo-400"],
                      ["Education", educationScore, "from-sky-500 to-indigo-400"],
                    ].map(([label, value, gradient]) => (
                      <div key={String(label)} className="rounded-2xl border border-slate-100 bg-white/80 px-3 py-3 shadow-[0_4px_18px_rgba(15,23,42,0.035)]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-400 sm:text-[9px]">{label}</span>
                          <span className="text-[10px] font-bold text-slate-800">{value}</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-[9px] font-medium text-slate-400 sm:text-[10px]">Open the full scoring breakdown</span>
                    <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 text-[9px] font-bold text-white transition-transform duration-200 group-hover:translate-x-0.5 sm:text-[10px]">
                      Detailed report
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.div {...sectionMotion(0.07)} className="mt-4 sm:mt-5">
              <AISummary analysis={analysis} />
            </motion.div>

            {/* Primary visual dashboard */}
            <div className="mt-4 grid gap-4 lg:grid-cols-12 sm:mt-5">
              <CardShell
                title="Analysis Breakdown"
                description="See how every role-fit signal is performing."
                icon={<BarChart3 className="h-5 w-5" strokeWidth={1.8} />}
                iconClassName="border border-blue-100 bg-blue-50 text-blue-600"
                onClick={() => setDetailSection("breakdown")}
                className="hidden lg:col-span-7"
              >
                <div className="mt-5 grid gap-5 sm:grid-cols-[0.75fr_1.25fr] sm:items-center">
                  <div className="relative flex h-28 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 sm:h-32">
                    <div className="absolute inset-x-5 top-1/2 h-px bg-slate-200" />
                    <div className="absolute inset-x-5 top-1/4 h-px bg-slate-100" />
                    <div className="absolute inset-x-5 top-3/4 h-px bg-slate-100" />
                    <div className="relative flex items-end gap-2">
                      {[
                        [skillsScore, "S"],
                        [keywordScore, "K"],
                        [experienceScore, "E"],
                        [educationScore, "D"],
                        [semanticScore, "Σ"],
                      ].map(([value, label], index) => (
                        <div key={`${label}-${index}`} className="flex flex-col items-center gap-1">
                          <div className="flex h-24 w-5 items-end sm:w-6">
                            <div className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 via-blue-500 to-cyan-400" style={{ height: `${Math.max(8, Number(value))}%` }} />
                          </div>
                          <span className="text-[8px] font-bold text-slate-400">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <MiniBarList
                    items={[
                      { label: "Skill Match", value: skillsScore, weight: 0.4 },
                      { label: "Keyword Match", value: keywordScore, weight: 0.2 },
                      { label: "Experience", value: experienceScore, weight: 0.2 },
                      { label: "Education", value: educationScore, weight: 0.1 },
                      { label: "Semantic", value: semanticScore, weight: 0.1 },
                    ]}
                  />
                </div>
              </CardShell>

              <CardShell
                title="ATS Readiness"
                description="How clearly your resume can be parsed and screened."
                icon={<FileText className="h-5 w-5" strokeWidth={1.8} />}
                iconClassName="border border-amber-100 bg-amber-50 text-amber-600"
                onClick={() => setDetailSection("ats")}
                className="lg:col-span-5"
              >
                <div className="mt-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-amber-50/65 via-white to-indigo-50/45 p-4 sm:p-5">
                  <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                    <div className="relative mx-auto flex h-32 w-32 shrink-0 items-center justify-center sm:h-36 sm:w-36">
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-amber-100/40 blur-xl"
                      />
                      <svg
                        viewBox="0 0 160 160"
                        className="relative h-full w-full -rotate-90"
                        role="img"
                        aria-label={`ATS readiness score ${atsScore} out of 100`}
                      >
                        <defs>
                          <linearGradient id="ats-readiness-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="55%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                        <circle
                          cx="80"
                          cy="80"
                          r="61"
                          fill="none"
                          stroke="rgb(226 232 240)"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="61"
                          fill="none"
                          stroke="url(#ats-readiness-gradient)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 61}
                          strokeDashoffset={(2 * Math.PI * 61) - (Math.max(0, Math.min(100, atsScore)) / 100) * (2 * Math.PI * 61)}
                          className="transition-[stroke-dashoffset] duration-700 ease-out"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="47"
                          fill="white"
                          stroke="rgb(241 245 249)"
                          strokeWidth="1"
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-1 text-amber-600">
                          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                          <span className="text-[8px] font-bold uppercase tracking-[0.12em]">ATS</span>
                        </div>
                        <p className="mt-0.5 text-[2rem] font-bold tracking-[-0.05em] text-slate-950">
                          {atsScore}
                        </p>
                        <p className="text-[8px] font-semibold text-slate-400">/ 100</p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Readiness level
                          </p>
                          <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-slate-950 sm:text-base">
                            {scoreLabel(atsScore)}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-white px-2.5 py-1 text-[8px] font-bold text-amber-700 shadow-[0_4px_12px_rgba(245,158,11,0.06)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          {atsScore >= 85 ? "Screening ready" : atsScore >= 70 ? "Good foundation" : atsScore >= 50 ? "Needs polish" : "Needs attention"}
                        </span>
                      </div>

                      <p className="mt-2 text-[9px] leading-4 text-slate-500 sm:text-[10px] sm:leading-5">
                        A higher score indicates stronger readiness for automated resume parsing and screening.
                      </p>

                      <div className="mt-4">
                        <div className="flex items-end justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-semibold text-slate-400">Readiness scale</span>
                          </div>
                          <span className="text-[8px] font-bold text-slate-500">{atsScore}%</span>
                        </div>

                        <div className="relative mt-2">
                          <div className="flex h-2 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70">
                            <div className="w-[50%] bg-gradient-to-r from-rose-300 to-amber-300" />
                            <div className="w-[20%] bg-gradient-to-r from-amber-300 to-yellow-300" />
                            <div className="w-[15%] bg-gradient-to-r from-yellow-300 to-emerald-300" />
                            <div className="w-[15%] bg-gradient-to-r from-emerald-300 to-teal-300" />
                          </div>

                          <div
                            className="absolute -top-1 h-4 w-1 rounded-full bg-slate-950 shadow-[0_2px_8px_rgba(15,23,42,0.25)] transition-[left] duration-700 ease-out"
                            style={{ left: `calc(${Math.max(0, Math.min(100, atsScore))}% - 2px)` }}
                            aria-hidden="true"
                          />
                        </div>

                        <div className="mt-1.5 flex justify-between text-[7px] font-medium text-slate-400">
                          <span>Needs work</span>
                          <span>Good</span>
                          <span>Strong</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      ["Overall signal", atsScore >= 85 ? "Excellent" : atsScore >= 70 ? "Strong" : atsScore >= 55 ? "Moderate" : "Limited"],
                      ["Readiness band", atsScore >= 70 ? "70–100" : atsScore >= 50 ? "50–69" : "0–49"],
                      ["Action", atsScore >= 70 ? "Maintain" : "Improve"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/80 bg-white/75 px-2.5 py-2 shadow-[0_4px_14px_rgba(15,23,42,0.025)]"
                      >
                        <p className="text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
                        <p className="mt-0.5 text-[9px] font-bold text-slate-700">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardShell>

              <CardShell
                title="Skills Match"
                description="The role-specific skills your profile supports most strongly."
                icon={<Sparkles className="h-5 w-5" strokeWidth={1.8} />}
                iconClassName="border border-violet-100 bg-violet-50 text-violet-600"
                onClick={() => setDetailSection("skills")}
                className="lg:col-span-7"
              >
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_0.95fr] sm:items-center">
                  <MiniRadar
                      skills={analysis.skills}
                      fallbackScores={{
                        skills: skillsScore,
                        keywords: keywordScore,
                        experience: experienceScore,
                        education: educationScore,
                        semantic: semanticScore,
                      }}
                    />
                  <div className="grid grid-cols-2 gap-2">
                    {analysis.skills.slice(0, 6).map((skill, index) => {
                      const score = clamp((skill as any).score ?? (skill as any).matchScore ?? 0);
                      const name = String((skill as any).name ?? (skill as any).skillName ?? (skill as any).skill?.name ?? "Skill");
                      return (
                        <div key={`${name}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50/75 px-2.5 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="max-w-[90px] truncate text-[8px] font-semibold text-slate-500">{name}</span>
                            <span className="text-[9px] font-bold text-indigo-700">{score}</span>
                          </div>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400" style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardShell>

              <CardShell
                title="Resume Strengths"
                description="Evidence already giving your profile leverage."
                icon={<CheckCircle2 className="h-5 w-5" strokeWidth={1.8} />}
                iconClassName="border border-emerald-100 bg-emerald-50 text-emerald-600"
                onClick={() => setDetailSection("strengths")}
                className="lg:col-span-5"
              >
                <div className="mt-5">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50/70">
                      <div className="absolute inset-2 rounded-full border border-dashed border-emerald-200" />
                      <div className="relative text-center">
                        <p className="text-2xl font-bold tracking-tight text-slate-950">{strengthCount}</p>
                        <p className="text-[8px] font-bold uppercase tracking-wide text-emerald-600">strong</p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-800 sm:text-xs">High-confidence skill evidence</p>
                      <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-[10px]">{strengthsPreview}</p>
                      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-emerald-50">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${Math.min(100, Math.round((strongSkillCount / totalSkills) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardShell>
            </div>

            {/* Gaps and actions */}
            <div className="mt-4 grid gap-4 lg:grid-cols-12 sm:mt-5">
              <CardShell
                title="Missing & Weak Skills"
                description="The distribution of supported, partial, and missing skill signals."
                icon={<CircleAlert className="h-5 w-5" strokeWidth={1.8} />}
                iconClassName="border border-rose-100 bg-rose-50 text-rose-600"
                onClick={() => setDetailSection("gaps")}
                className="lg:col-span-7"
              >
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold tracking-tight text-slate-950">{supportPercent}%</p>
                      <p className="text-[9px] font-semibold text-slate-400">skills currently supported</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-semibold text-slate-400">attention needed</p>
                      <p className="text-xl font-bold tracking-tight text-rose-600">{missingCount + partialCount}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70">
                    <div className="bg-slate-400" style={{ width: `${(supportedCount / totalSkills) * 100}%` }} />
                    <div className="bg-amber-400" style={{ width: `${(partialCount / totalSkills) * 100}%` }} />
                    <div className="bg-rose-500" style={{ width: `${(missingCount / totalSkills) * 100}%` }} />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      ["Supported", supportedCount, "text-slate-800"],
                      ["Partial", partialCount, "text-amber-600"],
                      ["Missing", missingCount, "text-rose-600"],
                    ].map(([label, value, color]) => (
                      <div key={String(label)} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                        <p className={`text-sm font-bold ${color}`}>{value}</p>
                        <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardShell>

              <CardShell
                title="Recommended Improvements"
                description="Where your practical resume actions are concentrated."
                icon={<FileEdit className="h-5 w-5" strokeWidth={1.8} />}
                iconClassName="border border-indigo-100 bg-indigo-50 text-indigo-600"
                onClick={() => setDetailSection("improvements")}
                className="lg:col-span-5"
              >
                <div className="mt-5 grid gap-4 sm:grid-cols-[0.75fr_1.25fr] sm:items-center">
                  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-indigo-100 bg-indigo-50/70">
                    <p className="text-2xl font-bold tracking-tight text-slate-950">{improvementCount}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wide text-indigo-600">actions</p>
                  </div>
                  <div className="space-y-3">
                    <StatusBar label="High priority" value={improvementCount ? (highPriority / improvementCount) * 100 : 0} color="from-rose-500 to-orange-400" />
                    <StatusBar label="Medium priority" value={improvementCount ? (mediumPriority / improvementCount) * 100 : 0} color="from-amber-400 to-yellow-300" />
                    <StatusBar label="Low priority" value={improvementCount ? (lowPriority / improvementCount) * 100 : 0} color="from-violet-500 to-indigo-400" />
                  </div>
                </div>
              </CardShell>
            </div>

            <PersonalizedRoadmapCard />

            <motion.div {...sectionMotion(0.24)} className="mt-6 border-t border-slate-100 pt-5 sm:pt-6">
              <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
                <div className="inline-flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                    <LockKeyhole className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-700">Privacy-first processing</p>
                    <p className="text-[9px] text-slate-400">Your career information is processed temporarily and isn&apos;t permanently stored.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onStartAgain}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-600 shadow-[0_4px_14px_rgba(15,23,42,0.03)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-slate-500/10"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden="true" />
                  Analyze another resume
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
