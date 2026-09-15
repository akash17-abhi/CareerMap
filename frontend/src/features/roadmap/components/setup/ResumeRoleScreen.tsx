import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Search,
} from "lucide-react";

import {
  Badge,
  SetupShell,
  Spinner,
} from "../shared/RoadmapUI";

import ChoiceButton from "./ChoiceButton";

interface ResumeRoleScreenProps {
  resumeFile: File | null;
  extractionReady: boolean;
  role: string;
  customRole: string;
  suggestions: string[];

  onRoleChange: (value: string) => void;
  onSuggestion: (value: string) => void;
  onCustomRoleChange: (value: string) => void;

  onBack: () => void;
  onGenerate: () => void;

  isGenerating: boolean;
  generationError: string | null;
  generationSuccess: boolean;
}

export default function ResumeRoleScreen({
  resumeFile,
  extractionReady,
  role,
  customRole,
  suggestions,
  onRoleChange,
  onSuggestion,
  onCustomRoleChange,
  onBack,
  onGenerate,
  isGenerating,
  generationError,
  generationSuccess,
}: ResumeRoleScreenProps) {
  const effectiveRole =
    role.trim() || customRole.trim();

  return (
    <SetupShell>
      <div className="w-full">
        {/* Back navigation */}
        <button
          type="button"
          onClick={onBack}
          disabled={isGenerating}
          className="group inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:text-slate-950 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10 sm:rounded-xl sm:px-3.5 sm:text-xs"
        >
          <ArrowLeft
            className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:-translate-x-0.5"
            strokeWidth={1.9}
          />

          Back
        </button>

        {/* Main card */}
        <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.055)] sm:mt-7 sm:rounded-[1.75rem] sm:shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {/* Resume status */}
          <div className="border-b border-slate-100 px-4 py-4 sm:px-8 sm:py-5">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 sm:rounded-2xl sm:px-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100 sm:h-9 sm:w-9 sm:rounded-xl">
                <CheckCircle2
                  className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                  strokeWidth={1.9}
                />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700 sm:text-[10px]">
                  {extractionReady
                    ? "Resume extracted"
                    : "Resume selected"}
                </p>

                <p className="mt-0.5 truncate text-[10px] font-semibold text-emerald-950 sm:text-[11px]">
                  {resumeFile?.name || "Your resume"}
                </p>
              </div>

              <CheckCircle2
                className="ml-auto hidden h-4 w-4 shrink-0 text-emerald-500 sm:block"
                strokeWidth={1.9}
              />
            </div>
          </div>

          {/* Header */}
          <div className="px-4 pb-5 pt-5 sm:px-8 sm:pb-7 sm:pt-7">
            <Badge>
              <Search
                className="h-3.5 w-3.5"
                strokeWidth={1.9}
              />

              Target job role
            </Badge>

            <h1 className="mt-4 text-[1.85rem] font-bold leading-[1.06] tracking-[-0.04em] text-slate-950 sm:mt-5 sm:text-[2.5rem]">
              What role are you aiming for?
            </h1>

            <p className="mt-3 max-w-xl text-[13px] leading-5.5 text-slate-500 sm:mt-4 sm:text-[15px] sm:leading-7">
              Choose the role you want to prepare
              for. CareerMap will use it to
              personalize your roadmap.
            </p>
          </div>

          {/* Role selection */}
          <div className="px-4 pb-5 sm:px-8 sm:pb-8">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold text-slate-900 sm:text-xs">
                  Suggested roles
                </p>

                <span className="text-[9px] font-medium text-slate-400 sm:text-[10px]">
                  Choose one
                </span>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <ChoiceButton
                    key={suggestion}
                    selected={
                      role.toLowerCase() ===
                      suggestion.toLowerCase()
                    }
                    onClick={() =>
                      onSuggestion(suggestion)
                    }
                  >
                    {suggestion}
                  </ChoiceButton>
                ))}
              </div>
            </div>

            {/* Custom role */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/65 p-3.5 sm:mt-6 sm:p-4">
              <label
                htmlFor="roadmap-target-role"
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-[11px]"
              >
                <Search
                  className="h-3.5 w-3.5"
                  strokeWidth={1.9}
                />

                Or enter your own role
              </label>

              <input
                id="roadmap-target-role"
                value={customRole || role}
                onChange={(event) => {
                  const value = event.target.value;

                  onCustomRoleChange(value);
                  onRoleChange(value);
                }}
                placeholder="e.g. AI Engineer"
                disabled={isGenerating}
                autoComplete="off"
                className="mt-2.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70 sm:min-h-12 sm:text-sm"
              />

              <p className="mt-2 text-[9px] leading-4 text-slate-400 sm:text-[10px]">
                You can enter any specific role you
                want to target.
              </p>
            </div>

            {/* Error */}
            {generationError && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 ring-1 ring-rose-100">
                  <span className="text-xs font-bold">
                    !
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-rose-900 sm:text-[11px]">
                    Roadmap generation failed
                  </p>

                  <p className="mt-0.5 text-[9px] leading-4 text-rose-700/80 sm:text-[11px] sm:leading-4.5">
                    {generationError}
                  </p>
                </div>
              </div>
            )}

            {/* Success */}
            {generationSuccess &&
              !generationError && (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    strokeWidth={1.9}
                  />

                  <p className="text-[9px] font-semibold leading-4 text-emerald-700 sm:text-[11px] sm:leading-4.5">
                    Roadmap generated successfully.
                    It is stored only in your temporary
                    CareerMap session.
                  </p>
                </div>
              )}

            {/* Actions */}
            <div className="mt-5 grid grid-cols-1 gap-2 sm:mt-6 sm:flex sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isGenerating}
                onClick={onBack}
                className="order-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-bold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:order-1 sm:w-auto sm:text-xs"
              >
                <ArrowLeft
                  className="h-3.5 w-3.5"
                  strokeWidth={1.9}
                />

                Change resume
              </button>

              <button
                type="button"
                disabled={
                  !effectiveRole || isGenerating
                }
                onClick={onGenerate}
                className="order-1 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-[11px] font-bold text-white shadow-[0_8px_22px_rgba(79,70,229,0.16)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-[0_12px_28px_rgba(79,70,229,0.2)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 sm:order-2 sm:w-auto sm:text-xs"
              >
                {isGenerating
                  ? "Building your roadmap…"
                  : "Generate Roadmap"}

                {isGenerating ? (
                  <Spinner />
                ) : (
                  <ArrowRight
                    className="h-3.5 w-3.5"
                    strokeWidth={1.9}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SetupShell>
  );
}