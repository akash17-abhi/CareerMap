import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ChoiceButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
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
        "group flex min-h-12 w-full items-center justify-center rounded-xl border px-4 py-3 text-center text-[11px] font-semibold leading-4 outline-none transition-all duration-200",
        "sm:min-h-[52px] sm:rounded-[14px] sm:px-4 sm:text-[11px]",
        selected
          ? [
              "border-indigo-300 bg-indigo-50 text-indigo-900",
              "shadow-[0_2px_8px_rgba(79,70,229,0.08)]",
            ].join(" ")
          : [
              "border-slate-200 bg-white text-slate-700",
              "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
              "active:scale-[0.99]",
            ].join(" "),
        "focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-500/10",
        "disabled:active:scale-100",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-white",
        className,
      ].join(" ")}
      {...props}
    >
      <span className="max-w-full break-words">{children}</span>
    </button>
  );
}
