import { Check } from "lucide-react";

import type { RoadmapProfile } from "../../types/roadmap";

import { MiniValue } from "./RoadmapUI";

export default function ProfileProgressPanel({
  step,
  stepCopy,
  profile,
}: {
  step: number;
  stepCopy: string[][];
  profile: RoadmapProfile;
}) {
  return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Your profile
      </p>

      <div className="mt-3 space-y-2">
        {stepCopy.map(([label], index) => {
          const itemStep = index + 1;

          const completed =
            itemStep < step;

          const current =
            itemStep === step;

          return (
            <div
              key={label}
              className="flex items-center gap-2"
            >
              <span
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold",
                  completed
                    ? "bg-emerald-100 text-emerald-700"
                    : current
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-400 ring-1 ring-slate-200",
                ].join(" ")}
              >
                {completed ? (
                  <Check className="h-3 w-3" />
                ) : (
                  itemStep
                )}
              </span>

              <span
                className={[
                  "truncate text-[9px] font-semibold",
                  current
                    ? "text-slate-900"
                    : completed
                      ? "text-slate-600"
                      : "text-slate-400",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-white bg-white p-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Already captured
        </p>

        <div className="mt-2 space-y-1.5">
          <MiniValue
            label="Role"
            value={
              profile.preferredRole ||
              "—"
            }
          />

          <MiniValue
            label="Skills"
            value={
              profile.skills.length
                ? `${profile.skills.length} selected`
                : "—"
            }
          />

          <MiniValue
            label="Projects"
            value={
              profile.projects.length
                ? `${profile.projects.length} added`
                : "None"
            }
          />
        </div>
      </div>
    </div>
  );
}