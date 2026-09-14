import { NavLink } from "react-router-dom";
import {
  ArrowUpRight,
  FileSearch,
  Map,
  ShieldCheck,
} from "lucide-react";

const currentYear = new Date().getFullYear();

const productLinks = [
  {
    label: "Analyze Resume & JD",
    href: "/analyzer",
    icon: FileSearch,
  },
  {
    label: "Build Career Roadmap",
    href: "/roadmap",
    icon: Map,
  },
];

const privacyPrinciples = [
  "Temporary processing",
  "No permanent storage",
  "Protected credentials",
];

export default function Footer() {
  return (
    <footer className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6">
      <div className="mx-auto max-w-[1440px]">
        <div
          className={[
            "overflow-hidden rounded-2xl",
            "border border-slate-300",
            "bg-slate-100",
            "shadow-[0_6px_22px_rgba(15,23,42,0.05)]",
          ].join(" ")}
        >
          {/* =========================================================
              Main Footer
             ========================================================= */}
          <div className="careermap-container py-6 sm:py-7 lg:py-8">
            <div
              className={[
                "grid gap-6",
                "sm:grid-cols-2",
                "lg:grid-cols-[1.45fr_0.9fr_0.9fr]",
                "lg:gap-9",
                "xl:gap-12",
              ].join(" ")}
            >
              {/* =====================================================
                  Brand
                 ===================================================== */}
              <div className="min-w-0">
                <NavLink
                  to="/"
                  className={[
                    "inline-flex items-center gap-2",
                    "rounded-lg",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-blue-500/25",
                    "focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-slate-100",
                  ].join(" ")}
                  aria-label="CareerMap home"
                >
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center",
                      "rounded-lg",
                      "bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600",
                      "text-sm font-bold text-white",
                      "shadow-[0_3px_8px_rgba(37,99,235,0.14)]",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    C
                  </span>

                  <span className="text-[15px] font-bold tracking-[-0.02em] text-slate-950">
                    CareerMap
                  </span>
                </NavLink>

                <p className="mt-2.5 max-w-sm text-[12px] leading-5 text-slate-600 sm:text-[13px]">
                  Know your fit. Find your path. Build your future.
                </p>

                <div className="mt-3">
                  <div
                    className={[
                      "inline-flex items-center gap-2 rounded-full",
                      "border border-emerald-200",
                      "bg-emerald-50",
                      "px-2.5 py-1.5",
                    ].join(" ")}
                  >
                    <ShieldCheck
                      size={13}
                      strokeWidth={1.9}
                      className="text-emerald-700"
                      aria-hidden="true"
                    />

                    <span className="text-[10px] font-bold text-emerald-800 sm:text-[11px]">
                      Privacy-first processing
                    </span>
                  </div>
                </div>
              </div>

              {/* =====================================================
                  Product
                 ===================================================== */}
              <div className="min-w-0">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700 sm:text-[11px]">
                  Product
                </h2>

                <div className="mt-2 space-y-0.5">
                  {productLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        className={[
                          "group flex min-h-9 items-center gap-2",
                          "rounded-lg border border-transparent px-2",
                          "text-[12px] font-semibold text-slate-700",
                          "transition-all duration-150",
                          "hover:border-slate-200",
                          "hover:bg-white",
                          "hover:text-slate-950",
                          "focus-visible:outline-none",
                          "focus-visible:ring-2 focus-visible:ring-blue-500/25",
                        ].join(" ")}
                      >
                        <Icon
                          size={14}
                          strokeWidth={1.9}
                          className="shrink-0"
                          aria-hidden="true"
                        />

                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>

                        <ArrowUpRight
                          size={13}
                          strokeWidth={1.8}
                          className={[
                            "shrink-0 text-slate-400",
                            "opacity-0 transition-all duration-150",
                            "group-hover:translate-x-0.5",
                            "group-hover:text-slate-700",
                            "group-hover:opacity-100",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              {/* =====================================================
                  Privacy
                 ===================================================== */}
              <div className="min-w-0">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700 sm:text-[11px]">
                  Privacy
                </h2>

                <div className="mt-2.5 space-y-1.5">
                  {privacyPrinciples.map((principle) => (
                    <div
                      key={principle}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                        aria-hidden="true"
                      />

                      <span className="text-[12px] font-medium text-slate-700 sm:text-[13px]">
                        {principle}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              Bottom Bar
             ========================================================= */}
          <div className="border-t border-slate-300">
            <div
              className={[
                "careermap-container",
                "flex flex-col items-center gap-1.5",
                "py-2.5",
                "text-[10px] text-slate-600",
                "sm:flex-row sm:justify-between",
                "sm:text-[11px]",
              ].join(" ")}
            >
              <p className="font-medium">
                © {currentYear} CareerMap. All rights reserved.
              </p>

              <p className="font-medium leading-4">
                Made with{" "}
                <span
                  className="text-rose-500"
                  aria-label="love"
                >
                  💗
                </span>{" "}
                by{" "}
                <span className="font-bold text-slate-950">
                  AKASH
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}