import type { MutableRefObject } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  Badge,
  SetupShell,
  Spinner,
} from "../shared/RoadmapUI";

interface ResumeUploadScreenProps {
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  resumeFile: File | null;
  isExtracting: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onOpenPicker: () => void;
  onFileSelected: (file: File | null) => void;
}

function ResumeUploadScreen({
  fileInputRef,
  resumeFile,
  isExtracting,
  errorMessage,
  onBack,
  onOpenPicker,
  onFileSelected,
}: ResumeUploadScreenProps) {
  return (
    <SetupShell>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10"
      >
        <ArrowLeft
          className="h-3.5 w-3.5"
          strokeWidth={1.9}
        />
        Back
      </button>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.055)] sm:p-7">
        <Badge>
          <FileText
            className="h-3.5 w-3.5"
            strokeWidth={1.9}
          />
          Resume setup
        </Badge>

        <h1 className="mt-4 text-[1.8rem] font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-3xl">
          Upload your resume.
        </h1>

        <p className="mt-2.5 text-xs leading-5.5 text-slate-500 sm:text-sm sm:leading-6">
          We’ll use your resume as the source
          of your profile. You will not be asked
          to re-enter education, experience,
          skills, or projects.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(event) => {
            onFileSelected(
              event.target.files?.[0] ?? null,
            );

            event.currentTarget.value = "";
          }}
        />

        <button
          type="button"
          onClick={onOpenPicker}
          disabled={isExtracting}
          aria-busy={isExtracting}
          className={[
            "mt-6 flex min-h-48 w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed px-5 text-center outline-none transition",
            isExtracting
              ? "border-indigo-200 bg-indigo-50/50"
              : resumeFile
                ? "border-emerald-200 bg-emerald-50/40"
                : "border-slate-200 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/40",
            "focus-visible:ring-4 focus-visible:ring-indigo-500/10",
            "disabled:cursor-not-allowed",
          ].join(" ")}
        >
          <div
            className={[
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              resumeFile
                ? "bg-emerald-100 text-emerald-700"
                : "bg-white text-indigo-600 ring-1 ring-slate-200",
            ].join(" ")}
          >
            {isExtracting ? (
              <Spinner />
            ) : resumeFile ? (
              <CheckCircle2
                className="h-6 w-6"
                strokeWidth={1.9}
              />
            ) : (
              <Upload
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            )}
          </div>

          {isExtracting ? (
            <>
              <p className="mt-4 text-xs font-bold text-indigo-900">
                Preparing your resume…
              </p>

              <p className="mt-1 text-[9px] text-indigo-700/70">
                You’ll only be asked for the target role next.
              </p>
            </>
          ) : resumeFile ? (
            <>
              <p className="mt-4 max-w-full truncate px-4 text-xs font-bold text-emerald-900">
                {resumeFile.name}
              </p>

              <p className="mt-1 text-[9px] text-emerald-700/75">
                Resume selected
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 text-xs font-bold text-slate-900">
                Choose your resume
              </p>

              <p className="mt-1 text-[9px] text-slate-500">
                PDF, DOCX, or DOC • up to 10 MB
              </p>
            </>
          )}
        </button>

        {errorMessage && (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5"
          >
            <p className="text-[9px] font-semibold leading-4 text-rose-700">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-3">
          <ShieldCheck
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600"
            strokeWidth={1.9}
          />

          <p className="text-[9px] leading-4 text-indigo-800">
            We keep the interaction minimal:
            upload → choose target role →
            generate roadmap.
          </p>
        </div>
      </div>
    </SetupShell>
  );
}

export default ResumeUploadScreen;