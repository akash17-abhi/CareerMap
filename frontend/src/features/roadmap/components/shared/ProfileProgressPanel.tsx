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
  const safeStep = Math.min(
    Math.max(step, 1),
    stepCopy.length,
  );

  const completedCount = Math.max(
    safeStep - 1,
    0,
  );

  const progressPercentage =
    stepCopy.length > 0
      ? Math.round(
          (completedCount /
            stepCopy.length) *
            100,
        )
      : 0;

  return (
    <aside
      aria-label="Profile progress"
      className="sticky top-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
    >
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-indigo-600">
              Your profile
            </p>

            <h2 className="mt-1 text-sm font-bold tracking-tight text-slate-900">
              Roadmap setup
            </h2>

            <p className="mt-1 text-[9px] leading-4 text-slate-500">
              Your answers shape the learning path.
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700">
            <span className="text-[10px] font-bold leading-none">
              {safeStep}
            </span>

            <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-wide text-indigo-500">
              of {stepCopy.length}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[8px] font-semibold text-slate-400">
              Progress
            </span>

            <span className="text-[8px] font-bold text-slate-600">
              {progressPercentage}%
            </span>
          </div>

          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercentage}
            aria-label={`Profile setup ${progressPercentage}% complete`}
          >
            <div
              className="h-full rounded-full bg-indigo-600 transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="px-4 py-4">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Steps
        </p>

        <div className="relative mt-3">
          {/* Connecting line */}
          <div
            aria-hidden="true"
            className="absolute bottom-3 left-[11px] top-3 w-px bg-slate-200"
          />

          <ol className="relative space-y-1" aria-label="Profile setup steps">
            {stepCopy.map(([label], index) => {
              const itemStep = index + 1;
              const completed = itemStep < safeStep;
              const current = itemStep === safeStep;

              return (
                <li
                  key={`${itemStep}-${label}`}
                  aria-current={current ? "step" : undefined}
                  className={[
                    "relative flex min-h-9 items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors duration-200 motion-reduce:transition-none",
                    current
                      ? "bg-indigo-50/70"
                      : "bg-transparent",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ring-4 ring-white transition-all duration-200 motion-reduce:transition-none",
                      completed
                        ? "bg-emerald-100 text-emerald-700"
                        : current
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-400 ring-slate-50",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {completed ? (
                      <Check
                        className="h-3 w-3"
                        strokeWidth={2.4}
                      />
                    ) : (
                      itemStep
                    )}
                  </span>

                  <span
                    className={[
                      "min-w-0 truncate text-[9px] leading-4 transition-colors duration-200 motion-reduce:transition-none",
                      current
                        ? "font-bold text-slate-900"
                        : completed
                          ? "font-semibold text-slate-600"
                          : "font-medium text-slate-400",
                    ].join(" ")}
                  >
                    {label}
                  </span>

                  {current ? (
                    <span
                      className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Captured information */}
      <div className="border-t border-slate-200 px-4 py-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Already captured
              </p>

              <p className="mt-0.5 text-[9px] text-slate-500">
                Useful details collected so far.
              </p>
            </div>

            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 ring-1 ring-slate-200">
              <Check
                className="h-3.5 w-3.5"
                strokeWidth={2.3}
                aria-hidden="true"
              />
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            <div className="min-w-0 rounded-lg border border-white bg-white px-2.5 py-2">
              <MiniValue
                label="Role"
                value={
                  profile.preferredRole ||
                  "Not selected"
                }
              />
            </div>

            <div className="min-w-0 rounded-lg border border-white bg-white px-2.5 py-2">
              <MiniValue
                label="Skills"
                value={
                  profile.skills.length
                    ? `${profile.skills.length} selected`
                    : "None selected"
                }
              />
            </div>

            <div className="min-w-0 rounded-lg border border-white bg-white px-2.5 py-2">
              <MiniValue
                label="Projects"
                value={
                  profile.projects.length
                    ? `${profile.projects.length} added`
                    : "None yet"
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy note */}
      <div className="border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
            aria-hidden="true"
          />

          <p className="text-[8px] leading-4 text-slate-400">
            Your profile answers stay temporary in
            this session.
          </p>
        </div>
      </div>
    </aside>
  );
}
