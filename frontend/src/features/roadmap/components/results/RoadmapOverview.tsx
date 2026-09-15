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
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        <article className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-indigo-100">
              <Hammer className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                Profile summary
              </p>

              <p className="mt-1.5 text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
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
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-200">
          {icon}
        </span>

        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
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
    <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-xs font-semibold leading-5 text-slate-700">
        {value}
      </p>
    </article>
  );
}