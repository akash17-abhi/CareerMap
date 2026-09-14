import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

import ResumeAnalysisPreview from "@/components/home/ResumeAnalysisPreview";

export default function HeroSection() {
  return (
    <section className="careermap-page-glow overflow-hidden">
      <div className="careermap-container">
        <div className="grid items-center gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16 lg:py-20 xl:gap-20 xl:py-24">
          {/* Hero content */}
          <div className="min-w-0 max-w-2xl">
            {/* Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-blue-700 sm:mb-5 sm:text-xs">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-blue-600"
              />
              Privacy-First AI Career Assistant
            </div>

            <h1 className="careermap-heading max-w-3xl text-[32px] leading-[1.08] tracking-[-0.03em] sm:text-4xl sm:leading-[1.08] lg:text-[52px] xl:text-[58px]">
              Your next career step
              <br className="hidden sm:block" />
              <span className="careermap-text-gradient">
                starts with clarity.
              </span>
            </h1>

            <p className="careermap-body mt-4 max-w-xl text-sm leading-6 sm:mt-5 sm:text-base sm:leading-7 lg:text-[17px]">
              Understand how your experience matches your target role,
              identify the skills you need next, and turn your career goal
              into a practical path forward.
            </p>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
              <Link
                to="/analyzer"
                className="careermap-button careermap-button-primary min-h-12 w-full justify-center px-5 sm:w-auto"
              >
                Analyze my resume
                <ArrowRight size={16} strokeWidth={2} />
              </Link>

              <Link
                to="/roadmap"
                className="careermap-button careermap-button-secondary min-h-12 w-full justify-center px-5 sm:w-auto"
              >
                Build my career roadmap
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5 sm:mt-6">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
                  <LockKeyhole
                    size={12}
                    strokeWidth={1.9}
                    className="text-emerald-700"
                    aria-hidden="true"
                  />
                </span>

                <span className="text-[11px] font-medium text-slate-600 sm:text-xs">
                  Privacy-first processing
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
                  <Check
                    size={13}
                    strokeWidth={2.2}
                    className="text-emerald-700"
                    aria-hidden="true"
                  />
                </span>

                <span className="text-[11px] font-medium text-slate-600 sm:text-xs">
                  No account required
                </span>
              </div>
            </div>

            {/* Supporting message */}
            <div className="mt-6 flex max-w-lg items-start gap-3 border-t border-slate-200 pt-5 sm:mt-7 sm:pt-6">
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"
              />

              <p className="text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                Analyze your fit. Understand your gaps. Build a clearer path
                toward your target role.
              </p>
            </div>
          </div>

          {/* Resume analysis visual */}
          <div className="relative flex min-w-0 justify-center px-0 pt-1 sm:px-3 sm:pt-3 lg:px-0 lg:pt-0">
            {/* Subtle visual glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/60 blur-3xl sm:h-80 sm:w-80"
            />

            <div className="w-full max-w-[560px]">
              <ResumeAnalysisPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}