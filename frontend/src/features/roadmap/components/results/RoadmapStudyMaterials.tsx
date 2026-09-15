import {
  ArrowUpRight,
  BookOpen,
  Code2,
  FileText,
  GraduationCap,
  PlayCircle,
  Timer,
  Wrench,
} from "lucide-react";

import type {
  GeneratedRoadmapPhase,
  StudyResource,
} from "../../types/roadmap";

interface RoadmapStudyMaterialsProps {
  phase: GeneratedRoadmapPhase;
}

export default function RoadmapStudyMaterials({
  phase,
}: RoadmapStudyMaterialsProps) {
  const resources = phase.learn.study_materials;

  if (resources.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-slate-400" />

          <h4 className="text-sm font-bold text-slate-800">
            Study materials
          </h4>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          No specific study materials were provided for this phase.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600" />

            <h4 className="text-sm font-black text-slate-900">
              Study materials
            </h4>
          </div>

          <p className="mt-1 text-[10px] leading-4 text-slate-500">
            Resources selected for the learning stage of this phase.
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold text-slate-500">
          {resources.length}{" "}
          {resources.length === 1 ? "resource" : "resources"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {resources.map((resource, index) => (
          <StudyResourceCard
            key={`${index}-${resource.title}`}
            resource={resource}
          />
        ))}
      </div>
    </section>
  );
}

function StudyResourceCard({
  resource,
}: {
  resource: StudyResource;
}) {
  const resourceIcon = getResourceIcon(resource.type);

  return (
    <article className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-slate-200">
          {resourceIcon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[8px] font-bold capitalize text-slate-500">
              {formatResourceType(resource.type)}
            </span>

            {resource.provider ? (
              <span className="truncate text-[9px] font-semibold text-slate-400">
                {resource.provider}
              </span>
            ) : null}
          </div>

          <h5 className="mt-2 break-words text-xs font-bold leading-5 text-slate-900">
            {resource.title}
          </h5>

          {resource.description ? (
            <p className="mt-1.5 text-[10px] leading-4.5 text-slate-500">
              {resource.description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {typeof resource.estimated_minutes ===
            "number" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-slate-500 ring-1 ring-slate-200">
                <Timer className="h-3 w-3" />
                {formatEstimatedTime(
                  resource.estimated_minutes,
                )}
              </span>
            ) : null}

            {resource.url ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 text-[9px] font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10"
              >
                Open
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ) : (
              <span className="ml-auto text-[8px] font-semibold text-slate-400">
                Link not provided
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function getResourceIcon(
  type: StudyResource["type"],
) {
  switch (type) {
    case "video":
      return <PlayCircle className="h-4 w-4" />;

    case "documentation":
      return <FileText className="h-4 w-4" />;

    case "course":
      return <GraduationCap className="h-4 w-4" />;

    case "book":
      return <BookOpen className="h-4 w-4" />;

    case "tutorial":
      return <Code2 className="h-4 w-4" />;

    case "practice":
      return <Wrench className="h-4 w-4" />;

    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

function formatResourceType(
  type: StudyResource["type"],
) {
  switch (type) {
    case "documentation":
      return "Documentation";

    case "video":
      return "Video";

    case "course":
      return "Course";

    case "book":
      return "Book";

    case "tutorial":
      return "Tutorial";

    case "practice":
      return "Practice";

    default:
      return type;
  }
}

function formatEstimatedTime(
  minutes: number,
) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}