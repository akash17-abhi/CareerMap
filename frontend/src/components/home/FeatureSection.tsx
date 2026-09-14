import {
  ArrowRight,
  FileSearch,
  Map,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    number: "01",
    icon: FileSearch,
    accent: "blue",
    title: "Resume & JD Analyzer",
    heading: "Know exactly where you stand.",
    description:
      "Compare your resume with a target job description to understand your match, missing skills, and the improvements that can make your application stronger.",
    highlights: [
      "Resume & JD matching",
      "Skill gap detection",
      "ATS-focused insights",
    ],
    link: "/analyzer",
    linkLabel: "Analyze my resume",
  },
  {
    number: "02",
    icon: Map,
    accent: "violet",
    title: "Personalized Career Roadmap",
    heading: "Turn your goal into a clear path.",
    description:
      "Use your current profile and target role to identify the skills, priorities, projects, and next steps that move you forward.",
    highlights: [
      "Skill gap prioritization",
      "Step-by-step learning path",
      "Project-based progression",
    ],
    link: "/roadmap",
    linkLabel: "Build my roadmap",
  },
];

export default function FeatureSection() {
  return (
    <section className="careermap-section overflow-hidden">
      <div className="careermap-container">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="careermap-eyebrow">
            Two tools. One clearer direction.
          </p>

          <h2
            className="
              careermap-heading mt-2
              text-[24px] leading-[1.16] tracking-[-0.025em]
              sm:text-3xl
              lg:text-4xl
            "
          >
            Built around the decisions
            <br className="hidden sm:block" /> that matter most.
          </h2>

          <p
            className="
              careermap-body mx-auto mt-3 max-w-xl
              text-[13px] leading-5
              sm:mt-3.5 sm:text-sm sm:leading-6
              lg:text-base lg:leading-7
            "
          >
            CareerMap focuses on two practical questions: how well you fit
            your target role, and what you should do next.
          </p>
        </div>

        {/* Feature cards */}
        <div
          className="
            mt-5 grid gap-2.5
            sm:mt-7 sm:gap-4
            lg:mt-8 lg:grid-cols-2 lg:gap-4
          "
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const isBlue = feature.accent === "blue";

            const accentColor = isBlue
              ? "text-blue-600"
              : "text-violet-600";

            const iconStyles = isBlue
              ? "border-blue-100 bg-blue-50 text-blue-600 group-hover:border-blue-200"
              : "border-violet-100 bg-violet-50 text-violet-600 group-hover:border-violet-200";

            const linkStyles = isBlue
              ? "text-blue-600 hover:text-blue-700 focus-visible:ring-blue-500/30"
              : "text-violet-600 hover:text-violet-700 focus-visible:ring-violet-500/30";

            const accentBar = isBlue
              ? "bg-blue-500"
              : "bg-violet-500";

            return (
              <article
                key={feature.number}
                className="
                  group relative overflow-hidden rounded-xl
                  border border-slate-200 bg-white
                  px-3 py-3
                  shadow-[0_3px_12px_rgba(15,23,42,0.03)]
                  transition-[transform,box-shadow,border-color]
                  duration-300 ease-out
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:shadow-[0_8px_20px_rgba(15,23,42,0.055)]
                  focus-within:border-slate-300
                  focus-within:shadow-[0_8px_20px_rgba(15,23,42,0.055)]
                  sm:px-4 sm:py-4
                  lg:p-4.5
                "
              >
                {/* Top accent */}
                <div
                  aria-hidden="true"
                  className={[
                    "pointer-events-none absolute inset-x-0 top-0 h-px",
                    "origin-left scale-x-0 opacity-80",
                    "transition-transform duration-300 ease-out",
                    "group-hover:scale-x-100",
                    accentBar,
                  ].join(" ")}
                />

                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={[
                      "flex h-8.5 w-8.5 shrink-0 items-center justify-center",
                      "rounded-lg border",
                      "transition-[background-color,border-color,color,transform]",
                      "duration-300 ease-out",
                      "group-hover:scale-[1.02]",
                      iconStyles,
                    ].join(" ")}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>

                  <span
                    className="
                      text-[9px] font-bold
                      tracking-[0.08em] text-slate-300
                      transition-colors duration-300
                      group-hover:text-slate-400
                      sm:text-[10px]
                    "
                  >
                    {feature.number}
                  </span>
                </div>

                {/* Feature title */}
                <p
                  className={[
                    "mt-3 text-[8.5px] font-bold uppercase tracking-[0.09em]",
                    accentColor,
                  ].join(" ")}
                >
                  {feature.title}
                </p>

                {/* Heading */}
                <h3
                  className="
                    mt-1
                    max-w-xl
                    text-[16px] font-bold leading-[1.2]
                    tracking-[-0.018em] text-slate-900
                    sm:text-lg
                    lg:text-xl
                  "
                >
                  {feature.heading}
                </h3>

                {/* Description */}
                <p
                  className="
                    mt-1.5 max-w-xl
                    text-[11.5px] leading-[1.55] text-slate-500
                    sm:mt-2 sm:text-[13px] sm:leading-5.5
                  "
                >
                  {feature.description}
                </p>

                {/* Highlights */}
                <div
                  className="
                    mt-3 grid gap-1.5
                    sm:mt-4 sm:gap-2
                  "
                >
                  {feature.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="
                        flex items-center gap-2
                        rounded-md border border-slate-100
                        bg-slate-50/60 px-2 py-1.25
                        transition-colors duration-200
                        group-hover:border-slate-200
                      "
                    >
                      <span
                        className={[
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          isBlue
                            ? "bg-blue-50 text-blue-600"
                            : "bg-violet-50 text-violet-600",
                        ].join(" ")}
                      >
                        <span className="h-1.25 w-1.25 rounded-full bg-current" />
                      </span>

                      <span
                        className="
                          min-w-0 text-[10px] font-medium leading-4
                          text-slate-600
                          sm:text-[11px] sm:leading-4.5
                        "
                      >
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Link */}
                <Link
                  to={feature.link}
                  className={[
                    "mt-3 inline-flex min-h-9 items-center gap-1.5",
                    "rounded-lg text-[10.5px] font-semibold",
                    "outline-none transition-[color,transform]",
                    "duration-200 focus-visible:ring-4",
                    "sm:mt-4 sm:text-xs",
                    linkStyles,
                  ].join(" ")}
                >
                  <span>{feature.linkLabel}</span>

                  <ArrowRight
                    size={13}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="
                      transition-transform duration-200 ease-out
                      group-hover:translate-x-0.5
                    "
                  />
                </Link>

                {/* Bottom accent */}
                <div
                  aria-hidden="true"
                  className={[
                    "pointer-events-none absolute inset-x-0 bottom-0 h-0.5",
                    "origin-left scale-x-0",
                    "transition-transform duration-300 ease-out",
                    "group-hover:scale-x-100",
                    accentBar,
                  ].join(" ")}
                />
              </article>
            );
          })}
        </div>

        {/* Privacy note */}
        <div
          className="
            mx-auto mt-3 flex max-w-xl items-start
            justify-center gap-2 px-2 text-center
            sm:mt-5 sm:items-center
          "
        >
          <span
            aria-hidden="true"
            className="
              mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full
              bg-emerald-500 sm:mt-0
            "
          />

          <p
            className="
              text-[9.5px] leading-4 text-slate-500
              sm:text-[11px] sm:leading-5
            "
          >
            Your career information is processed temporarily and isn't
            permanently stored.
          </p>
        </div>
      </div>
    </section>
  );
}