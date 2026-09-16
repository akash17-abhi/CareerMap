import type {
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";

import {
  BriefcaseBusiness,
  Check,
  Code2,
  Hammer,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import ChoiceButton from "./ChoiceButton";

import type {
  RoadmapProfile,
  RoadmapProject,
  RoadmapSkill,
} from "../../types/roadmap";

import {
  EDUCATION_FIELDS,
  EDUCATION_LEVELS,
  EXPERIENCE_OPTIONS,
  EXPERIENCE_TYPES,
  GOAL_OPTIONS,
  LEARNING_STYLE_OPTIONS,
  LEARNING_TIME_OPTIONS,
  LEVEL_OPTIONS,
  ROLE_SUGGESTIONS,
  SKILL_SUGGESTIONS,
  TIMELINE_OPTIONS,
} from "../../utils/roadmapConstants";

interface ProfileStepContentProps {
  step: number;
  profile: RoadmapProfile;

  customSkill: string;
  customEducationField: string;

  projectDraft: RoadmapProject;

  updateProfile: <
    K extends keyof RoadmapProfile,
  >(
    key: K,
    value: RoadmapProfile[K],
  ) => void;

  toggleSkill: (name: string) => void;

  addCustomSkill: () => void;
  setCustomSkill: (value: string) => void;

  updateSkillLevel: (
    skillName: string,
    level: RoadmapSkill["level"],
  ) => void;

  toggleExperienceType: (
    type: string,
  ) => void;

  setCustomEducationField: (
    value: string,
  ) => void;

  addProject: () => void;

  setProjectDraft: Dispatch<
    SetStateAction<RoadmapProject>
  >;

  removeProject: (id: string) => void;

  toggleLearningPreference: (
    value: string,
  ) => void;

  /**
   * Kept for compatibility with older call sites.
   */
  iconOnly?: boolean;
}

function createEmptyProject(): RoadmapProject {
  return {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    name: "",
    technologies: [],
    contribution: "",
    status: "completed",
  };
}

function SectionLabel({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      {eyebrow ? (
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-indigo-600">
          {eyebrow}
        </p>
      ) : null}

      <h2 className="mt-1 text-sm font-bold tracking-tight text-slate-900 sm:text-base">
        {title}
      </h2>

      {description ? (
        <p className="mt-1 text-[10px] leading-4.5 text-slate-500 sm:text-xs sm:leading-5">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ChoiceRow({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "group flex min-h-[68px] w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left outline-none transition-all duration-200",
        "sm:min-h-[74px] sm:px-4",
        selected
          ? "border-indigo-300 bg-indigo-50 text-indigo-900 shadow-[0_2px_10px_rgba(79,70,229,0.07)]"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
        "focus-visible:ring-4 focus-visible:ring-indigo-500/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
      ].join(" ")}
    >
      {icon ? (
        <span
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
            selected
              ? "bg-indigo-100 text-indigo-700"
              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
          ].join(" ")}
        >
          {icon}
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold leading-4 sm:text-xs">
          {title}
        </span>

        {description ? (
          <span className="mt-0.5 block text-[9px] font-medium leading-4 text-slate-500 sm:text-[10px]">
            {description}
          </span>
        ) : null}
      </span>

      <span
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
          selected
            ? "border-indigo-500 bg-indigo-600 text-white"
            : "border-slate-300 bg-white text-transparent",
        ].join(" ")}
        aria-hidden="true"
      >
        <Check
          className="h-3 w-3"
          strokeWidth={2.3}
        />
      </span>
    </button>
  );
}

function RoleProfileStep({
  profile,
  onSelect,
  onChange,
}: {
  profile: RoadmapProfile;
  onSelect: (role: string) => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <SectionLabel
        eyebrow="01"
        title="Choose your target role"
        description="Pick the closest role or type your own."
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {ROLE_SUGGESTIONS.map((role) => (
          <ChoiceButton
            key={role}
            selected={
              profile.preferredRole.toLowerCase() ===
              role.toLowerCase()
            }
            onClick={() => onSelect(role)}
          >
            {role}
          </ChoiceButton>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
        <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-[10px]">
          <Search
            className="h-3.5 w-3.5"
            strokeWidth={1.9}
          />
          Custom role
        </label>

        <div className="relative mt-2.5">
          <BriefcaseBusiness
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={1.8}
          />

          <input
            id="roadmap-custom-role"
            name="roadmap-custom-role"
            autoComplete="organization-title"
            value={profile.preferredRole}
            onChange={(event) =>
              onChange(event.target.value)
            }
            aria-describedby="roadmap-role-help"
            placeholder="e.g. Data Engineer"
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <p
          id="roadmap-role-help"
          className="mt-2 text-[9px] leading-4 text-slate-400"
        >
          Use a specific role such as Data Analyst, ML Engineer, or Frontend Developer.
        </p>
      </div>
    </div>
  );
}

function LevelStep({
  profile,
  updateProfile,
}: {
  profile: RoadmapProfile;
  updateProfile: ProfileStepContentProps["updateProfile"];
}) {
  return (
    <div>
      <SectionLabel
        eyebrow="02"
        title="Where are you starting from?"
        description="Choose the level that feels closest to your current ability."
      />

      <div className="space-y-2.5">
        {LEVEL_OPTIONS.map((option) => {
          const Icon = option.icon;

          return (
            <ChoiceRow
              key={option.value}
              selected={
                profile.currentLevel === option.value
              }
              onClick={() =>
                updateProfile(
                  "currentLevel",
                  option.value,
                )
              }
              icon={
                <Icon
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              }
              title={option.title}
              description={option.description}
            />
          );
        })}
      </div>
    </div>
  );
}

function GoalStep({
  profile,
  updateProfile,
}: {
  profile: RoadmapProfile;
  updateProfile: ProfileStepContentProps["updateProfile"];
}) {
  return (
    <div>
      <SectionLabel
        eyebrow="03"
        title="What is your main goal?"
        description="Choose the outcome that matters most right now."
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {GOAL_OPTIONS.map((option) => (
          <ChoiceButton
            key={option.value}
            selected={
              profile.careerGoal === option.value
            }
            onClick={() =>
              updateProfile(
                "careerGoal",
                option.value,
              )
            }
            className="min-h-[84px] justify-start text-left"
          >
            <span className="block">
              <span className="block text-[11px] font-bold text-slate-900 sm:text-xs">
                {option.title}
              </span>

              <span className="mt-1 block text-[9px] font-medium leading-4 text-slate-500 sm:text-[10px]">
                {option.description}
              </span>
            </span>
          </ChoiceButton>
        ))}
      </div>
    </div>
  );
}

function EducationStep({
  profile,
  customEducationField,
  setCustomEducationField,
  updateProfile,
}: {
  profile: RoadmapProfile;
  customEducationField: string;
  setCustomEducationField: (
    value: string,
  ) => void;
  updateProfile: ProfileStepContentProps["updateProfile"];
}) {
  const isOtherField =
    profile.education.field === "Other";

  return (
    <div>
      <SectionLabel
        eyebrow="04"
        title="Tell us about your education"
        description="Choose the closest options. Use a custom value only when needed."
      />

      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Education level
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EDUCATION_LEVELS.map((level) => (
            <ChoiceButton
              key={level}
              selected={
                profile.education.level === level
              }
              onClick={() =>
                updateProfile("education", {
                  ...profile.education,
                  level,
                })
              }
              className="min-h-12"
            >
              {level}
            </ChoiceButton>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Field of study
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EDUCATION_FIELDS.map((field) => (
            <ChoiceButton
              key={field}
              selected={
                profile.education.field === field
              }
              onClick={() =>
                updateProfile("education", {
                  ...profile.education,
                  field,
                })
              }
              className="min-h-12"
            >
              {field}
            </ChoiceButton>
          ))}
        </div>

        {isOtherField ? (
          <input
            id="roadmap-custom-education"
            name="roadmap-custom-education"
            autoComplete="organization"
            value={customEducationField}
            onChange={(event) =>
              setCustomEducationField(
                event.target.value,
              )
            }
            aria-label="Custom education field"
            placeholder="Enter your field"
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />
        ) : null}
      </div>
    </div>
  );
}

function ExperienceStep({
  profile,
  updateProfile,
  toggleExperienceType,
}: {
  profile: RoadmapProfile;
  updateProfile: ProfileStepContentProps["updateProfile"];
  toggleExperienceType: (
    type: string,
  ) => void;
}) {
  return (
    <div>
      <SectionLabel
        eyebrow="05"
        title="What experience do you already have?"
        description="Choose your level, then add the kinds of experience that apply."
      />

      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Experience level
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCE_OPTIONS.map((option) => (
            <ChoiceButton
              key={option}
              selected={
                profile.experience.level === option
              }
              onClick={() =>
                updateProfile("experience", {
                  ...profile.experience,
                  level: option,
                })
              }
              className="min-h-12"
            >
              {option}
            </ChoiceButton>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Experience type
        </p>

        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_TYPES.map((type) => {
            const selected =
              profile.experience.types.includes(
                type,
              );

            return (
              <button
                key={type}
                type="button"
                onClick={() =>
                  toggleExperienceType(type)
                }
                aria-pressed={selected}
                className={[
                  "min-h-10 rounded-full border px-3.5 text-[10px] font-semibold outline-none transition",
                  selected
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  "focus-visible:ring-4 focus-visible:ring-indigo-500/10",
                ].join(" ")}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Optional details
        </label>

        <textarea
          value={profile.experience.details}
          onChange={(event) =>
            updateProfile("experience", {
              ...profile.experience,
              details: event.target.value,
            })
          }
          rows={4}
          placeholder="Example: completed a 3-month data analytics internship..."
          className="mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>
  );
}

function SkillsStep({
  profile,
  customSkill,
  setCustomSkill,
  toggleSkill,
  addCustomSkill,
  updateSkillLevel,
}: {
  profile: RoadmapProfile;
  customSkill: string;
  setCustomSkill: (value: string) => void;
  toggleSkill: (name: string) => void;
  addCustomSkill: () => void;
  updateSkillLevel: (
    skillName: string,
    level: RoadmapSkill["level"],
  ) => void;
}) {
  return (
    <div>
      <SectionLabel
        eyebrow="06"
        title="Which skills do you already have?"
        description="Select everything that you can already use, even at a basic level."
      />

      <div className="flex flex-wrap gap-2">
        {SKILL_SUGGESTIONS.map((skill) => {
          const selected = profile.skills.some(
            (item) =>
              item.name.toLowerCase() ===
              skill.toLowerCase(),
          );

          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              aria-pressed={selected}
              className={[
                "min-h-10 rounded-full border px-3.5 text-[10px] font-semibold outline-none transition",
                selected
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                "focus-visible:ring-4 focus-visible:ring-indigo-500/10",
              ].join(" ")}
            >
              {selected ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check
                    className="h-3 w-3"
                    strokeWidth={2.2}
                  />
                  {skill}
                </span>
              ) : (
                skill
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
        <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
          <Plus
            aria-hidden="true"
            className="h-3.5 w-3.5"
            strokeWidth={2}
          />
          Add another skill
        </label>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="roadmap-custom-skill"
            name="roadmap-custom-skill"
            autoComplete="off"
            value={customSkill}
            onChange={(event) =>
              setCustomSkill(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                addCustomSkill();
              }
            }}
            placeholder="e.g. Power Query"
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />

          <button
            type="button"
            onClick={addCustomSkill}
            disabled={!customSkill.trim()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-[10px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>

      {profile.skills.length > 0 ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Selected skills
            </p>

            <span className="text-[9px] font-semibold text-slate-400">
              {profile.skills.length} selected
            </span>
          </div>

          <div className="space-y-2">
            {profile.skills.map((skill) => (
              <div
                key={skill.name}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Code2 className="h-3.5 w-3.5" />
                    </span>

                    <span className="min-w-0 truncate text-[10px] font-bold text-slate-800 sm:text-[11px]">
                      {skill.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      toggleSkill(skill.name)
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/10"
                    aria-label={`Remove ${skill.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(
                    [
                      "beginner",
                      "intermediate",
                      "strong",
                    ] as const
                  ).map((level) => {
                    const selected =
                      skill.level === level;

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          updateSkillLevel(
                            skill.name,
                            level,
                          )
                        }
                        className={[
                          "min-h-9 rounded-lg px-3 text-[9px] font-bold capitalize outline-none transition",
                          selected
                            ? "bg-slate-900 text-white"
                            : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100",
                        ].join(" ")}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3.5 py-4 text-center">
          <p className="text-[9px] leading-4 text-slate-400">
            Select at least one skill to continue.
          </p>
        </div>
      )}
    </div>
  );
}

function ProjectsStep({
  profile,
  projectDraft,
  setProjectDraft,
  addProject,
  removeProject,
}: {
  profile: RoadmapProfile;
  projectDraft: RoadmapProject;
  setProjectDraft: Dispatch<
    SetStateAction<RoadmapProject>
  >;
  addProject: () => void;
  removeProject: (id: string) => void;
}) {
  const hasProjects =
    profile.projects.length > 0;

  return (
    <div>
      <SectionLabel
        eyebrow="07"
        title="Do you have projects already?"
        description="Projects are optional. Existing projects help CareerMap calibrate the roadmap, but you can build new ones later."
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <ChoiceButton
          selected={!hasProjects}
          onClick={() => {
            if (hasProjects) {
              profile.projects.forEach((project) =>
                removeProject(project.id),
              );
            }
          }}
          className="min-h-[88px] justify-start text-left"
        >
          <span className="block">
            <span className="block text-[11px] font-bold text-slate-900">
              Not yet
            </span>

            <span className="mt-1 block text-[9px] font-medium leading-4 text-slate-500">
              That&apos;s okay — projects can be
              built inside the roadmap.
            </span>
          </span>
        </ChoiceButton>

        <ChoiceButton
          selected={hasProjects}
          onClick={() => {
            if (!hasProjects) {
              setProjectDraft(
                createEmptyProject(),
              );
            }
          }}
          className="min-h-[88px] justify-start text-left"
        >
          <span className="block">
            <span className="block text-[11px] font-bold text-slate-900">
              Yes, I have projects
            </span>

            <span className="mt-1 block text-[9px] font-medium leading-4 text-slate-500">
              Add only the projects that matter
              most.
            </span>
          </span>
        </ChoiceButton>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-800 sm:text-xs">
              Add a project
            </p>

            <p className="mt-0.5 text-[9px] text-slate-500">
              Keep it lightweight. You can add more
              later.
            </p>
          </div>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200">
            <Hammer className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Project name
            </label>

            <input
              id="roadmap-project-name"
              name="roadmap-project-name"
              autoComplete="off"
              value={projectDraft.name}
              onChange={(event) =>
                setProjectDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="e.g. Sales Dashboard"
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Technologies
            </label>

            <input
              id="roadmap-project-technologies"
              name="roadmap-project-technologies"
              autoComplete="off"
              value={projectDraft.technologies.join(
                ", ",
              )}
              onChange={(event) =>
                setProjectDraft((current) => ({
                  ...current,
                  technologies: event.target.value
                    .split(",")
                    .map((value) =>
                      value.trim(),
                    )
                    .filter(Boolean),
                }))
              }
              placeholder="Python, SQL, Power BI"
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Project status
            </label>

            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["idea", "Idea"],
                  [
                    "in-progress",
                    "In progress",
                  ],
                  [
                    "completed",
                    "Completed",
                  ],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setProjectDraft(
                      (current) => ({
                        ...current,
                        status: value,
                      }),
                    )
                  }
                  className={[
                    "min-h-10 rounded-full border px-3.5 text-[9px] font-bold outline-none transition",

                    projectDraft.status ===
                    value
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Your contribution
            </label>

            <input
              id="roadmap-project-contribution"
              name="roadmap-project-contribution"
              autoComplete="off"
              value={
                projectDraft.contribution
              }
              onChange={(event) =>
                setProjectDraft((current) => ({
                  ...current,
                  contribution:
                    event.target.value,
                }))
              }
              placeholder="Optional: what did you personally build?"
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <button
            type="button"
            onClick={addProject}
            disabled={
              !projectDraft.name.trim()
            }
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-[10px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Add project
          </button>
        </div>
      </div>

      {hasProjects ? (
        <div className="mt-4 space-y-2">
          {profile.projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-[10px] font-bold text-slate-800 sm:text-[11px]">
                    {project.name}
                  </p>

                  <p className="mt-1 break-words text-[9px] leading-4 text-slate-400">
                    {project.technologies.length
                      ? project.technologies.join(
                          " • ",
                        )
                      : "No technologies added"}
                  </p>

                  <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[8px] font-bold capitalize text-slate-500">
                    {project.status.replace(
                      "-",
                      " ",
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeProject(project.id)
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/10"
                  aria-label={`Remove ${project.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {project.contribution ? (
                <p className="mt-2 text-[9px] leading-4 text-slate-500">
                  {project.contribution}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SingleChoiceStep({
  title,
  description,
  options,
  value,
  onChange,
}: {
  title: string;
  description: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <SectionLabel
        title={title}
        description={description}
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <ChoiceButton
            key={option}
            selected={value === option}
            onClick={() => onChange(option)}
            className="min-h-12"
          >
            {option}
          </ChoiceButton>
        ))}
      </div>
    </div>
  );
}

function LearningPreferencesStep({
  profile,
  toggle,
}: {
  profile: RoadmapProfile;
  toggle: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <SectionLabel
        eyebrow="10"
        title="How do you learn best?"
        description="Choose the learning formats you are most likely to use consistently."
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {LEARNING_STYLE_OPTIONS.map(
          (option) => {
            const Icon = option.icon;

            const selected =
              profile.learningPreferences.includes(
                option.value,
              );

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  toggle(option.value)
                }
                aria-pressed={selected}
                className={[
                  "group flex min-h-[104px] flex-col justify-between rounded-2xl border p-3.5 text-left outline-none transition-all duration-200",
                  "sm:min-h-[112px]",
                  selected
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-[0_2px_10px_rgba(79,70,229,0.07)]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  "focus-visible:ring-4 focus-visible:ring-indigo-500/10",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    selected
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
                  ].join(" ")}
                >
                  <Icon
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                </span>

                <span className="flex items-center justify-between gap-2">
                  <span className="min-w-0 break-words text-[10px] font-bold leading-4 sm:text-[11px]">
                    {option.label}
                  </span>

                  <span
                    className={[
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-indigo-500 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white text-transparent",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <Check
                      className="h-3 w-3"
                      strokeWidth={2.3}
                    />
                  </span>
                </span>
              </button>
            );
          },
        )}
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-3">
        <Sparkles
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600"
          strokeWidth={1.8}
        />

        <p className="text-[9px] leading-4 text-indigo-800 sm:text-[10px] sm:leading-4.5">
          Select more than one. Your choices help
          shape the style and pacing of the roadmap.
        </p>
      </div>
    </div>
  );
}

export function ProfileStepContent({
  step,
  profile,
  customSkill,
  customEducationField,
  projectDraft,
  updateProfile,
  toggleSkill,
  addCustomSkill,
  setCustomSkill,
  updateSkillLevel,
  toggleExperienceType,
  setCustomEducationField,
  addProject,
  setProjectDraft,
  removeProject,
  toggleLearningPreference,
}: ProfileStepContentProps) {
  const safeStep = Math.min(
    Math.max(step, 1),
    10,
  );

  switch (safeStep) {
    case 1:
      return (
        <RoleProfileStep
          profile={profile}
          onSelect={(role) =>
            updateProfile(
              "preferredRole",
              role,
            )
          }
          onChange={(value) =>
            updateProfile(
              "preferredRole",
              value,
            )
          }
        />
      );

    case 2:
      return (
        <LevelStep
          profile={profile}
          updateProfile={updateProfile}
        />
      );

    case 3:
      return (
        <GoalStep
          profile={profile}
          updateProfile={updateProfile}
        />
      );

    case 4:
      return (
        <EducationStep
          profile={profile}
          customEducationField={
            customEducationField
          }
          setCustomEducationField={
            setCustomEducationField
          }
          updateProfile={updateProfile}
        />
      );

    case 5:
      return (
        <ExperienceStep
          profile={profile}
          updateProfile={updateProfile}
          toggleExperienceType={
            toggleExperienceType
          }
        />
      );

    case 6:
      return (
        <SkillsStep
          profile={profile}
          customSkill={customSkill}
          setCustomSkill={setCustomSkill}
          toggleSkill={toggleSkill}
          addCustomSkill={addCustomSkill}
          updateSkillLevel={
            updateSkillLevel
          }
        />
      );

    case 7:
      return (
        <ProjectsStep
          profile={profile}
          projectDraft={projectDraft}
          setProjectDraft={setProjectDraft}
          addProject={addProject}
          removeProject={removeProject}
        />
      );

    case 8:
      return (
        <SingleChoiceStep
          title="How much time can you learn each week?"
          description="Choose a realistic commitment that you can maintain."
          options={LEARNING_TIME_OPTIONS}
          value={profile.learningTimePerWeek}
          onChange={(value) =>
            updateProfile(
              "learningTimePerWeek",
              value,
            )
          }
        />
      );

    case 9:
      return (
        <SingleChoiceStep
          title="When would you like to become ready?"
          description="Your timeline helps CareerMap pace the roadmap."
          options={TIMELINE_OPTIONS}
          value={profile.targetTimeline}
          onChange={(value) =>
            updateProfile(
              "targetTimeline",
              value,
            )
          }
        />
      );

    case 10:
      return (
        <LearningPreferencesStep
          profile={profile}
          toggle={toggleLearningPreference}
        />
      );

    default:
      return null;
  }
}

export default ProfileStepContent;