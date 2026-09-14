import {
  ArrowRight,
  BookOpen,
  Check,
  Flag,
  Hammer,
  Map,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const ROADMAP_STEPS = [
  { label: "Analyze", icon: Search },
  { label: "Prioritize", icon: Flag },
  { label: "Learn", icon: BookOpen },
  { label: "Build", icon: Hammer },
] as const;

/* Anchor points a winding route passes through, and the pins
   drawn at each one. Coordinates live in the preview SVG's
   0–300 x 0–160 viewBox. */
const ROADMAP_NODES = [
  { label: "Profile", eyebrow: "1", x: 20, y: 110 },
  { label: "Skills", eyebrow: "2", x: 106, y: 60 },
  { label: "Projects", eyebrow: "3", x: 194, y: 115 },
  { label: "Target", eyebrow: "4", x: 280, y: 55 },
] as const;

const ROUTE_D =
  "M20,110 C60,75 76,60 106,60 C140,60 160,115 194,115 C220,115 250,55 280,55";

export default function PersonalizedRoadmapCard() {
  const shouldReduceMotion = useReducedMotion();

  const reveal = shouldReduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  return (
    <motion.section
      {...reveal}
      className="relative mt-4 overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 shadow-[0_18px_55px_rgba(79,70,229,0.08)] sm:mt-5"
      aria-labelledby="personalized-roadmap-title"
    >
      <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
        {/* Left — message */}
        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex items-start gap-3.5">
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              transition={{ duration: 0.2 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_10px_24px_rgba(79,70,229,0.22)]"
            >
              <Map className="h-5 w-5" strokeWidth={1.85} aria-hidden="true" />
            </motion.div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Personalized roadmap
                </span>

                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Ready
                </span>
              </div>

              <h2
                id="personalized-roadmap-title"
                className="mt-1.5 text-[1.4rem] font-bold leading-[1.15] tracking-[-0.03em] text-slate-950 sm:text-[1.7rem]"
              >
                Ready for a personalized path?
              </h2>

              <p className="mt-2 max-w-md text-[12px] leading-[1.6] text-slate-500 sm:text-[13px]">
                Build a roadmap from this analysis. You&apos;ll review the
                role setup before anything is generated.
              </p>
            </div>
          </div>

          {/* Process trail — a real sequence, so it keeps its order.
              Compact chips rather than roomy cards, so all four fit
              cleanly on a phone width without wrapping awkwardly. */}
          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            {ROADMAP_STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.label} className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-700 to-violet-700 text-white">
                      <Icon
                        className="h-3 w-3"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>

                    <span className="whitespace-nowrap text-[10px] font-semibold text-slate-700">
                      {step.label}
                    </span>
                  </div>

                  {index < ROADMAP_STEPS.length - 1 && (
                    <ArrowRight
                      className="h-2.5 w-2.5 shrink-0 text-slate-300"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2 text-[11px] text-slate-400">
            <Sparkles
              className="h-3.5 w-3.5 shrink-0 text-indigo-400"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span>Built from your analysis, strengths, gaps, and target role.</span>
          </div>
        </div>

        {/* Right — route preview */}
        <div className="border-t border-indigo-100/80 bg-white/40 p-4 sm:p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(79,70,229,0.06)] sm:p-5">
            {/* Map-paper dot texture, confined to this panel where
                it actually means something (a route on a map) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.55] [background-image:radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.16)_1px,transparent_0)] [background-size:16px_16px]"
            />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">
                  Your route
                </p>
                <p className="mt-1 text-[12px] font-bold text-slate-800">
                  From profile to career target
                </p>
              </div>

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                <Target className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              </div>
            </div>

            {/* Winding route — the one hero animation on this card:
                the line draws itself and a marker travels it, on a
                loop. Everything else stays still. */}
            <div
              className="relative mt-5"
              role="img"
              aria-label="A winding route from profile to skills, projects, and target role, with a marker traveling along it"
            >
              <svg
                viewBox="0 0 300 160"
                className="h-[150px] w-full overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4338CA" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>

                {/* Ghost route — the full path, always visible */}
                <path
                  d={ROUTE_D}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="1 9"
                />

                {/* Drawn route */}
                <path
                  d={ROUTE_D}
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray="100"
                  strokeDashoffset={shouldReduceMotion ? 0 : undefined}
                  className={
                    shouldReduceMotion
                      ? undefined
                      : "animate-[routeDraw_4.2s_ease-in-out_infinite]"
                  }
                />

                {/* Traveling marker */}
                {shouldReduceMotion ? (
                  <circle
                    cx={280}
                    cy={55}
                    r="4.5"
                    fill="#4338CA"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                ) : (
                  <circle r="4.5" fill="#4338CA" stroke="#FFFFFF" strokeWidth="2">
                    <animateMotion
                      dur="4.2s"
                      repeatCount="indefinite"
                      keyTimes="0;0.65;0.88;1"
                      keyPoints="0;1;1;0"
                      calcMode="linear"
                      path={ROUTE_D}
                    />
                  </circle>
                )}

                {/* Pins */}
                {ROADMAP_NODES.map((node) => {
                  const isTarget = node.label === "Target";

                  return (
                    <g key={node.label} transform={`translate(${node.x},${node.y})`}>
                      {isTarget && (
                        <circle
                          r="13"
                          fill="#F59E0B"
                          opacity="0.18"
                          className={
                            shouldReduceMotion
                              ? undefined
                              : "animate-[targetPulse_2.6s_ease-in-out_infinite]"
                          }
                          style={{
                            transformBox: "fill-box",
                            transformOrigin: "50% 50%",
                          }}
                        />
                      )}

                      <path
                        d="M-5,-14 L5,-14 L0,0 Z"
                        fill={isTarget ? "#F59E0B" : "#4338CA"}
                      />

                      <circle
                        cy="-16"
                        r="9"
                        fill={isTarget ? "#F59E0B" : "#4338CA"}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />

                      <text
                        y="-13"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="700"
                        fill="#FFFFFF"
                      >
                        {node.eyebrow}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="mt-1 flex justify-between text-center">
                {ROADMAP_NODES.map((node) => (
                  <span
                    key={node.label}
                    className="w-1/4 text-[9px] font-semibold text-slate-500"
                  >
                    {node.label}
                  </span>
                ))}
              </div>
            </div>

            <Link
              to="/roadmap"
              state={{ from: "analyzer" }}
              className="group relative mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 text-[12px] font-bold text-indigo-700 shadow-[0_6px_16px_rgba(79,70,229,0.08)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-100 hover:to-violet-100 hover:shadow-[0_10px_22px_rgba(79,70,229,0.14)] focus-visible:ring-4 focus-visible:ring-indigo-500/20"
            >
              <span>Get Personalized Roadmap</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </Link>

            <div className="mt-3 flex items-start gap-2">
              <Check
                className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"
                strokeWidth={2.2}
                aria-hidden="true"
              />
              <p className="text-[10px] leading-4 text-slate-400">
                You will review the role setup before anything is generated.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes routeDraw {
          0% {
            stroke-dashoffset: 100;
            opacity: 0.85;
          }

          62% {
            stroke-dashoffset: 0;
            opacity: 1;
          }

          86% {
            stroke-dashoffset: 0;
            opacity: 1;
          }

          94% {
            opacity: 0;
          }

          100% {
            stroke-dashoffset: 100;
            opacity: 0;
          }
        }

        @keyframes targetPulse {
          0%,
          100% {
            transform: scale(0.9);
            opacity: 0.12;
          }

          50% {
            transform: scale(1.15);
            opacity: 0.28;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-\\[routeDraw_4\\.2s_ease-in-out_infinite\\],
          .animate-\\[targetPulse_2\\.6s_ease-in-out_infinite\\] {
            animation: none !important;
          }
        }
      `}</style>
    </motion.section>
  );
}