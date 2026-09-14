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
      <button
        type="button"
        onClick={onBack}
        disabled={isGenerating}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowLeft
          className="h-3.5 w-3.5"
          strokeWidth={1.9}
        />

        Back
      </button>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.055)] sm:p-7">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3.5 py-3">
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-emerald-600"
            strokeWidth={1.9}
          />

          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700">
              {extractionReady
                ? "Resume extracted"
                : "Resume selected"}
            </p>

            <p className="mt-0.5 truncate text-[10px] font-semibold text-emerald-900">
              {resumeFile?.name || "Your resume"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Badge>
            <Search
              className="h-3.5 w-3.5"
              strokeWidth={1.9}
            />

            Target job role
          </Badge>
        </div>

        <h1 className="mt-4 text-[1.8rem] font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-3xl">
          What role are you aiming for?
        </h1>

        <p className="mt-2.5 text-xs leading-5.5 text-slate-500 sm:text-sm sm:leading-6">
          Choose a role suggestion or type
          your own. We keep typing to the
          absolute minimum.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
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

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
          <label
            htmlFor="roadmap-target-role"
            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500"
          >
            <Search
              className="h-3.5 w-3.5"
              strokeWidth={1.9}
            />

            Your role
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
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
          />
        </div>

        {generationError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5"
          >
            <p className="text-[9px] font-semibold leading-4 text-rose-700">
              {generationError}
            </p>
          </div>
        )}

        {generationSuccess &&
          !generationError && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5"
            >
              <p className="text-[9px] font-semibold leading-4 text-emerald-700">
                Roadmap generated successfully.
                It is stored in your temporary
                CareerMap session.
              </p>
            </div>
          )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isGenerating}
            onClick={onBack}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Change resume
          </button>

          <button
            type="button"
            disabled={!effectiveRole || isGenerating}
            onClick={onGenerate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 text-[10px] font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,0.16)] outline-none transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20"
          >
            {isGenerating
              ? "Building your roadmap…"
              : "Generate Personalised Roadmap"}

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
    </SetupShell>
  );
}