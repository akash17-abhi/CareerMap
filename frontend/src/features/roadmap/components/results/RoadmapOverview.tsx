import type { ReactNode } from "react";

import {
  CheckCircle2,
  Clock3,
  GraduationCap,
  Hammer,
  Target,
} from "lucide-react";

import type { GeneratedRoadmap } from "../../types/roadmap";

interface RoadmapOverviewProps {
  roadmap: GeneratedRoadmap;
}

export default function RoadmapOverview({
  roadmap,
}: RoadmapOverviewProps) {
  const snapshot = roadmap.career_snapshot;

  return (
    <section
      aria-label="Career roadmap overview"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <OverviewCard
        icon={<Target className="h-4 w-4" />}
        label="Target role"
        value={
          snapshot.target_role ||
          roadmap.target_role ||
          "Not provided"
        }
      />

      <OverviewCard
        icon={<GraduationCap className="h-4 w-4" />}
        label="Current level"
        value={
          snapshot.current_level ||
          "Not provided"
        }
      />

      <OverviewCard
        icon={<Clock3 className="h-4 w-4" />}
        label="Learning time"
        value={
          snapshot.learning_time_per_week ||
          "Not provided"
        }
      />

      <OverviewCard
        icon={<CheckCircle2 className="h-4 w-4" />}
        label="Target timeline"
        value={
          snapshot.target_timeline ||
          "Not provided"
        }
      />

      <OverviewDetail
        label="Career goal"
        value={
          snapshot.career_goal ||
          "Not provided"
        }
      />

      <OverviewDetail
        label="Education"
        value={
          snapshot.education ||
          "Not provided"
        }
      />

      <OverviewDetail
        label="Experience"
        value={
          snapshot.experience ||
          "Not provided"
        }
      />

      <OverviewDetail
        label="Learning preferences"
        value={
          snapshot.learning_preferences.length > 0
            ? snapshot.learning_preferences.join(", ")
            : "Not provided"
        }
      />

      <div className="sm:col-span-2 lg:col-span-4">
        <article className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-[0_4px_18px_rgba(79,70,229,0.035)] sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-indigo-100">
              <Hammer
                className="h-4 w-4"
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                Profile summary
              </p>

              <p className="mt-1.5 break-words text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
                {roadmap.profile_summary}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function OverviewCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.055)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-200 transition-colors duration-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:ring-indigo-100 motion-reduce:transition-none">
          {icon}
        </span>

        <p className="min-w-0 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-3 break-words text-xs font-bold leading-5 text-slate-800">
        {value}
      </p>
    </article>
  );
}

function OverviewDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 motion-reduce:transition-none">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-xs font-semibold leading-5 text-slate-700">
        {value}
      </p>
    </article>
  );
}
