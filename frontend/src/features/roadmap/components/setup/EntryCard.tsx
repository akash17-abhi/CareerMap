import type { ReactNode } from "react";

export default function EntryCard({
  icon,
  eyebrow,
  title,
  description,
  action,
  onClick,
  featured = false,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex min-h-[250px] flex-col rounded-[1.75rem] border p-5 text-left transition-all duration-200 sm:p-6",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10",
        featured
          ? "border-indigo-100 bg-indigo-50/35 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/55"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.055)]",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-2xl",
          featured
            ? "bg-white text-indigo-600 ring-1 ring-indigo-100"
            : "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="mt-5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-base font-bold leading-5 text-slate-950">
          {title}
        </h2>

        <p className="mt-2 text-[10px] leading-4.5 text-slate-500">
          {description}
        </p>
      </div>

      <span
        className={[
          "mt-auto inline-flex min-h-9 items-center justify-center rounded-xl px-3 text-[9px] font-bold transition",
          featured
            ? "bg-indigo-600 text-white group-hover:bg-indigo-700"
            : "border border-slate-200 bg-white text-slate-700 group-hover:border-slate-300 group-hover:text-slate-900",
        ].join(" ")}
      >
        {action}
      </span>
    </button>
  );
}