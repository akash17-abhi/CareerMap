import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ChoiceButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onClick"
  > {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

export default function ChoiceButton({
  selected,
  onClick,
  children,
  className = "",
  ...props
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "flex min-h-14 w-full items-center justify-center rounded-2xl border px-3.5 py-3 text-center text-[10px] font-semibold outline-none transition-all duration-200",
        selected
          ? "border-indigo-200 bg-indigo-50/80 text-indigo-900 shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
        "focus-visible:ring-4 focus-visible:ring-indigo-500/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}