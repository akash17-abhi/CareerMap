import {
  Award,
  BarChart3,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Gauge,
  Info,
  Layers3,
  Search,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import type { CareerAnalysis, SkillMatch } from "@/features/analyzer/types/careerAnalysis";

interface SkillsMatchProps {
  analysis: CareerAnalysis;
}

type Skill = SkillMatch;
type Filter = "all" | "required" | "strong" | "partial" | "missing";
type Status = "strong" | "partial" | "missing";

type StatusMeta = {
  label: string;
  compact: string;
  text: string;
  bg: string;
  border: string;
  bar: string;
  soft: string;
  icon: typeof CircleCheck;
};

function clamp(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : 0;
}

function normalizeStatus(value: unknown): Status {
  if (value === "strong") return "strong";
  if (value === "partial") return "partial";
  return "missing";
}

function getStatusMeta(statusValue: unknown): StatusMeta {
  const status = normalizeStatus(statusValue);

  if (status === "strong") {
    return {
      label: "Strong evidence",
      compact: "Strong",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      bar: "bg-emerald-500",
      soft: "bg-emerald-50/65",
      icon: CircleCheck,
    };
  }

  if (status === "partial") {
    return {
      label: "Partial evidence",
      compact: "Partial",
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-100",
      bar: "bg-amber-500",
      soft: "bg-amber-50/45",
      icon: CircleAlert,
    };
  }

  return {
    label: "Missing evidence",
    compact: "Missing",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-100",
    bar: "bg-rose-500",
    soft: "bg-rose-50/45",
    icon: CircleAlert,
  };
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Moderate";
  if (score >= 40) return "Partial";
  return "Limited";
}

function prettySource(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "Resume evidence";
  const text = value.replace(/[_-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getEvidence(skill: Skill) {
  return Array.isArray(skill.evidence) ? skill.evidence : [];
}

function getEvidenceSnippet(skill: Skill): string {
  const evidence = getEvidence(skill);

  if (!evidence.length) {
    return skill.mentioned
      ? "The skill is mentioned, but no supporting evidence record is attached."
      : "No supporting evidence was found in the analyzed resume.";
  }

  const strongest = [...evidence].sort(
    (a, b) => Number(b.strength ?? 0) - Number(a.strength ?? 0),
  )[0];

  const text = typeof strongest?.text === "string" ? strongest.text.trim() : "";
  const section = typeof strongest?.section === "string" ? strongest.section.trim() : "";
  const source = prettySource(strongest?.sourceType);

  if (text && section) return `${source} · ${section}: ${text}`;
  if (text) return `${source}: ${text}`;
  if (section) return `${source} · ${section}`;
  return `${source} evidence detected for this skill.`;
}

function roleRelevantSort(a: Skill, b: Skill): number {
  const requiredRank = Number(Boolean(b.requiredByRole)) - Number(Boolean(a.requiredByRole));
  if (requiredRank !== 0) return requiredRank;

  const statusRank: Record<Status, number> = { missing: 0, partial: 1, strong: 2 };
  const statusDiff = statusRank[normalizeStatus(a.status)] - statusRank[normalizeStatus(b.status)];
  if (statusDiff !== 0) return statusDiff;

  return clamp(a.score) - clamp(b.score);
}

function RadarChart({ skills }: { skills: Skill[] }) {
  if (skills.length < 3) return null;

  const width = 420;
  const height = 320;
  const cx = 210;
  const cy = 146;
  const radius = 94;
  const count = skills.length;

  const point = (index: number, scale: number, outerRadius = radius) => {
    const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
    return {
      x: cx + Math.cos(angle) * outerRadius * scale,
      y: cy + Math.sin(angle) * outerRadius * scale,
    };
  };

  const polygon = (scale: number) =>
    skills
      .map((_, index) => {
        const p = point(index, scale);
        return `${p.x},${p.y}`;
      })
      .join(" ");

  const values = skills
    .map((skill, index) => {
      const p = point(index, clamp(skill.score) / 100);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.025)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 shrink-0 text-indigo-500" strokeWidth={1.8} />
            <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-indigo-600">
              Skill profile
            </p>
          </div>
          <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-slate-900">
            Strongest role-relevant signals
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[8px] font-semibold text-slate-500">
          Top {skills.length}
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl bg-slate-50/75">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label="Radar chart showing scores for the strongest role-relevant skills"
        >
          <defs>
            <linearGradient id="skills-radar-fill-v2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <polygon key={scale} points={polygon(scale)} fill="none" stroke="#e2e8f0" strokeWidth="1" />
          ))}

          {skills.map((skill, index) => {
            const outer = point(index, 1);
            const label = point(index, 1.16, radius);
            const anchor = label.x < cx - 18 ? "end" : label.x > cx + 18 ? "start" : "middle";

            return (
              <g key={skill.id ?? `${skill.name}-${index}`}>
                <line x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e2e8f0" strokeWidth="1" />
                <circle cx={outer.x} cy={outer.y} r="2" fill="#94a3b8" />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className="fill-slate-500 text-[8px] font-semibold"
                >
                  {skill.name.length > 17 ? `${skill.name.slice(0, 17)}…` : skill.name}
                </text>
              </g>
            );
          })}

          <polygon points={values} fill="url(#skills-radar-fill-v2)" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />

          {skills.map((skill, index) => {
            const value = point(index, clamp(skill.score) / 100);
            return (
              <circle
                key={`point-${skill.id ?? `${skill.name}-${index}`}`}
                cx={value.x}
                cy={value.y}
                r="3.5"
                fill="white"
                stroke="#6366f1"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function SummaryMetric({ label, value, icon, tone }: { label: string; value: number; icon: ReactNode; tone: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-[0_6px_18px_rgba(15,23,42,0.022)] sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-[-0.05em] text-slate-950">{value}</p>
    </div>
  );
}

function FilterButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "min-h-10 shrink-0 rounded-xl border px-3 py-2 text-[9px] font-bold transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2",
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
      ].join(" ")}
    >
      {label} <span className={active ? "text-indigo-500" : "text-slate-400"}>{count}</span>
    </button>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  const [expanded, setExpanded] = useState(false);
  const score = clamp(skill.score);
  const meta = getStatusMeta(skill.status);
  const Icon = meta.icon;
  const evidence = getEvidence(skill);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_22px_rgba(15,23,42,0.028)] transition-shadow hover:shadow-[0_10px_30px_rgba(15,23,42,0.055)]">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-inset"
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.text}`}>
              <Icon className="h-4 w-4" strokeWidth={1.9} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="break-words text-[12px] font-bold leading-5 text-slate-900 sm:text-[13px]">{skill.name}</p>
                    {skill.requiredByRole && (
                      <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[7px] font-bold uppercase tracking-wide text-indigo-600">
                        Required
                      </span>
                    )}
                  </div>
                  <p className={`mt-0.5 text-[9px] font-semibold ${meta.text}`}>{meta.label}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-right">
                    <p className={`text-lg font-bold leading-none tracking-[-0.04em] ${meta.text}`}>{score}</p>
                    <p className="mt-1 text-[7px] font-semibold uppercase tracking-wide text-slate-400">/ 100</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-300 transition-transform ${expanded ? "rotate-180" : ""}`}
                    strokeWidth={1.8}
                  />
                </div>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${meta.bar} transition-[width] duration-700 ease-out`} style={{ width: `${score}%` }} />
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[7.5px] font-medium text-slate-400">
                <span>{scoreLabel(score)}</span>
                <span>{skill.confidence ? `${skill.confidence} confidence` : "Confidence not specified"}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.8} />
              <span className="truncate text-[8px] font-semibold text-slate-500">
                {expanded ? "Hide evidence details" : "Tap to inspect evidence"}
              </span>
            </div>
            {evidence.length > 0 && (
              <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-[7px] font-bold text-slate-500">
                {evidence.length} record{evidence.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/65 px-4 py-4 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-3.5">
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-indigo-500" strokeWidth={1.9} />
                <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-slate-500">Resume evidence</p>
              </div>
              <p className="mt-2 break-words text-[9px] leading-5 text-slate-600">{getEvidenceSnippet(skill)}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-3.5">
              <div className="flex items-center gap-2">
                <Layers3 className="h-3.5 w-3.5 text-violet-500" strokeWidth={1.9} />
                <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-slate-500">Analysis signal</p>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                  <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">Mentioned</p>
                  <p className="mt-0.5 text-[10px] font-bold text-slate-800">{skill.mentioned ? "Yes" : "No"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                  <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">Evidence</p>
                  <p className="mt-0.5 text-[10px] font-bold text-slate-800">{evidence.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function SkillsMatch({ analysis }: SkillsMatchProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const skills = useMemo(() => (Array.isArray(analysis.skills) ? analysis.skills : []), [analysis.skills]);
  const requiredSkills = useMemo(() => skills.filter((skill) => skill.requiredByRole), [skills]);
  const roleName = analysis.role?.trim() || "the target role";
  const matchScore = clamp(analysis.skillsMatchScore);

  const counts = useMemo(() => {
    const result = { strong: 0, partial: 0, missing: 0, required: 0 };
    for (const skill of skills) {
      result[normalizeStatus(skill.status)] += 1;
      if (skill.requiredByRole) result.required += 1;
    }
    return result;
  }, [skills]);

  const roleAverage = useMemo(() => {
    if (!requiredSkills.length) return matchScore;
    return Math.round(requiredSkills.reduce((sum, skill) => sum + clamp(skill.score), 0) / requiredSkills.length);
  }, [matchScore, requiredSkills]);

  const strongestSkills = useMemo(
    () =>
      [...skills]
        .filter((skill) => skill.requiredByRole)
        .sort((a, b) => clamp(b.score) - clamp(a.score))
        .slice(0, 3),
    [skills],
  );

  const focusSkills = useMemo(
    () =>
      [...skills]
        .filter((skill) => skill.requiredByRole && normalizeStatus(skill.status) !== "strong")
        .sort(roleRelevantSort)
        .slice(0, 3),
    [skills],
  );

  const radarSkills = useMemo(
    () =>
      [...skills]
        .filter((skill) => skill.requiredByRole)
        .sort((a, b) => clamp(b.score) - clamp(a.score))
        .slice(0, 6),
    [skills],
  );

  const filteredSkills = useMemo(() => {
    switch (filter) {
      case "required":
        return skills.filter((skill) => skill.requiredByRole);
      case "strong":
        return skills.filter((skill) => normalizeStatus(skill.status) === "strong");
      case "partial":
        return skills.filter((skill) => normalizeStatus(skill.status) === "partial");
      case "missing":
        return skills.filter((skill) => normalizeStatus(skill.status) === "missing");
      default:
        return skills;
    }
  }, [filter, skills]);

  const filterItems: Array<{ key: Filter; label: string; count: number }> = [
    { key: "all", label: "All", count: skills.length },
    { key: "required", label: "Required", count: counts.required },
    { key: "strong", label: "Strong", count: counts.strong },
    { key: "partial", label: "Partial", count: counts.partial },
    { key: "missing", label: "Missing", count: counts.missing },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/30 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8"
      aria-labelledby="skills-match-title"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-100/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-100/25 blur-3xl" />

      <div className="relative">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                <Target className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p id="skills-match-title" className="text-base font-bold tracking-[-0.03em] text-slate-950 sm:text-lg">
                  Skills Match
                </p>
                <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-500 sm:text-[11px]">
                  A complete comparison of the skills found in your resume against the requirements for {roleName}.
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[8px] font-bold text-indigo-700">
            <Gauge className="h-3 w-3" strokeWidth={1.9} />
            {matchScore}% alignment
          </div>
        </header>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.025)] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">Overall skill alignment</p>
                  <div className="mt-1 flex items-end gap-2">
                    <p className="text-4xl font-bold leading-none tracking-[-0.06em] text-slate-950">{matchScore}%</p>
                    <span className="mb-0.5 rounded-full bg-slate-50 px-2.5 py-1 text-[8px] font-bold text-slate-500">Diagnostic</span>
                  </div>
                </div>
                <div className="shrink-0 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-right">
                  <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">Required avg.</p>
                  <p className="mt-0.5 text-lg font-bold tracking-[-0.04em] text-slate-900">{roleAverage}</p>
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" style={{ width: `${matchScore}%` }} />
              </div>

              <p className="mt-3 text-[9px] leading-5 text-slate-500">
                This score comes from the local skill-match analysis. Individual skill scores reflect the strength of resume evidence, not just a keyword mention.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SummaryMetric label="Strong" value={counts.strong} tone="bg-emerald-50 text-emerald-600" icon={<Check className="h-4 w-4" strokeWidth={2} />} />
              <SummaryMetric label="Partial" value={counts.partial} tone="bg-amber-50 text-amber-600" icon={<Zap className="h-4 w-4" strokeWidth={1.9} />} />
              <SummaryMetric label="Missing" value={counts.missing} tone="bg-rose-50 text-rose-600" icon={<CircleAlert className="h-4 w-4" strokeWidth={1.9} />} />
              <SummaryMetric label="Required" value={counts.required} tone="bg-indigo-50 text-indigo-600" icon={<Award className="h-4 w-4" strokeWidth={1.9} />} />
            </div>

            {radarSkills.length >= 3 && <RadarChart skills={radarSkills} />}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.025)] sm:p-5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-indigo-600">Your advantage</p>
                  <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-slate-900">Strongest role-relevant evidence</p>
                </div>
              </div>

              {strongestSkills.length ? (
                <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                  {strongestSkills.map((skill) => {
                    const meta = getStatusMeta(skill.status);
                    return (
                      <div key={skill.id ?? skill.name} className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/75 p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 break-words text-[10px] font-bold leading-4 text-slate-800">{skill.name}</p>
                          <span className={`shrink-0 text-sm font-bold ${meta.text}`}>{clamp(skill.score)}</span>
                        </div>
                        <p className={`mt-1 text-[8px] font-semibold ${meta.text}`}>{meta.label}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-[9px] leading-5 text-slate-500">No strong role-relevant signals were identified in the current analysis.</p>
              )}
            </div>

            <div className="rounded-3xl border border-amber-100 bg-amber-50/55 p-4 sm:p-5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100/70 text-amber-700">
                  <CircleAlert className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-amber-700">Focus next</p>
                  <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-slate-900">Clearest opportunities to strengthen</p>
                </div>
              </div>

              {focusSkills.length ? (
                <div className="mt-4 space-y-2.5">
                  {focusSkills.map((skill, index) => {
                    const meta = getStatusMeta(skill.status);
                    return (
                      <div key={skill.id ?? skill.name} className="flex items-center gap-3 rounded-2xl border border-amber-100/90 bg-white/75 p-3.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[9px] font-bold text-amber-700">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-[10px] font-bold leading-4 text-slate-800">{skill.name}</p>
                          <p className={`mt-0.5 text-[8px] font-semibold ${meta.text}`}>
                            {skill.requiredByRole ? "Role-required" : "Preferred"} · {meta.compact}
                          </p>
                        </div>
                        <span className={`shrink-0 text-sm font-bold ${meta.text}`}>{clamp(skill.score)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5 text-[9px] leading-5 text-emerald-700">
                  No role-relevant partial or missing skills were identified in the current analysis.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.025)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 shrink-0 text-indigo-500" strokeWidth={1.8} />
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-indigo-600">Skill alignment</p>
              </div>
              <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-slate-900">Resume evidence vs. target role</p>
              <p className="mt-1 text-[9px] leading-4 text-slate-500">Tap a skill to inspect the evidence signal behind its score.</p>
            </div>

            <div className="w-full overflow-x-auto pb-0.5 sm:w-auto sm:max-w-full">
              <div className="flex min-w-max gap-1.5" role="tablist" aria-label="Skill filters">
                {filterItems.map((item) => (
                  <FilterButton
                    key={item.key}
                    label={item.label}
                    count={item.count}
                    active={filter === item.key}
                    onClick={() => setFilter(item.key)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3.5 py-3">
            <p className="text-[8px] font-semibold text-slate-500">
              Showing <span className="font-bold text-slate-800">{filteredSkills.length}</span> skill{filteredSkills.length === 1 ? "" : "s"}
            </p>
            <span className="text-[8px] font-semibold text-slate-400">{filter === "all" ? "All analyzed skills" : `${filterItems.find((item) => item.key === filter)?.label} skills`}</span>
          </div>

          {filteredSkills.length ? (
            <div className="mt-3 space-y-2.5">
              {filteredSkills.map((skill) => (
                <SkillCard key={skill.id ?? skill.name} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
              <p className="text-sm font-bold text-slate-800">No skills in this filter</p>
              <p className="mt-1 text-[9px] leading-5 text-slate-500">Choose another filter to inspect the available analysis results.</p>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50/65 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100">
              <Info className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-500">How to use this result</p>
              <p className="mt-1 text-[9px] leading-5 text-slate-600 sm:text-[10px]">
                Keep strong skills visible, strengthen partial skills with concrete project or experience evidence, and prioritize missing role-required skills before lower-impact areas.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[8px] leading-4 text-slate-400 sm:text-[9px]">
          Skills match is a diagnostic estimate based on your resume and target job description. It is not an employer hiring decision.
        </p>
      </div>
    </section>
  );
}
