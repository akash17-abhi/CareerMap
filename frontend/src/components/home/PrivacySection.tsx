import {
  Brain,
  LockKeyhole,
  Trash2,
} from "lucide-react";

const principles = [
  {
    icon: Trash2,
    title: "No permanent storage",
    description:
      "Your career information isn't kept as a permanent profile or history.",
  },
  {
    icon: Brain,
    title: "Temporary processing",
    description:
      "Information is processed to provide the requested analysis or recommendation.",
  },
  {
    icon: LockKeyhole,
    title: "Protected AI credentials",
    description:
      "AI service credentials stay on the server instead of being exposed in the browser.",
  },
];

export default function PrivacySection() {
  return (
    <section className="relative overflow-hidden border-t border-slate-100 bg-slate-50/70">
      {/* Soft background accents */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -left-24 top-10
          h-40 w-40 rounded-full bg-emerald-100/20 blur-3xl
          sm:h-52 sm:w-52
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-24 bottom-8
          h-44 w-44 rounded-full bg-blue-100/20 blur-3xl
          sm:h-56 sm:w-56
        "
      />

      <div className="careermap-container relative py-11 sm:py-14 lg:py-16">
        <div
          className="
            grid gap-7
            lg:grid-cols-[0.88fr_1.12fr]
            lg:items-center lg:gap-12
            xl:gap-16
          "
        >
          {/* Intro */}
          <div className="max-w-xl">
            <p className="careermap-eyebrow">
              Privacy by design
            </p>

            <h2
              className="
                careermap-heading mt-2
                text-[24px] leading-[1.15] tracking-[-0.025em]
                sm:text-3xl
                lg:text-4xl
              "
            >
              Your career information
              <br className="hidden sm:block" /> stays yours.
            </h2>

            <p
              className="
                careermap-body mt-3 max-w-lg
                text-[13px] leading-5.5
                sm:mt-3.5 sm:text-sm sm:leading-6
                lg:text-base lg:leading-7
              "
            >
              CareerMap is designed around temporary processing rather than
              building a permanent profile about you.
            </p>
          </div>

          {/* Privacy principles */}
          <div
            className="
              grid gap-2.5
              sm:grid-cols-3 sm:gap-3
            "
          >
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <article
                  key={principle.title}
                  tabIndex={0}
                  className="
                    group relative overflow-hidden rounded-xl
                    border border-slate-200 bg-white
                    px-3 py-3
                    shadow-[0_3px_12px_rgba(15,23,42,0.025)]
                    outline-none
                    transition-[transform,box-shadow,border-color]
                    duration-300 ease-out
                    hover:-translate-y-0.5
                    hover:border-emerald-200
                    hover:shadow-[0_8px_20px_rgba(15,23,42,0.045)]
                    focus-visible:-translate-y-0.5
                    focus-visible:border-emerald-300
                    focus-visible:ring-4
                    focus-visible:ring-emerald-500/10
                    focus-visible:shadow-[0_8px_20px_rgba(15,23,42,0.045)]
                    sm:px-3.5 sm:py-3.5
                  "
                >
                  {/* Subtle top accent */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute inset-x-0 top-0 h-px
                      origin-left scale-x-0
                      bg-emerald-500/70
                      transition-transform duration-300 ease-out
                      group-hover:scale-x-100
                      group-focus-visible:scale-x-100
                    "
                  />

                  {/* Icon */}
                  <div
                    aria-hidden="true"
                    className="
                      flex h-8 w-8 items-center justify-center
                      rounded-lg border border-emerald-100
                      bg-emerald-50 text-emerald-600
                      transition-[background-color,border-color,transform]
                      duration-300 ease-out
                      group-hover:border-emerald-200
                      group-hover:bg-emerald-50
                      group-hover:scale-[1.02]
                      group-focus-visible:border-emerald-200
                      group-focus-visible:scale-[1.02]
                      sm:h-9 sm:w-9
                    "
                  >
                    <Icon
                      size={15}
                      strokeWidth={1.8}
                    />
                  </div>

                  {/* Text content */}
                  <div className="min-w-0">
                    <h3
                      className="
                        mt-2.5
                        text-[11px] font-bold leading-4
                        tracking-[-0.005em] text-slate-800
                        sm:mt-3 sm:text-xs sm:leading-5
                      "
                    >
                      {principle.title}
                    </h3>

                    <p
                      className="
                        mt-1 text-[10px] leading-4
                        text-slate-500
                        sm:text-[11px] sm:leading-4.5
                      "
                    >
                      {principle.description}
                    </p>
                  </div>

                  {/* Bottom accent */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute inset-x-0 bottom-0 h-0.5
                      origin-left scale-x-0
                      bg-emerald-500/80
                      transition-transform duration-300 ease-out
                      group-hover:scale-x-100
                      group-focus-visible:scale-x-100
                    "
                  />
                </article>
              );
            })}
          </div>
        </div>

        {/* Privacy principle statement */}
        <div
          className="
            mt-7 border-t border-slate-200
            pt-5 text-center
            sm:mt-8 sm:pt-6
          "
        >
          <p
            className="
              text-[10.5px] font-semibold leading-5
              tracking-wide text-slate-500
              sm:text-xs
              lg:text-sm
            "
          >
            Analyze locally.
            <span className="mx-1.5 text-slate-300 sm:mx-2">
              •
            </span>
            Understand intelligently.
            <span className="mx-1.5 text-slate-300 sm:mx-2">
              •
            </span>
            Save nothing.
          </p>
        </div>
      </div>
    </section>
  );
}