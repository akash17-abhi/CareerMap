import { LockKeyhole } from "lucide-react";

export default function PrivacyNotice() {
  return (
    <div
      className="
        mx-auto mt-3 flex w-full max-w-5xl
        flex-wrap items-center justify-center
        gap-x-2.5 gap-y-1.5
        px-2 text-center
        text-[9px] leading-4
        text-slate-500
        sm:mt-4 sm:gap-x-3 sm:text-[10px]
      "
      role="note"
      aria-label="Privacy and processing information"
    >
      <span
        className="
          inline-flex items-center gap-1.5
          whitespace-nowrap
          font-medium text-slate-600
        "
      >
        <LockKeyhole
          className="h-3 w-3 shrink-0 text-emerald-600"
          strokeWidth={1.9}
          aria-hidden="true"
        />

        <span>Privacy-first processing</span>
      </span>

      <span
        aria-hidden="true"
        className="hidden text-slate-300 sm:inline"
      >
        •
      </span>

      <span className="whitespace-nowrap">
        No account required
      </span>

      <span
        aria-hidden="true"
        className="hidden text-slate-300 sm:inline"
      >
        •
      </span>

      <span className="max-w-full">
        Analyze locally. Understand intelligently. Save nothing.
      </span>
    </div>
  );
}