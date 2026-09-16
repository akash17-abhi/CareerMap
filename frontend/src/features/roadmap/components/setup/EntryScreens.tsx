import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  LockKeyhole,
  Map,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";

import { BackgroundGlow, Badge } from "../shared/RoadmapUI";
import EntryCard from "./EntryCard";

interface EntryScreenProps {
  onResume: () => void;
  onManual: () => void;
}

function EntryScreen({
  onResume,
  onManual,
}: EntryScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const cameFromAnalyzer =
    location.state?.from === "analyzer";

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white px-0">
      <BackgroundGlow />

      {/* Soft ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-[-10rem] h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-indigo-100/25 blur-3xl" />

        <div className="absolute bottom-[-12rem] left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-blue-100/20 blur-3xl" />

        <div className="absolute right-[-8rem] top-1/3 h-[22rem] w-[22rem] rounded-full bg-violet-100/15 blur-3xl" />
      </div>

      <section className="relative">
        <div className="careermap-container">
          <div
            className="mx-auto max-w-5xl motion-reduce:animate-none"
            style={{
              animation:
                "careermap-fade-up 0.45s ease-out both",
            }}
          >
            {/* Back to Analyzer */}
            {cameFromAnalyzer && (
              <div className="mb-5 flex justify-start sm:mb-8">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/analyzer", {
                      state: {
                        from: "roadmap",
                      },
                    })
                  }
                  aria-label="Return to Resume and JD Analyzer"
                  className="group inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:text-slate-950 hover:shadow-md active:scale-[0.995] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 sm:min-h-10"
                >
                  <FileText
                    className="h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-500"
                    strokeWidth={1.8}
                  />

                  <span>Back to Resume &amp; JD Analyzer</span>

                  <ArrowRight
                    className="h-3.5 w-3.5 rotate-180 text-slate-400 transition-transform group-hover:-translate-x-0.5"
                    strokeWidth={1.8}
                  />
                </button>
              </div>
            )}

            {/* Hero */}
            <header className="mx-auto max-w-3xl text-center">
              <Badge>
                <Map
                  className="h-3.5 w-3.5"
                  strokeWidth={1.9}
                />

                Personalized career roadmap
              </Badge>

              <h1 className="mx-auto mt-5 max-w-3xl text-[2.15rem] font-bold leading-[1.06] tracking-[-0.045em] text-slate-950 sm:mt-6 sm:text-[3.15rem] lg:text-[3.4rem]">
                Build a career path
                <br className="hidden sm:block" />{" "}
                that fits where you are.
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-[13px] leading-5.5 text-slate-500 sm:mt-5 sm:text-[15px] sm:leading-7">
                Start with your resume or tell us about your
                current skills. CareerMap will create a
                personalized path for what to learn, build,
                and improve next.
              </p>
            </header>

            {/* Setup options */}
            <div
              aria-label="Choose how to start your career roadmap"
              className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2"
            >
              <EntryCard
                icon={
                  <Upload
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                }
                eyebrow="Recommended · Fastest setup"
                title="Start with your resume"
                description="Upload your resume and let CareerMap extract your education, experience, skills, and projects automatically."
                action="Upload Resume"
                onClick={onResume}
                featured
              />

              <EntryCard
                icon={
                  <UserRound
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                }
                eyebrow="No resume needed"
                title="Build your profile"
                description="Answer 10 simple guided questions about your background, skills, goals, and learning preferences."
                action="Build My Profile"
                onClick={onManual}
              />
            </div>

            {/* Trust / privacy */}
            <div className="mx-auto mt-7 max-w-4xl">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/55 px-4 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                    <ShieldCheck
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.9}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-[12px] font-bold text-emerald-950 sm:text-[13px]">
                        Privacy-first by design
                      </p>

                      <span className="hidden h-1 w-1 rounded-full bg-emerald-300 sm:block" />

                      <span className="text-[10px] font-medium text-emerald-700 sm:text-[11px]">
                        No permanent profile required
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] leading-4.5 text-emerald-800/75 sm:text-xs sm:leading-5.5">
                      Your resume and roadmap profile stay
                      temporary during this session. CareerMap
                      does not create a permanent account profile
                      for your career data.
                    </p>
                  </div>

                  <LockKeyhole
                    className="mt-1 hidden h-4 w-4 shrink-0 text-emerald-500 sm:block"
                    strokeWidth={1.8}
                  />
                </div>
              </div>
            </div>

            {/* Small process hint */}
            <div className="mx-auto mt-7 flex max-w-xl items-center justify-center gap-2 text-center text-[10px] font-medium text-slate-400 sm:text-[11px]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>
                Your answers are used only to personalize your
                roadmap.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default EntryScreen;
