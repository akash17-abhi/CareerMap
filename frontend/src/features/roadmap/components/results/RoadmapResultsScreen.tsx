import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import type { GeneratedRoadmap } from "../../types/roadmap";
import { formatRoadmapDate } from "../../utils/roadmapFormatters";
import { BackgroundGlow } from "../shared/RoadmapUI";
import PDFExportButton from "@/components/shared/PDFExportButton";

import RoadmapOverview from "./RoadmapOverview";
import RoadmapPhaseCard from "./RoadmapPhaseCard";

interface RoadmapResultsScreenProps {
  roadmap: GeneratedRoadmap;
  source: string | null;
  generatedAt: string | null;
  cameFromAnalyzer: boolean;
  onStartOver: () => void;
}

export default function RoadmapResultsScreen({
  roadmap,
  source,
  generatedAt,
  cameFromAnalyzer,
  onStartOver,
}: RoadmapResultsScreenProps) {
  const navigate = useNavigate();

  const totalPhases = roadmap.phases.length;
  const totalMilestones = roadmap.phases.reduce(
    (sum, phase) => sum + phase.milestones.length,
    0,
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <BackgroundGlow />

      <main className="relative mx-auto w-full max-w-6xl px-3 pb-16 pt-5 sm:px-6 sm:pt-10 lg:px-8">
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_60px_-30px_rgba(15,23,42,0.28)] sm:rounded-[2rem]">
          {/* HERO */}
          <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-5 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700">
                  <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                  Personalized roadmap
                </div>

                <h1 className="mt-4 break-words text-[1.55rem] font-black leading-[1.1] tracking-tight text-slate-950 sm:text-4xl">
                  Your path to {roadmap.target_role}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  {roadmap.profile_summary}
                </p>
              </div>

              <div className="flex w-full shrink-0 flex-wrap items-center justify-start gap-2 sm:w-auto sm:items-end sm:justify-end">
                <PDFExportButton
                  endpoint="/api/pdf/roadmap"
                  payload={{
                    roadmap,
                    source,
                    generated_at: generatedAt,
                  }}
                  filename={buildRoadmapFilename(roadmap.target_role)}
                  label="Export PDF"
                  exportingLabel="Generating PDF..."
                />

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600">
                  {totalPhases} {totalPhases === 1 ? "phase" : "phases"}
                </span>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600">
                  {totalMilestones}{" "}
                  {totalMilestones === 1 ? "milestone" : "milestones"}
                </span>

                {source ? (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600">
                    {source === "cv" ? "Resume-based" : "Profile-based"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* CAREER SNAPSHOT */}
          <section aria-labelledby="roadmap-career-snapshot" className="border-b border-slate-200 px-4 py-6 sm:px-8 sm:py-8">
            <SectionHeading
              eyebrow="Career snapshot"
              title="Where you are starting from"
              icon={<Target aria-hidden="true" className="h-4 w-4" />}
            />

            <div className="mt-5">
              <RoadmapOverview roadmap={roadmap} />
            </div>
          </section>

          {/* STRENGTHS + GAPS */}
          <div className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-2 sm:gap-4 sm:p-8">
            <InsightCard
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Starting strengths"
              items={roadmap.starting_strengths}
              tone="positive"
              emptyLabel="No specific starting strengths were provided."
            />

            <InsightCard
              icon={<Target className="h-4 w-4" />}
              title="Priority gaps"
              items={roadmap.priority_gaps}
              tone="attention"
              emptyLabel="No priority gaps were highlighted."
            />
          </div>

          {/* WHY THIS ROADMAP */}
          <section className="border-b border-slate-200 px-4 py-6 sm:px-8 sm:py-9">
            <SectionHeading
              eyebrow="Roadmap strategy"
              title="Why this roadmap"
              icon={<Sparkles className="h-4 w-4" />}
            />

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:rounded-3xl sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                  Strategy
                </p>

                <p className="mt-3 break-words text-sm leading-6 text-slate-700">
                  {roadmap.roadmap_strategy.summary}
                </p>

                {roadmap.roadmap_strategy.why_this_roadmap ? (
                  <div className="mt-5 border-t border-indigo-100 pt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                      Personalization logic
                    </p>

                    <p className="mt-2 break-words text-sm leading-6 text-slate-700">
                      {roadmap.roadmap_strategy.why_this_roadmap}
                    </p>
                  </div>
                ) : null}
              </article>

              <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:rounded-3xl sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Approach
                </p>

                {roadmap.roadmap_strategy.approach.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {roadmap.roadmap_strategy.approach.map(
                      (item, index) => (
                        <div
                          key={`${index}-${item}`}
                          className="flex items-start gap-3"
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-black text-indigo-600 ring-1 ring-slate-200">
                            {index + 1}
                          </span>

                          <p className="break-words text-xs leading-5 text-slate-600">
                            {item}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-slate-500">
                    No specific approach was provided.
                  </p>
                )}
              </article>
            </div>

            {roadmap.roadmap_strategy.priorities.length > 0 ||
            roadmap.roadmap_strategy.constraints.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <RoadmapListCard
                  icon={<Target className="h-4 w-4" />}
                  title="Priority focus"
                  items={roadmap.roadmap_strategy.priorities}
                />

                <RoadmapListCard
                  icon={<Clock3 className="h-4 w-4" />}
                  title="Planning constraints"
                  items={roadmap.roadmap_strategy.constraints}
                />
              </div>
            ) : null}
          </section>

          {/* SKILL MAP */}
          <section className="border-b border-slate-200 px-4 py-6 sm:px-8 sm:py-9">
            <SectionHeading
              eyebrow="Skill map"
              title="What to strengthen for the target role"
              icon={<Code2 aria-hidden="true" className="h-4 w-4" />}
            />

            {roadmap.skill_map.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {roadmap.skill_map.map((item, index) => (
                  <SkillMapCard
                    key={`${index}-${item.skill}`}
                    skill={item}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="No skill map was provided." />
            )}
          </section>

          {/* CAREER JOURNEY */}
          <section className="px-4 py-6 sm:px-8 sm:py-9">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Step-by-step plan
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                  Your career journey
                </h2>
              </div>

              <span className="hidden text-right text-xs text-slate-500 sm:block">
                Learn → Practice → Build → Prove
              </span>
            </div>

            {roadmap.phases.length > 0 ? (
              <div className="mt-7 space-y-6">
                {roadmap.phases.map((phase, index) => (
                  <RoadmapPhaseCard
                    key={`${phase.phase}-${phase.title}`}
                    phase={phase}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="No roadmap phases were provided." />
            )}
          </section>

          {/* WEEKLY PLAN + PORTFOLIO */}
          <section className="grid gap-4 border-t border-slate-200 bg-slate-50/50 p-5 sm:grid-cols-2 sm:p-8">
            <WeeklyRoutineCard items={roadmap.weekly_routine} />

            <PortfolioOutcomesCard
              items={roadmap.portfolio_outcomes}
            />
          </section>

          {/* CAREER READINESS */}
          <section className="border-t border-slate-200 px-5 py-7 sm:px-8 sm:py-9">
            <SectionHeading
              eyebrow="Career readiness"
              title="What readiness looks like"
              icon={<BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />}
            />

            {roadmap.career_readiness.length > 0 ? (
              <div className="mt-5 space-y-3">
                {roadmap.career_readiness.map((item, index) => (
                  <CareerReadinessCard
                    key={`${index}-${item.area}`}
                    item={item}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="No career readiness guidance was provided." />
            )}
          </section>

          {/* FINAL READINESS */}
          <section className="border-t border-slate-200 px-5 py-7 sm:px-8 sm:py-9">
            <SectionHeading
              eyebrow="Final check"
              title="Final readiness checklist"
              icon={<ShieldCheck aria-hidden="true" className="h-4 w-4" />}
            />

            {roadmap.final_readiness_checklist.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {roadmap.final_readiness_checklist.map(
                  (item, index) => (
                    <div
                      key={`${index}-${item}`}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check
                          className="h-3.5 w-3.5"
                          strokeWidth={2.5}
                        />
                      </span>

                      <p className="break-words text-sm leading-5 text-slate-700">
                        {item}
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <EmptyState text="No final readiness checks were provided." />
            )}
          </section>

          {/* HOW CAREERMAP BUILT THIS */}
          {roadmap.grounding_notes.length > 0 ? (
            <section className="border-t border-slate-200 bg-white px-5 py-7 sm:px-8 sm:py-8">
              <SectionHeading
                eyebrow="Transparency"
                title="How CareerMap built this"
                icon={<ShieldCheck className="h-4 w-4" />}
              />

              <div className="mt-4 space-y-2">
                {roadmap.grounding_notes.map((note, index) => (
                  <p
                    key={`${index}-${note}`}
                    className="text-xs leading-5 text-slate-500"
                  >
                    {note}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          {/* NEXT ACTION */}
          <section className="border-t border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Your next action
                </p>

                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  {roadmap.next_action.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {roadmap.next_action.description}
                </p>

                {roadmap.next_action.reason ? (
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    <span className="font-bold text-slate-700">
                      Why now:
                    </span>{" "}
                    {roadmap.next_action.reason}
                  </p>
                ) : null}
              </div>

              {typeof roadmap.next_action.estimated_minutes ===
              "number" ? (
                <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600">
                  <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                  {roadmap.next_action.estimated_minutes} min
                </span>
              ) : null}
            </div>
          </section>

          {/* ACTION FOOTER */}
          <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-100 px-4 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Your roadmap is stored only in this temporary CareerMap session.
              </p>

              {generatedAt ? (
                <p className="mt-1 text-[10px] text-slate-500">
                  Generated {formatRoadmapDate(generatedAt)}
                </p>
              ) : null}
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              {cameFromAnalyzer ? (
                <button
                  type="button"
                  onClick={() => navigate("/analyzer")}
                  aria-label="Return to the Resume and JD Analyzer"
                  className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/15 sm:min-h-10 sm:w-auto"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Resume &amp; JD Analyzer
                </button>
              ) : null}

              <button
                type="button"
                onClick={onStartOver}
                aria-label="Start another CareerMap roadmap"
                className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/15 sm:min-h-10 sm:w-auto"
              >
                Build another roadmap
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  icon,
}: {
  eyebrow: string;
  title: string;
  icon: ReactNode;
}) {
  const headingId = `roadmap-section-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;

  return (
    <div>
      <div className="flex items-center gap-2 text-indigo-600">
        {icon}

        <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
          {eyebrow}
        </p>
      </div>

      <h2 id={headingId} className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  items,
  tone,
  emptyLabel,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  tone: "positive" | "attention";
  emptyLabel: string;
}) {
  const toneClasses =
    tone === "positive"
      ? "border-emerald-100 bg-emerald-50/60 text-emerald-700"
      : "border-amber-100 bg-amber-50/60 text-amber-700";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl border ${toneClasses}`}
        >
          {icon}
        </span>

        <h3 className="text-sm font-black text-slate-950">{title}</h3>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {items.map((item, index) => (
            <div
              key={`${index}-${item}`}
              className="flex items-start gap-2.5"
            >
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />

              <p className="text-xs leading-5 text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          {emptyLabel}
        </p>
      )}
    </article>
  );
}

function SkillMapCard({
  skill,
}: {
  skill: GeneratedRoadmap["skill_map"][number];
}) {
  const statusClasses = getSkillStatusClasses(skill.status);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-bold text-slate-900">
            {skill.skill}
          </h3>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            {skill.reason}
          </p>
        </div>

        <span
          className={[
            "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold capitalize",
            statusClasses,
          ].join(" ")}
        >
          {skill.status.replace("-", " ")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Current
          </p>

          <p className="mt-1 text-[10px] font-semibold text-slate-700">
            {skill.current_level || "Not provided"}
          </p>
        </div>

        <div className="rounded-xl bg-indigo-50/70 p-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-indigo-500">
            Target
          </p>

          <p className="mt-1 text-[10px] font-semibold text-indigo-800">
            {skill.target_level || "Not provided"}
          </p>
        </div>
      </div>
    </article>
  );
}

function getSkillStatusClasses(
  status: GeneratedRoadmap["skill_map"][number]["status"],
) {
  switch (status) {
    case "strength":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "developing":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "priority-gap":
      return "border-amber-100 bg-amber-50 text-amber-700";
    case "target":
      return "border-indigo-100 bg-indigo-50 text-indigo-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function WeeklyRoutineCard({
  items,
}: {
  items: GeneratedRoadmap["weekly_routine"];
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Clock3 className="h-4 w-4" />
        </span>

        <h3 className="text-sm font-black text-slate-950">
          Weekly study plan
        </h3>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={`${index}-${item.day}-${item.focus}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-900">{item.day}</p>

                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-semibold text-slate-500">
                  {item.estimated_minutes} min
                </span>
              </div>

              <p className="mt-1.5 text-xs font-semibold text-indigo-700">
                {item.focus}
              </p>

              {item.activities.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  {item.activities.map(
                    (activity, activityIndex) => (
                      <p
                        key={`${activityIndex}-${activity}`}
                        className="text-[11px] leading-4.5 text-slate-600"
                      >
                        • {activity}
                      </p>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-500">
          No weekly routine was specified.
        </p>
      )}
    </article>
  );
}

function PortfolioOutcomesCard({
  items,
}: {
  items: GeneratedRoadmap["portfolio_outcomes"];
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <BriefcaseBusiness className="h-4 w-4" />
        </span>

        <h3 className="text-sm font-black text-slate-950">
          Portfolio proof
        </h3>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={`${index}-${item.title}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <h4 className="text-xs font-bold text-slate-900">
                {item.title}
              </h4>

              <p className="mt-1.5 text-[11px] leading-5 text-slate-600">
                {item.description}
              </p>

              {item.skills_demonstrated.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.skills_demonstrated.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-[8px] font-semibold text-indigo-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}

              {item.evidence.length > 0 ? (
                <div className="mt-3 space-y-1">
                  {item.evidence.map(
                    (evidence, evidenceIndex) => (
                      <p
                        key={`${evidenceIndex}-${evidence}`}
                        className="text-[10px] leading-4 text-slate-500"
                      >
                        • {evidence}
                      </p>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-500">
          No portfolio outcomes were specified.
        </p>
      )}
    </article>
  );
}

function CareerReadinessCard({
  item,
}: {
  item: GeneratedRoadmap["career_readiness"][number];
}) {
  const statusMap = {
    ready: "border-emerald-100 bg-emerald-50 text-emerald-700",
    developing: "border-amber-100 bg-amber-50 text-amber-700",
    "not-started": "border-slate-200 bg-slate-50 text-slate-600",
  } as const;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">
            {item.area}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-slate-600">
            {item.current_state}
          </p>
        </div>

        <span
          className={[
            "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold capitalize",
            statusMap[item.status],
          ].join(" ")}
        >
          {item.status.replace("-", " ")}
        </span>
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Action
        </p>

        <p className="mt-1 text-[11px] leading-4.5 text-slate-600">
          {item.action}
        </p>
      </div>
    </article>
  );
}

function RoadmapListCard({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </span>

        <h3 className="text-sm font-black text-slate-950">{title}</h3>
      </div>

      <div className="mt-4 space-y-2.5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${index}-${item}`}
              className="flex items-start gap-2.5"
            >
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />

              <p className="text-xs leading-5 text-slate-600">{item}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500">Nothing was specified.</p>
        )}
      </div>
    </article>
  );
}

function buildRoadmapFilename(targetRole: string): string {
  const safeRole = targetRole
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return safeRole
    ? `careermap-${safeRole}-roadmap.pdf`
    : "careermap-career-roadmap.pdf";
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
      <p className="break-words text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}
