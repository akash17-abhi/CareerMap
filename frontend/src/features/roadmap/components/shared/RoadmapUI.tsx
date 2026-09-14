import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function SetupShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white">
      <BackgroundGlow />

      <section className="careermap-section relative">
        <div className="careermap-container">
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
            }}
            className="mx-auto max-w-xl"
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
    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-indigo-700">
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
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center">
      <p className="text-[9px] leading-4 text-slate-400">
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
    <div className="flex items-center justify-between gap-2">
      <span className="text-[8px] font-medium text-slate-400">
        {label}
      </span>

      <span className="max-w-[120px] truncate text-right text-[8px] font-bold text-slate-700">
        {value}
      </span>
    </div>
  );
}

export function BackgroundGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-blue-100/25 blur-3xl" />

      <div className="absolute right-[-8rem] top-10 h-80 w-80 rounded-full bg-violet-100/20 blur-3xl" />
    </div>
  );
}

export function Spinner() {
  return (
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
  );
}