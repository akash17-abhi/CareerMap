import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  Map,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";

import {
  BackgroundGlow,
  Badge,
} from "../shared/RoadmapUI";

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
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white">
      <BackgroundGlow />

      <section className="careermap-section relative">
        <div className="careermap-container">
          <div
            className="mx-auto max-w-4xl"
            style={{
              animation:
                "careermap-fade-up 0.4s ease-out both",
            }}
          >
            {cameFromAnalyzer && (
              <div className="mb-5 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/analyzer", {
                      state: {
                        from: "roadmap",
                      },
                    })
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10"
                >
                  <FileText
                    className="h-3.5 w-3.5"
                    strokeWidth={1.9}
                  />

                  Go to Resume & JD Analyzer
                </button>
              </div>
            )}

            <header className="mx-auto max-w-2xl text-center">
              <Badge>
                <Map
                  className="h-3.5 w-3.5"
                  strokeWidth={1.9}
                />

                Personalized career roadmap
              </Badge>

              <h1 className="mt-4 text-[2rem] font-bold leading-[1.06] tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Build your path without
                building a long form.
              </h1>

              <p className="mt-3 text-xs leading-5.5 text-slate-500 sm:text-sm sm:leading-6">
                Start with your resume for the
                fastest route, or answer a few
                simple choices to build a profile.
              </p>
            </header>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <EntryCard
                icon={
                  <Upload
                    className="h-5 w-5"
                    strokeWidth={1.8}
                  />
                }
                eyebrow="Fastest setup"
                title="Upload Your Resume"
                description="We extract the information from your resume. You’ll only choose the target job role."
                action="Upload & continue"
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
                title="Haven’t Resume? No Problem — Make Your Profile"
                description="Answer a few simple questions using choices instead of long forms."
                action="Build my profile"
                onClick={onManual}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 sm:p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  strokeWidth={1.9}
                />

                <div>
                  <p className="text-[10px] font-bold text-emerald-900">
                    Privacy-first by design
                  </p>

                  <p className="mt-0.5 text-[9px] leading-4 text-emerald-800/80">
                    Your roadmap profile stays temporary
                    in this session. Nothing is saved as
                    a permanent account profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function EntryCard({
  icon,
  eyebrow,
  title,
  description,
  action,
  onClick,
  featured = false,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex min-h-[250px] flex-col rounded-[1.75rem] border p-5 text-left transition-all duration-200 sm:p-6",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10",
        featured
          ? "border-indigo-100 bg-indigo-50/35 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/55"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.055)]",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-2xl",
          featured
            ? "bg-white text-indigo-600 ring-1 ring-indigo-100"
            : "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="mt-5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-base font-bold leading-5 text-slate-950">
          {title}
        </h2>

        <p className="mt-2 text-[10px] leading-4.5 text-slate-500">
          {description}
        </p>
      </div>

      <span
        className={[
          "mt-auto inline-flex min-h-9 items-center justify-center rounded-xl px-3 text-[9px] font-bold transition",
          featured
            ? "bg-indigo-600 text-white group-hover:bg-indigo-700"
            : "border border-slate-200 bg-white text-slate-700 group-hover:border-slate-300 group-hover:text-slate-900",
        ].join(" ")}
      >
        {action}
      </span>
    </button>
  );
}

export default EntryScreen;