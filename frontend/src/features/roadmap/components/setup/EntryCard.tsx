import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";

interface EntryCardProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  featured?: boolean;
}

export default function EntryCard({
  icon,
  eyebrow,
  title,
  description,
  action,
  onClick,
  featured = false,
}: EntryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex min-h-[310px] w-full flex-col overflow-hidden rounded-[1.5rem] border p-6 text-left transition-all duration-300 sm:min-h-[330px] sm:p-7",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10",
        "active:scale-[0.995]",
        featured
          ? [
              "border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/35",
              "shadow-[0_12px_40px_rgba(79,70,229,0.08)]",
              "hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_20px_50px_rgba(79,70,229,0.12)]",
            ].join(" ")
          : [
              "border-slate-200 bg-white",
              "shadow-[0_8px_30px_rgba(15,23,42,0.035)]",
              "hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.075)]",
            ].join(" "),
      ].join(" ")}
    >
      {/* Decorative glow */}
      {featured && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-200/20 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        />
      )}

      {/* Top row */}
      <div className="relative flex items-start justify-between gap-4">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300",
            featured
              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100 group-hover:ring-indigo-200"
              : "bg-slate-50 text-slate-700 ring-1 ring-slate-200 group-hover:bg-slate-100",
          ].join(" ")}
        >
          {icon}
        </div>

        {featured && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white/80 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-indigo-600 shadow-sm">
            <Check
              className="h-3 w-3"
              strokeWidth={2.2}
            />
            Recommended
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative mt-7">
        <p
          className={[
            "text-[10px] font-bold uppercase tracking-[0.12em]",
            featured
              ? "text-indigo-500"
              : "text-slate-400",
          ].join(" ")}
        >
          {eyebrow}
        </p>

        <h2 className="mt-2.5 text-[20px] font-bold leading-7 tracking-[-0.025em] text-slate-950 sm:text-[21px]">
          {title}
        </h2>

        <p className="mt-3 max-w-md text-[13px] leading-5.5 text-slate-500 sm:text-[14px] sm:leading-6">
          {description}
        </p>
      </div>

      {/* CTA */}
      <div className="relative mt-auto pt-7">
        <span
          className={[
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-[12px] font-bold transition-all duration-200 sm:text-[13px]",
            featured
              ? "bg-indigo-600 text-white shadow-sm group-hover:bg-indigo-700 group-hover:shadow-md"
              : "border border-slate-200 bg-white text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-50 group-hover:text-slate-950",
          ].join(" ")}
        >
          {action}

          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </span>
      </div>

      {/* Bottom accent */}
      <div
        aria-hidden="true"
        className={[
          "absolute bottom-0 left-6 right-6 h-px transition-opacity duration-300",
          featured
            ? "bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent opacity-70 group-hover:opacity-100"
            : "bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100",
        ].join(" ")}
      />
    </button>
  );
}