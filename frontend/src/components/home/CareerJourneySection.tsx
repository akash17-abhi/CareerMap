import {
  ArrowRight,
  Search,
  Target,
  Route,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Understand where you are",
    description:
      "See your current skills, experience, strengths, and gaps clearly.",
  },
  {
    number: "02",
    icon: Target,
    title: "Identify what matters",
    description:
      "Compare your profile with your target role and focus on the skills that matter.",
  },
  {
    number: "03",
    icon: Route,
    title: "Take the next step",
    description:
      "Turn your gaps into an ordered and practical learning roadmap.",
  },
];

export default function CareerJourneySection() {
  return (
    <section className="relative overflow-hidden border-y border-slate-100 bg-slate-50/70">
      {/* Soft background accents */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -left-20 top-12 h-40 w-40 rounded-full
          bg-blue-100/25 blur-3xl
          sm:-left-16 sm:h-52 sm:w-52
          lg:-left-20 lg:h-64 lg:w-64
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-20 bottom-8 h-44 w-44 rounded-full
          bg-violet-100/20 blur-3xl
          sm:-right-16 sm:h-56 sm:w-56
          lg:-right-20 lg:h-64 lg:w-64
        "
      />

      <div className="careermap-container relative py-11 sm:py-14 lg:py-16">
        {/* Heading */}
        <div className="max-w-2xl">
          <p className="careermap-eyebrow">
            Your career journey
          </p>

          <h2
            className="
              careermap-heading mt-2 max-w-2xl
              text-[25px] leading-[1.14] tracking-[-0.025em]
              sm:text-3xl
              lg:text-4xl
            "
          >
            From where you are
            <br className="hidden sm:block" />
            <span className="careermap-text-gradient">
              {" "}to where you want to be.
            </span>
          </h2>

          <p
            className="
              careermap-body mt-3 max-w-xl
              text-[13px] leading-5.5
              sm:mt-3.5 sm:text-sm sm:leading-6
              lg:text-base lg:leading-7
            "
          >
            CareerMap helps you understand the gap between your current
            profile and your next career goal.
          </p>
        </div>

        {/* Journey */}
        <div
          className="
            relative mt-6
            sm:mt-8
            lg:mt-9
          "
        >
          {/* Mobile vertical journey rail */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute left-[20px] top-5 bottom-5
              w-px bg-gradient-to-b
              from-blue-200 via-indigo-200 to-violet-200
              sm:left-[22px]
              md:hidden
            "
          />

          <div
            className="
              grid gap-2.5
              sm:gap-4
              md:grid-cols-3
              lg:gap-5
            "
          >
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="
                    group relative overflow-hidden rounded-2xl
                    border border-slate-200 bg-white
                    px-3.5 py-3.5
                    shadow-[0_4px_16px_rgba(15,23,42,0.035)]
                    transition-[transform,box-shadow,border-color]
                    duration-300 ease-out
                    hover:-translate-y-0.5
                    hover:border-blue-200
                    hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]
                    focus-within:border-blue-200
                    focus-within:shadow-[0_10px_24px_rgba(15,23,42,0.06)]
                    sm:px-[18px] sm:py-[18px]
                    lg:p-5
                  "
                >
                  {/* Top accent */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute inset-x-0 top-0 h-px
                      origin-left scale-x-0
                      bg-gradient-to-r
                      from-blue-500 via-indigo-500 to-violet-500
                      opacity-80
                      transition-transform duration-300 ease-out
                      group-hover:scale-x-100
                    "
                  />

                  <div className="flex items-start gap-3">
                    {/* Mobile timeline node */}
                    <div
                      aria-hidden="true"
                      className="
                        relative z-10 mt-0.5 flex h-10 w-10 shrink-0
                        items-center justify-center rounded-xl
                        border border-slate-200 bg-slate-50
                        text-blue-600
                        transition-[background-color,border-color,color,transform]
                        duration-300 ease-out
                        group-hover:border-blue-100
                        group-hover:bg-blue-50
                        group-hover:text-blue-700
                        sm:h-11 sm:w-11
                        md:mt-0
                      "
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Number + title */}
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className="
                            text-[14px] font-bold leading-5
                            tracking-[-0.01em] text-slate-900
                            sm:text-base sm:leading-6
                          "
                        >
                          {step.title}
                        </h3>

                        <span
                          className="
                            shrink-0 pt-0.5 text-[10px] font-bold
                            tracking-[0.08em] text-slate-300
                            transition-colors duration-300
                            group-hover:text-blue-200
                            sm:text-[11px]
                            md:pt-0
                          "
                        >
                          {step.number}
                        </span>
                      </div>

                      <p
                        className="
                          mt-1.5 max-w-xl
                          text-[12.5px] leading-5 text-slate-500
                          sm:mt-2 sm:text-[13px] sm:leading-5.5
                          lg:text-sm lg:leading-6
                        "
                      >
                        {step.description}
                      </p>

                      {/* Continuation cue */}
                      <div
                        className="
                          mt-2.5 flex items-center gap-1.5
                          text-[10px] font-semibold text-blue-600
                          sm:mt-3 sm:text-[11px]
                          md:translate-y-0 md:opacity-0
                          md:transition-[opacity,transform]
                          md:duration-300
                          md:group-hover:translate-y-0
                          md:group-hover:opacity-100
                        "
                      >
                        <span>Next step</span>

                        <ArrowRight
                          size={12}
                          strokeWidth={2}
                          className="
                            transition-transform duration-300
                            group-hover:translate-x-0.5
                          "
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Desktop connector */}
                  {index < steps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none absolute right-[-11px] top-1/2
                        z-10 hidden h-px w-5 -translate-y-1/2
                        md:block
                      "
                    >
                      <div
                        className="
                          relative h-px w-full
                          bg-gradient-to-r from-blue-200 to-indigo-200
                        "
                      >
                        <span
                          className="
                            absolute right-0 top-1/2 h-1.5 w-1.5
                            -translate-y-1/2 translate-x-1/2
                            rounded-full bg-indigo-300
                            ring-4 ring-slate-50/80
                          "
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom accent */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute inset-x-0 bottom-0 h-0.5
                      origin-left scale-x-0
                      bg-gradient-to-r
                      from-blue-500 via-indigo-500 to-violet-500
                      transition-transform duration-300 ease-out
                      group-hover:scale-x-100
                    "
                  />
                </article>
              );
            })}
          </div>
        </div>

        {/* Mobile progression indicator */}
        <div
          aria-hidden="true"
          className="
            mt-4 flex items-center justify-center
            md:hidden
          "
        >
          <div className="flex items-center gap-1.5">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex items-center gap-1.5"
              >
                <span
                  className={`
                    block h-1.5 rounded-full
                    ${
                      index === 0
                        ? "w-5 bg-blue-400"
                        : "w-1.5 bg-slate-300"
                    }
                  `}
                />

                {index < steps.length - 1 && (
                  <span
                    className="
                      h-px w-3 bg-slate-200
                    "
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}