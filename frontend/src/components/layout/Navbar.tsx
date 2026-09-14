import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FileSearch,
  Home,
  LockKeyhole,
  Map,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
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

function getNavLinkClass({
  isActive,
}: {
  isActive: boolean;
}) {
  return [
    "inline-flex min-h-10 items-center gap-2 rounded-lg px-3",
    "border border-transparent",
    "text-[13px] font-semibold",
    "transition-all duration-150",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-blue-500/25",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-slate-100",
    isActive
      ? [
          "border-slate-200",
          "bg-white",
          "text-slate-950",
          "shadow-[0_1px_3px_rgba(15,23,42,0.08)]",
        ].join(" ")
      : [
          "text-slate-700",
          "hover:border-slate-200",
          "hover:bg-white/80",
          "hover:text-slate-950",
        ].join(" "),
  ].join(" ");
}

function getMobileNavLinkClass({
  isActive,
}: {
  isActive: boolean;
}) {
  return [
    "flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5",
    "border",
    "text-sm font-semibold",
    "transition-all duration-150",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-blue-500/25",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-slate-100",
    isActive
      ? [
          "border-blue-200",
          "bg-white",
          "text-blue-800",
          "shadow-[0_1px_3px_rgba(15,23,42,0.06)]",
        ].join(" ")
      : [
          "border-transparent",
          "text-slate-700",
          "hover:border-slate-200",
          "hover:bg-white",
          "hover:text-slate-950",
        ].join(" "),
  ].join(" ");
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 lg:px-6">
      <div className="mx-auto max-w-[1440px]">
        <nav
          aria-label="Main navigation"
          className={[
            "overflow-hidden rounded-2xl",
            "border border-slate-300",
            "bg-slate-100",
            "shadow-[0_10px_32px_rgba(15,23,42,0.08)]",
            "backdrop-blur-xl",
          ].join(" ")}
        >
          {/* Main Navbar Row */}
          <div className="flex min-h-[62px] items-center justify-between px-3.5 sm:px-4 lg:px-5">
            {/* Brand */}
            <NavLink
              to="/"
              onClick={closeMenu}
              className={[
                "flex min-w-0 items-center gap-2.5 rounded-xl",
                "px-1 py-1",
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
                  "shadow-[0_4px_12px_rgba(37,99,235,0.18)]",
                ].join(" ")}
                aria-hidden="true"
              >
                C
              </span>

              <span className="truncate text-[15px] font-bold tracking-[-0.02em] text-slate-950 sm:text-base">
                CareerMap
              </span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 lg:flex">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={getNavLinkClass}
                  >
                    <Icon
                      size={15}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />

                    <span className="whitespace-nowrap">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>

            {/* Desktop Privacy Status */}
            <div className="hidden items-center lg:flex">
              <div
                className={[
                  "flex items-center gap-2 rounded-full",
                  "border border-emerald-200",
                  "bg-emerald-50",
                  "px-3 py-1.5",
                ].join(" ")}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />

                <LockKeyhole
                  size={13}
                  strokeWidth={1.9}
                  className="text-emerald-700"
                  aria-hidden="true"
                />

                <span className="text-[11px] font-bold tracking-[0.01em] text-emerald-800">
                  Privacy-first
                </span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() =>
                setIsMenuOpen((current) => !current)
              }
              className={[
                "inline-flex h-11 w-11 shrink-0 items-center justify-center",
                "rounded-xl",
                "border border-slate-300",
                "bg-white",
                "text-slate-700",
                "shadow-[0_1px_3px_rgba(15,23,42,0.07)]",
                "transition-all duration-150",
                "hover:border-slate-400",
                "hover:text-slate-950",
                "active:scale-[0.98]",
                "focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-blue-500/25",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-slate-100",
                "lg:hidden",
              ].join(" ")}
              aria-label={
                isMenuOpen
                  ? "Close navigation"
                  : "Open navigation"
              }
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? (
                <X
                  size={20}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              ) : (
                <Menu
                  size={20}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div
              id="mobile-navigation"
              className={[
                "border-t border-slate-300",
                "bg-slate-100",
                "px-3 pb-3 pt-3",
                "lg:hidden",
              ].join(" ")}
            >
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={closeMenu}
                      className={getMobileNavLinkClass}
                    >
                      <span
                        className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center",
                          "rounded-lg",
                          "border border-slate-200",
                          "bg-white",
                        ].join(" ")}
                      >
                        <Icon
                          size={17}
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />
                      </span>

                      <span className="min-w-0 truncate">
                        {item.label}
                      </span>
                    </NavLink>
                  );
                })}
              </div>

              {/* Mobile Privacy Status */}
              <div
                className={[
                  "mt-3 rounded-xl",
                  "border border-emerald-200",
                  "bg-emerald-50",
                  "px-3.5 py-3",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center",
                      "rounded-lg",
                      "border border-emerald-200",
                      "bg-white",
                    ].join(" ")}
                  >
                    <LockKeyhole
                      size={15}
                      strokeWidth={1.9}
                      className="text-emerald-700"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-900">
                      Privacy-first processing
                    </p>

                    <p className="mt-0.5 text-[11px] leading-4 text-emerald-700">
                      No account required
                    </p>
                  </div>

                  <span
                    className="ml-auto mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}