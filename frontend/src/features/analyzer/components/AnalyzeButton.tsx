import {
  Check,
  FileSearch,
  Loader2,
  XCircle,
} from "lucide-react";

export type AnalyzeButtonStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

interface AnalyzeButtonProps {
  disabled?: boolean;
  status?: AnalyzeButtonStatus;
  onClick: () => void;
}

const statusContent = {
  idle: {
    label: "Analyze my resume",
    ariaLabel: "Analyze my resume",
  },
  loading: {
    label: "Analyzing your resume...",
    ariaLabel: "Analyzing your resume",
  },
  success: {
    label: "Analysis complete",
    ariaLabel: "Resume analysis complete",
  },
  error: {
    label: "Analysis failed",
    ariaLabel: "Resume analysis failed",
  },
} satisfies Record<
  AnalyzeButtonStatus,
  {
    label: string;
    ariaLabel: string;
  }
>;

export default function AnalyzeButton({
  disabled = false,
  status = "idle",
  onClick,
}: AnalyzeButtonProps) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const isDisabled =
    disabled ||
    isLoading ||
    isSuccess;

  const content = statusContent[status];

  return (
    <div
      className="
        mx-auto flex w-full max-w-5xl
        justify-center
      "
    >
      <button
        type="button"
        disabled={isDisabled}
        onClick={onClick}
        aria-label={content.ariaLabel}
        aria-busy={isLoading}
        aria-live="polite"
        className={[
          `
            group relative inline-flex min-h-11
            w-full items-center justify-center
            gap-2 rounded-xl
            px-5
            text-[13px] font-semibold
            outline-none
            transition-[transform,box-shadow,background-color,border-color,opacity]
            duration-200 ease-out
            focus-visible:ring-4
            active:translate-y-0
            sm:w-auto sm:px-6 sm:text-sm
          `,
          status === "idle" &&
            `
              border border-transparent
              bg-gradient-to-r
              from-blue-600 via-indigo-600 to-violet-600
              text-white
              shadow-[0_7px_20px_rgba(79,70,229,0.14)]
              hover:-translate-y-0.5
              hover:shadow-[0_10px_24px_rgba(79,70,229,0.2)]
              focus-visible:ring-indigo-500/20
            `,
          status === "loading" &&
            `
              border border-indigo-500
              bg-indigo-600
              text-white
              shadow-[0_7px_20px_rgba(79,70,229,0.12)]
              focus-visible:ring-indigo-500/20
            `,
          status === "success" &&
            `
              border border-emerald-200
              bg-emerald-600
              text-white
              shadow-[0_7px_20px_rgba(16,185,129,0.12)]
              focus-visible:ring-emerald-500/20
            `,
          status === "error" &&
            `
              border border-rose-200
              bg-rose-50
              text-rose-700
              shadow-[0_4px_14px_rgba(244,63,94,0.06)]
              focus-visible:ring-rose-500/20
            `,
          disabled &&
            status === "idle" &&
            `
              cursor-not-allowed
              opacity-45
              shadow-none
            `,
          isLoading &&
            `
              cursor-wait
            `,
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-x-0 top-0
            h-px rounded-full bg-white/30
            opacity-0 transition-opacity duration-200
            group-hover:opacity-100
          "
        />

        {status === "idle" && (
          <FileSearch
            className="
              h-4 w-4 shrink-0
              transition-transform duration-200
              group-hover:scale-[1.03]
            "
            strokeWidth={1.9}
            aria-hidden="true"
          />
        )}

        {status === "loading" && (
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin"
            strokeWidth={1.9}
            aria-hidden="true"
          />
        )}

        {status === "success" && (
          <Check
            className="h-4 w-4 shrink-0"
            strokeWidth={2.2}
            aria-hidden="true"
          />
        )}

        {status === "error" && (
          <XCircle
            className="h-4 w-4 shrink-0"
            strokeWidth={1.9}
            aria-hidden="true"
          />
        )}

        <span className="relative">
          {content.label}
        </span>
      </button>
    </div>
  );
}