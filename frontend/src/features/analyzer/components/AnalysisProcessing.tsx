import { motion } from "framer-motion";
import {
  Check,
  FileSearch,
  LockKeyhole,
} from "lucide-react";

export type ProcessingStepStatus =
  | "completed"
  | "active"
  | "pending";

export interface ProcessingStep {
  id: string;
  label: string;
  status: ProcessingStepStatus;
}

interface AnalysisProcessingProps {
  steps: ProcessingStep[];
}

export default function AnalysisProcessing({
  steps,
}: AnalysisProcessingProps) {
  const completedCount = steps.filter(
    (step) => step.status === "completed",
  ).length;

  const activeCount = steps.filter(
    (step) => step.status === "active",
  ).length;

  const progress = Math.min(
    96,
    Math.max(
      8,
      ((completedCount + activeCount * 0.5) /
        steps.length) *
        100,
    ),
  );

  const progressLabel = `Analysis ${Math.round(progress)} percent complete`;

  return (
    <section
      className="
        relative min-w-0 overflow-hidden
        bg-white
        py-10
        sm:py-14
        lg:py-16
      "
      aria-labelledby="analysis-processing-title"
      aria-live="polite"
    >
      {/* Background accents */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 overflow-hidden
        "
      >
        <div
          className="
            absolute -left-24 top-8
            h-48 w-48 rounded-full
            bg-blue-100/20 blur-3xl
            sm:-left-16 sm:top-12
            sm:h-60 sm:w-60
          "
        />

        <div
          className="
            absolute -right-24 top-20
            h-52 w-52 rounded-full
            bg-violet-100/20 blur-3xl
            sm:-right-16 sm:top-28
            sm:h-64 sm:w-64
            lg:h-72 lg:w-72
          "
        />
      </div>

      <div className="careermap-container relative">
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            mx-auto w-full
            max-w-xl
          "
        >
          {/* Header */}
          <div className="text-center">
            <div
              className="
                mx-auto flex h-11 w-11
                items-center justify-center
                rounded-xl
                border border-blue-100
                bg-blue-50
                text-blue-600
                shadow-[0_3px_12px_rgba(37,99,235,0.06)]
                sm:h-12 sm:w-12 sm:rounded-2xl
              "
              aria-hidden="true"
            >
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <FileSearch
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </motion.div>
            </div>

            <h1
              id="analysis-processing-title"
              className="
                mt-4
                text-[25px] font-bold
                leading-[1.1]
                tracking-[-0.03em]
                text-slate-950
                sm:mt-5
                sm:text-3xl
              "
            >
              Analyzing your{" "}
              <span className="careermap-text-gradient">
                career fit.
              </span>
            </h1>

            <p
              className="
                mx-auto mt-2.5
                max-w-md
                text-[13px]
                leading-5.5
                text-slate-500
                sm:text-sm
                sm:leading-6
              "
            >
              We're comparing your resume with the target role
              to identify relevant skills, gaps, and opportunities.
            </p>
          </div>

          {/* Progress card */}
          <div
            className="
              careermap-card mt-6
              p-3.5
              sm:mt-8 sm:p-4.5
            "
          >
            {/* Card header */}
            <div
              className="
                flex items-start
                justify-between gap-3
                border-b border-slate-100
                pb-3
              "
            >
              <div className="min-w-0">
                <h2
                  className="
                    text-[13px]
                    font-semibold
                    text-slate-900
                    sm:text-sm
                  "
                >
                  Analysis progress
                </h2>

                <p
                  className="
                    mt-0.5
                    text-[9px]
                    leading-4
                    text-slate-500
                    sm:text-[10px]
                  "
                >
                  Checking your resume against the target role.
                </p>
              </div>

              <span
                className="
                  shrink-0 rounded-full
                  border border-blue-100
                  bg-blue-50
                  px-2 py-1
                  text-[8px]
                  font-semibold
                  text-blue-600
                  sm:text-[9px]
                "
              >
                In progress
              </span>
            </div>

            {/* Steps */}
            <div className="mt-3">
              {steps.map((step, index) => {
                const isCompleted =
                  step.status === "completed";

                const isActive =
                  step.status === "active";

                const isLast =
                  index === steps.length - 1;

                return (
                  <div
                    key={step.id}
                    className="
                      relative flex
                      items-center gap-2.5
                      rounded-lg
                      px-1.5 py-2.5
                      sm:gap-3
                      sm:px-2
                      sm:py-3
                    "
                  >
                    {/* Connector */}
                    {!isLast && (
                      <div
                        aria-hidden="true"
                        className="
                          absolute
                          left-[15px]
                          top-[35px]
                          bottom-[-2px]
                          w-px
                          bg-slate-100
                          sm:left-[18px]
                          sm:top-[39px]
                        "
                      />
                    )}

                    {/* Status icon */}
                    <div
                      className={[
                        `
                          relative z-10
                          flex h-7 w-7 shrink-0
                          items-center justify-center
                          rounded-full
                          border
                        `,
                        "sm:h-8 sm:w-8",
                        isCompleted
                          ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                          : isActive
                            ? "border-blue-100 bg-blue-50 text-blue-600"
                            : "border-slate-100 bg-slate-50 text-slate-300",
                      ].join(" ")}
                    >
                      {isCompleted ? (
                        <Check
                          className="h-3.5 w-3.5"
                          strokeWidth={2.2}
                          aria-hidden="true"
                        />
                      ) : isActive ? (
                        <motion.span
                          animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.55, 1, 0.55],
                          }}
                          transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="
                            h-2 w-2 rounded-full
                            bg-blue-600
                          "
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          className="
                            h-1.5 w-1.5
                            rounded-full
                            bg-slate-300
                          "
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Step text */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={[
                          `
                            text-[11px]
                            font-medium
                            leading-4
                            sm:text-xs
                            sm:leading-5
                          `,
                          isCompleted || isActive
                            ? "text-slate-800"
                            : "text-slate-400",
                        ].join(" ")}
                      >
                        {step.label}
                      </p>

                      {isActive && (
                        <motion.p
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          transition={{
                            duration: 0.2,
                          }}
                          className="
                            mt-0.5
                            text-[9px]
                            leading-4
                            text-blue-500
                            sm:text-[10px]
                          "
                        >
                          Working on this step...
                        </motion.p>
                      )}
                    </div>

                    {/* Status label */}
                    <span
                      className={[
                        `
                          shrink-0
                          text-[8px]
                          font-medium
                          sm:text-[9px]
                        `,
                        isCompleted
                          ? "text-emerald-600"
                          : isActive
                            ? "text-blue-600"
                            : "text-slate-300",
                      ].join(" ")}
                    >
                      {isCompleted
                        ? "Done"
                        : isActive
                          ? "Working"
                          : "Waiting"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div
              className="
                mt-2
                border-t border-slate-100
                pt-3.5
                sm:mt-3 sm:pt-4
              "
            >
              <div
                className="
                  flex items-center
                  justify-between gap-3
                  mb-1.5
                "
              >
                <span
                  className="
                    text-[9px]
                    font-medium
                    text-slate-400
                    sm:text-[10px]
                  "
                >
                  Overall progress
                </span>

                <span
                  className="
                    tabular-nums
                    text-[9px]
                    font-semibold
                    text-slate-500
                    sm:text-[10px]
                  "
                >
                  {Math.round(progress)}%
                </span>
              </div>

              <div
                className="
                  h-1.5 overflow-hidden
                  rounded-full
                  bg-slate-100
                "
                role="progressbar"
                aria-label={progressLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <motion.div
                  initial={{
                    width: "8%",
                  }}
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    h-full rounded-full
                    bg-gradient-to-r
                    from-blue-600
                    via-indigo-600
                    to-violet-600
                  "
                />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div
            className="
              mt-4 flex
              items-center
              justify-center
              gap-1.5
              px-2
              text-center
              sm:mt-5
            "
          >
            <LockKeyhole
              className="
                h-3 w-3 shrink-0
                text-emerald-500
              "
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <span
              className="
                text-[9px]
                leading-4
                text-slate-500
                sm:text-[10px]
              "
            >
              Your career information is processed temporarily.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}