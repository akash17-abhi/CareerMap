import { AlertCircle, FileSearch } from "lucide-react";
import { useState } from "react";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MIN_DESCRIPTION_LENGTH = 30;
const MAX_DESCRIPTION_LENGTH = 10000;

export default function JobDescriptionInput({
  value,
  onChange,
}: JobDescriptionInputProps) {
  const [touched, setTouched] =
    useState(false);

  const trimmedValue = value.trim();
  const characterCount = value.length;

  const isEmpty = trimmedValue.length === 0;
  const isTooShort =
    !isEmpty &&
    trimmedValue.length < MIN_DESCRIPTION_LENGTH;

  const isOverLimit =
    characterCount > MAX_DESCRIPTION_LENGTH;

  const showRequiredError =
    touched && isEmpty;

  const showShortError =
    touched && !isEmpty && isTooShort;

  const hasError =
    showRequiredError ||
    showShortError ||
    isOverLimit;

  const isValid =
    !isEmpty &&
    !isTooShort &&
    !isOverLimit;

  const isNearLimit =
    characterCount >=
    Math.floor(MAX_DESCRIPTION_LENGTH * 0.9);

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    onChange(event.target.value);

    if (!touched) {
      setTouched(true);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const getCounterColor = () => {
    if (isOverLimit) {
      return "text-rose-600";
    }

    if (isNearLimit) {
      return "text-amber-600";
    }

    if (isValid) {
      return "text-emerald-600";
    }

    return "text-slate-300";
  };

  return (
    <section
      className="
        careermap-card min-w-0
        p-3.5
        sm:p-4
        lg:p-5
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div
            aria-hidden="true"
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-lg border border-indigo-100
              bg-indigo-50 text-indigo-600
              sm:h-10 sm:w-10 sm:rounded-xl
            "
          >
            <FileSearch
              className="h-4 w-4"
              strokeWidth={1.9}
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="job-description"
              className="
                block text-sm font-semibold
                tracking-tight text-slate-900
              "
            >
              Job description
            </label>

            <p
              id="job-description-help"
              className="
                mt-0.5 text-[10px] leading-4
                text-slate-500
                sm:text-[11px]
              "
            >
              Add the role you're targeting.
            </p>
          </div>
        </div>

        <span
          aria-label="Required field"
          className="
            shrink-0 rounded-full
            border border-slate-200
            bg-slate-50
            px-2 py-1
            text-[8px] font-semibold uppercase
            tracking-[0.08em] text-slate-500
            sm:text-[9px]
          "
        >
          Required
        </span>
      </div>

      {/* Textarea */}
      <div className="relative mt-3 sm:mt-4">
        <textarea
          id="job-description"
          name="job-description"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Paste the job description here..."
          aria-label="Job description"
          aria-describedby="job-description-help job-description-status"
          aria-invalid={hasError ? "true" : "false"}
          maxLength={MAX_DESCRIPTION_LENGTH}
          spellCheck
          className={[
            `
              block min-h-[148px]
              w-full resize-none
              rounded-xl
              border
              bg-slate-50/50
              px-3 py-3
              text-[13px]
              leading-5.5
              text-slate-700
              outline-none
              transition-[border-color,background-color,box-shadow]
              duration-200
              placeholder:text-slate-300
              hover:border-slate-300
              focus:bg-white
              focus:ring-4
              sm:min-h-[165px]
              sm:px-3.5 sm:py-3.5
              sm:text-sm sm:leading-6
            `,
            hasError
              ? "border-rose-300 focus:border-rose-300 focus:ring-rose-500/10"
              : isValid
                ? "border-emerald-200 focus:border-indigo-300 focus:ring-indigo-500/10"
                : "border-slate-200 focus:border-indigo-300 focus:ring-indigo-500/10",
          ].join(" ")}
        />

        {/* Valid state */}
        {isValid && (
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              bottom-3 right-3
              h-1.5 w-1.5
              rounded-full bg-emerald-500
              sm:bottom-3.5 sm:right-3.5
            "
          />
        )}
      </div>

      {/* Footer */}
      <div
        id="job-description-status"
        className="
          mt-2 flex items-start
          justify-between gap-3
        "
      >
        <p
          className="
            min-w-0 text-[9px]
            leading-4 text-slate-500
            sm:text-[10px]
          "
        >
          Include responsibilities, requirements, and skills.
        </p>

        <span
          aria-live="polite"
          className={[
            "shrink-0 tabular-nums",
            "text-[9px] leading-4 font-medium",
            "sm:text-[10px]",
            getCounterColor(),
          ].join(" ")}
        >
          {characterCount}/{MAX_DESCRIPTION_LENGTH}
        </span>
      </div>

      {/* Required validation */}
      {showRequiredError && (
        <div
          role="alert"
          aria-live="assertive"
          className="
            mt-2.5 flex items-start gap-2
            rounded-lg
            border border-rose-200
            bg-rose-50
            px-2.5 py-2
            sm:px-3
          "
        >
          <AlertCircle
            className="
              mt-0.5 h-3.5 w-3.5
              shrink-0 text-rose-600
            "
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <p
            className="
              text-[10px] leading-4
              text-rose-700
              sm:text-[11px]
            "
          >
            Please add a job description before starting the analysis.
          </p>
        </div>
      )}

      {/* Too short validation */}
      {showShortError && (
        <div
          role="alert"
          aria-live="assertive"
          className="
            mt-2.5 flex items-start gap-2
            rounded-lg
            border border-amber-200
            bg-amber-50
            px-2.5 py-2
            sm:px-3
          "
        >
          <AlertCircle
            className="
              mt-0.5 h-3.5 w-3.5
              shrink-0 text-amber-600
            "
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <p
            className="
              text-[10px] leading-4
              text-amber-700
              sm:text-[11px]
            "
          >
            Add at least {MIN_DESCRIPTION_LENGTH} characters for a more useful
            comparison.
          </p>
        </div>
      )}

      {/* Over-limit validation */}
      {isOverLimit && (
        <div
          role="alert"
          aria-live="assertive"
          className="
            mt-2.5 flex items-start gap-2
            rounded-lg
            border border-rose-200
            bg-rose-50
            px-2.5 py-2
            sm:px-3
          "
        >
          <AlertCircle
            className="
              mt-0.5 h-3.5 w-3.5
              shrink-0 text-rose-600
            "
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <p
            className="
              text-[10px] leading-4
              text-rose-700
              sm:text-[11px]
            "
          >
            The job description has reached the maximum character limit of{" "}
            {MAX_DESCRIPTION_LENGTH.toLocaleString()} characters.
          </p>
        </div>
      )}
    </section>
  );
}