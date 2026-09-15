import type { MutableRefObject } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  LockKeyhole,
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
      <div className="w-full">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          disabled={isExtracting}
          className="group inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10 sm:rounded-xl sm:px-3.5 sm:text-xs"
        >
          <ArrowLeft
            className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:-translate-x-0.5"
            strokeWidth={1.9}
          />

          Back
        </button>

        {/* Main card */}
        <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.055)] sm:mt-7 sm:rounded-[1.75rem] sm:shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {/* Header */}
          <div className="px-4 pb-5 pt-5 sm:px-8 sm:pb-7 sm:pt-8">
            <Badge>
              <FileText
                className="h-3.5 w-3.5"
                strokeWidth={1.9}
              />

              Resume setup
            </Badge>

            <h1 className="mt-4 text-[1.75rem] font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:mt-5 sm:text-[2.5rem]">
              Start with your resume.
            </h1>

            <p className="mt-3 max-w-xl text-[13px] leading-5.5 text-slate-500 sm:mt-4 sm:text-[15px] sm:leading-7">
              Upload your resume and CareerMap will
              extract the information needed to build
              your career profile.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100" />

          {/* Content */}
          <div className="px-4 py-5 sm:px-8 sm:py-8">
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

            {/* Upload box */}
            <button
              type="button"
              onClick={onOpenPicker}
              disabled={isExtracting}
              aria-busy={isExtracting}
              className={[
                "group relative flex min-h-[230px] w-full flex-col items-center justify-center overflow-hidden rounded-[1.25rem] border-2 border-dashed px-4 py-6 text-center outline-none transition-all duration-300 sm:min-h-[300px] sm:rounded-[1.5rem] sm:px-5 sm:py-8",
                "focus-visible:ring-4 focus-visible:ring-indigo-500/10",
                "disabled:cursor-not-allowed",
                isExtracting
                  ? "border-indigo-200 bg-indigo-50/60"
                  : resumeFile
                    ? "border-emerald-200 bg-emerald-50/45 hover:border-emerald-300 hover:bg-emerald-50/60"
                    : "border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/35",
              ].join(" ")}
            >
              {/* Background glow */}
              {!resumeFile && !isExtracting && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/30 blur-3xl sm:h-44 sm:w-44"
                />
              )}

              {/* Icon */}
              <div
                className={[
                  "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 sm:h-16 sm:w-16",
                  isExtracting
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100"
                    : resumeFile
                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-indigo-200",
                ].join(" ")}
              >
                {isExtracting ? (
                  <Spinner />
                ) : resumeFile ? (
                  <CheckCircle2
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    strokeWidth={1.8}
                  />
                ) : (
                  <Upload
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    strokeWidth={1.8}
                  />
                )}
              </div>

              {/* Loading */}
              {isExtracting ? (
                <div className="relative max-w-[280px]">
                  <p className="mt-4 text-[13px] font-bold text-indigo-950 sm:mt-5 sm:text-[15px]">
                    Preparing your resume…
                  </p>

                  <p className="mt-1.5 text-[10px] leading-4.5 text-indigo-700/70 sm:mt-2 sm:text-xs sm:leading-5">
                    Extracting your profile information.
                  </p>
                </div>
              ) : resumeFile ? (
                /* Selected */
                <div className="relative w-full">
                  <p className="mx-auto mt-4 max-w-[85%] truncate text-[13px] font-bold text-emerald-950 sm:mt-5 sm:max-w-[90%] sm:text-[15px]">
                    {resumeFile.name}
                  </p>

                  <p className="mt-1.5 text-[10px] font-medium text-emerald-700 sm:mt-2 sm:text-xs">
                    Resume selected successfully
                  </p>

                  <span className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 text-[10px] font-bold text-emerald-700 shadow-sm sm:mt-4 sm:min-h-9 sm:rounded-xl sm:px-3.5 sm:text-[11px]">
                    Choose another file

                    <ArrowRight
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                      strokeWidth={2}
                    />
                  </span>
                </div>
              ) : (
                /* Empty */
                <div className="relative">
                  <p className="mt-4 text-[14px] font-bold text-slate-950 sm:mt-5 sm:text-base">
                    Choose your resume
                  </p>

                  <p className="mt-1.5 text-[10px] leading-4.5 text-slate-500 sm:mt-2 sm:text-xs sm:leading-5">
                    PDF, DOC, or DOCX
                  </p>

                  <span className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-[10px] font-bold text-white shadow-sm transition-all duration-200 group-hover:bg-indigo-700 group-hover:shadow-md sm:mt-4 sm:min-h-10 sm:rounded-xl sm:px-4 sm:text-[11px]">
                    Browse files

                    <ArrowRight
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                      strokeWidth={2}
                    />
                  </span>

                  <p className="mt-3 text-[9px] font-medium text-slate-400 sm:mt-4 sm:text-[10px]">
                    Maximum file size: 10 MB
                  </p>
                </div>
              )}
            </button>

            {/* Error */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 sm:mt-4 sm:gap-3 sm:px-4 sm:py-3.5"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 ring-1 ring-rose-100">
                  <span className="text-xs font-bold">
                    !
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-rose-900 sm:text-[11px]">
                    We couldn’t process that resume
                  </p>

                  <p className="mt-0.5 text-[9px] leading-4 text-rose-700/80 sm:text-[11px] sm:leading-4.5">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Privacy */}
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/55 px-3 py-3.5 sm:mt-5 sm:rounded-2xl sm:px-5 sm:py-4">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100 sm:h-9 sm:w-9 sm:rounded-xl">
                  <ShieldCheck
                    className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                    strokeWidth={1.9}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <p className="text-[10px] font-bold text-emerald-950 sm:text-[12px]">
                      Your resume stays temporary
                    </p>

                    <span className="hidden h-1 w-1 rounded-full bg-emerald-300 sm:block" />

                    <span className="text-[9px] font-medium text-emerald-700 sm:text-[11px]">
                      Privacy-first processing
                    </span>
                  </div>

                  <p className="mt-1 text-[9px] leading-4 text-emerald-800/75 sm:text-[11px] sm:leading-5.5">
                    Your resume is used only to create
                    your temporary roadmap profile.
                  </p>
                </div>

                <LockKeyhole
                  className="mt-0.5 hidden h-4 w-4 shrink-0 text-emerald-500 sm:block"
                  strokeWidth={1.8}
                />
              </div>
            </div>

            {/* Process */}
            <div className="mt-4 flex items-center justify-center gap-1.5 px-1 text-center text-[9px] font-medium leading-4 text-slate-400 sm:mt-6 sm:gap-2 sm:text-[11px] sm:leading-5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />

              <span>
                Upload → choose target role → generate
                roadmap
              </span>
            </div>
          </div>
        </div>
      </div>
    </SetupShell>
  );
}

export default ResumeUploadScreen;