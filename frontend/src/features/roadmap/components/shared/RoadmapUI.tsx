import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface SetupShellProps {
  children: ReactNode;
  /**
   * Optional wider layout for workspace-style screens.
   * Existing screens remain compact by default.
   */
  wide?: boolean;
}

export function SetupShell({
  children,
  wide = false,
}: SetupShellProps) {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white text-slate-900">
      <BackgroundGlow />

      <section className="careermap-section relative">
        <div className="careermap-container px-0">
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={[
              "mx-auto w-full motion-reduce:animate-none",
              wide
                ? "max-w-6xl"
                : "max-w-2xl",
            ].join(" ")}
          >
            {children}
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export function Badge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="inline-flex min-h-8 max-w-full shrink-0 items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 text-[9px] font-bold uppercase tracking-[0.13em] text-indigo-700 sm:min-h-9 sm:px-3.5 sm:text-[10px]">
      {children}
    </span>
  );
}

export function EmptyReview({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3.5 py-4 text-center sm:px-4 sm:py-5">
      <p className="break-words text-[9px] leading-4 text-slate-400 sm:text-[10px] sm:leading-5">
        {text}
      </p>
    </div>
  );
}

export function MiniValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className="shrink-0 text-[8px] font-medium text-slate-400 sm:text-[9px]">
        {label}
      </span>

      <span className="min-w-0 max-w-[150px] truncate text-right sm:max-w-[170px] text-[8px] font-bold text-slate-700 sm:max-w-[170px] sm:text-[9px]">
        {value}
      </span>
    </div>
  );
}

export function BackgroundGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden contain-paint"
    >
      {/* Top ambient glow */}
      <div className="absolute left-1/2 top-[-9rem] h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-100/20 blur-3xl sm:h-96 sm:w-96" />

      {/* Left ambient glow */}
      <div className="absolute left-[-10rem] top-24 h-72 w-72 rounded-full bg-blue-100/20 blur-3xl sm:h-80 sm:w-80" />

      {/* Right ambient glow */}
      <div className="absolute right-[-10rem] top-16 h-80 w-80 rounded-full bg-violet-100/15 blur-3xl sm:h-96 sm:w-96" />

      {/* Lower subtle glow */}
      <div className="absolute bottom-[-12rem] left-1/2 hidden h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100/10 blur-3xl sm:block" />
    </div>
  );
}

export function Spinner({
  size = "md",
}: {
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm"
      ? "h-4 w-4 border-2"
      : "h-5 w-5 border-2";

  return (
    <span
      aria-hidden="true"
      className={[
        "inline-block h-auto shrink-0 animate-spin rounded-full border-indigo-200 border-t-indigo-600 motion-reduce:animate-none",
        sizeClass,
      ].join(" ")}
    />
  );
}
