import type {
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";

import {
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Code2,
  Flag,
  GraduationCap,
  Hammer,
  Plus,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";

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

import ChoiceButton from "./ChoiceButton";

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

  iconOnly?: boolean;
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
  iconOnly = false,
}: ProfileStepContentProps) {
  if (iconOnly) {
    return getStepIcon(step);
  }

  switch (step) {
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
        <div className="space-y-2.5">
          {LEVEL_OPTIONS.map(
            (option) => {
              const Icon = option.icon;

              return (
                <ChoiceRow
                  key={option.value}
                  selected={
                    profile.currentLevel ===
                    option.value
                  }
                  onClick={() =>
                    updateProfile(
                      "currentLevel",
                      option.value,
                    )
                  }
                  icon={
                    <Icon className="h-4 w-4" />
                  }
                  title={option.title}
                  description={
                    option.description
                  }
                />
              );
            },
          )}
        </div>
      );

    case 3:
      return (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {GOAL_OPTIONS.map(
            (option) => (
              <ChoiceButton
                key={option.value}
                selected={
                  profile.careerGoal ===
                  option.value
                }
                onClick={() =>
                  updateProfile(
                    "careerGoal",
                    option.value,
                  )
                }
                className="min-h-[82px] text-left"
              >
                <span className="block">
                  {option.title}
                </span>

                <span className="mt-1 block text-[9px] font-medium leading-4 text-slate-500">
                  {option.description}
                </span>
              </ChoiceButton>
            ),
          )}
        </div>
      );

    case 4:
      return (
        <EducationStep
          profile={profile}
          customEducationField={
            customEducationField
          }
          updateProfile={
            updateProfile
          }
          setCustomEducationField={
            setCustomEducationField
          }
        />
      );

    case 5:
      return (
        <ExperienceStep
          profile={profile}
          updateProfile={
            updateProfile
          }
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
          addCustomSkill={
            addCustomSkill
          }
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
          setProjectDraft={
            setProjectDraft
          }
          addProject={addProject}
          removeProject={
            removeProject
          }
        />
      );

    case 8:
      return (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {LEARNING_TIME_OPTIONS.map(
            (value) => (
              <ChoiceButton
                key={value}
                selected={
                  profile.learningTimePerWeek ===
                  value
                }
                onClick={() =>
                  updateProfile(
                    "learningTimePerWeek",
                    value,
                  )
                }
                className="min-h-14"
              >
                {value}
              </ChoiceButton>
            ),
          )}
        </div>
      );

    case 9:
      return (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {TIMELINE_OPTIONS.map(
            (value) => (
              <ChoiceButton
                key={value}
                selected={
                  profile.targetTimeline ===
                  value
                }
                onClick={() =>
                  updateProfile(
                    "targetTimeline",
                    value,
                  )
                }
                className="min-h-14"
              >
                {value}
              </ChoiceButton>
            ),
          )}
        </div>
      );

    case 10:
      return (
        <LearningPreferencesStep
          profile={profile}
          toggle={
            toggleLearningPreference
          }
        />
      );

    default:
      return null;
  }
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ROLE_SUGGESTIONS.map(
          (role) => (
            <ChoiceButton
              key={role}
              selected={
                profile.preferredRole.toLowerCase() ===
                role.toLowerCase()
              }
              onClick={() =>
                onSelect(role)
              }
            >
              {role}
            </ChoiceButton>
          ),
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
        <label
          htmlFor="roadmap-profile-role"
          className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500"
        >
          <Search
            className="h-3.5 w-3.5"
            strokeWidth={1.9}
          />

          Your role
        </label>

        <input
          id="roadmap-profile-role"
          value={
            profile.preferredRole
          }
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder="e.g. AI Engineer"
          autoComplete="off"
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>
  );
}

function EducationStep({
  profile,
  customEducationField,
  updateProfile,
  setCustomEducationField,
}: {
  profile: RoadmapProfile;
  customEducationField: string;

  updateProfile: <
    K extends keyof RoadmapProfile,
  >(
    key: K,
    value: RoadmapProfile[K],
  ) => void;

  setCustomEducationField: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
        Education level
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EDUCATION_LEVELS.map(
          (level) => (
            <ChoiceButton
              key={level}
              selected={
                profile.education.level ===
                level
              }
              onClick={() =>
                updateProfile(
                  "education",
                  {
                    ...profile.education,
                    level,
                  },
                )
              }
            >
              {level}
            </ChoiceButton>
          ),
        )}
      </div>

      <p className="mb-2 mt-5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
        Field
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EDUCATION_FIELDS.map(
          (field) => (
            <ChoiceButton
              key={field}
              selected={
                profile.education.field ===
                field
              }
              onClick={() =>
                updateProfile(
                  "education",
                  {
                    ...profile.education,
                    field,
                  },
                )
              }
            >
              {field}
            </ChoiceButton>
          ),
        )}
      </div>

      {profile.education.field ===
        "Other" && (
        <input
          value={
            customEducationField
          }
          onChange={(event) => {
            const value =
              event.target.value;

            setCustomEducationField(
              value,
            );

            updateProfile(
              "education",
              {
                ...profile.education,
                field: value,
              },
            );
          }}
          placeholder="Type your field"
          className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />
      )}
    </div>
  );
}

function ExperienceStep({
  profile,
  updateProfile,
  toggleExperienceType,
}: {
  profile: RoadmapProfile;

  updateProfile: <
    K extends keyof RoadmapProfile,
  >(
    key: K,
    value: RoadmapProfile[K],
  ) => void;

  toggleExperienceType: (
    type: string,
  ) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EXPERIENCE_OPTIONS.map(
          (level) => (
            <ChoiceButton
              key={level}
              selected={
                profile.experience.level ===
                level
              }
              onClick={() =>
                updateProfile(
                  "experience",
                  {
                    ...profile.experience,
                    level,
                  },
                )
              }
            >
              {level}
            </ChoiceButton>
          ),
        )}
      </div>

      <p className="mb-2 mt-5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
        Experience type
        <span className="ml-1 normal-case font-medium tracking-normal text-slate-400">
          optional
        </span>
      </p>

      <div className="flex flex-wrap gap-2">
        {EXPERIENCE_TYPES.map(
          (type) => {
            const selected =
              profile.experience.types.includes(
                type,
              );

            return (
              <button
                type="button"
                key={type}
                onClick={() =>
                  toggleExperienceType(
                    type,
                  )
                }
                aria-pressed={selected}
                className={[
                  "rounded-full border px-3 py-2 text-[9px] font-semibold transition",
                  selected
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                ].join(" ")}
              >
                {selected && (
                  <Check className="mr-1 inline h-3 w-3" />
                )}

                {type}
              </button>
            );
          },
        )}
      </div>

      <textarea
        value={
          profile.experience.details
        }
        onChange={(event) =>
          updateProfile(
            "experience",
            {
              ...profile.experience,
              details:
                event.target.value,
            },
          )
        }
        rows={2}
        placeholder="Optional: one line about your most relevant experience"
        className="mt-4 w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
      />
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

  setCustomSkill: (
    value: string,
  ) => void;

  toggleSkill: (
    name: string,
  ) => void;

  addCustomSkill: () => void;

  updateSkillLevel: (
    skillName: string,
    level: RoadmapSkill["level"],
  ) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SKILL_SUGGESTIONS.map(
          (skill) => {
            const selected =
              profile.skills.some(
                (item) =>
                  item.name.toLowerCase() ===
                  skill.toLowerCase(),
              );

            return (
              <button
                type="button"
                key={skill}
                onClick={() =>
                  toggleSkill(skill)
                }
                aria-pressed={selected}
                className={[
                  "rounded-full border px-3 py-2 text-[9px] font-semibold transition",
                  selected
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                ].join(" ")}
              >
                {selected && (
                  <Check className="mr-1 inline h-3 w-3" />
                )}

                {skill}
              </button>
            );
          },
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={customSkill}
          onChange={(event) =>
            setCustomSkill(
              event.target.value,
            )
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomSkill();
            }
          }}
          placeholder="Add another skill"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />

        <button
          type="button"
          onClick={addCustomSkill}
          disabled={!customSkill.trim()}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[10px] font-bold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {profile.skills.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
            Your confidence
          </p>

          {profile.skills.map(
            (skill) => (
              <div
                key={skill.name}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-[10px] font-semibold text-slate-800">
                    {skill.name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      toggleSkill(
                        skill.name,
                      )
                    }
                    className="text-slate-400 transition hover:text-slate-700"
                    aria-label={`Remove ${skill.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2 flex gap-1.5">
                  {(
                    [
                      "beginner",
                      "intermediate",
                      "strong",
                    ] as const
                  ).map(
                    (level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          updateSkillLevel(
                            skill.name,
                            level,
                          )
                        }
                        aria-pressed={
                          skill.level ===
                          level
                        }
                        className={[
                          "rounded-lg px-2.5 py-1.5 text-[8px] font-bold capitalize transition",
                          skill.level ===
                          level
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-500 ring-1 ring-slate-200",
                        ].join(" ")}
                      >
                        {level}
                      </button>
                    ),
                  )}
                </div>
              </div>
            ),
          )}
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
      <div className="grid gap-2.5 sm:grid-cols-2">
        <ChoiceButton
          selected={!hasProjects}
          onClick={() => {
            if (hasProjects) {
              return;
            }
          }}
          className="min-h-[82px] text-left"
        >
          <span className="block">
            Not yet
          </span>

          <span className="mt-1 block text-[9px] font-medium text-slate-500">
            That’s okay — projects can be
            built inside the roadmap.
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
          className="min-h-[82px] text-left"
        >
          <span className="block">
            Yes, I have projects
          </span>

          <span className="mt-1 block text-[9px] font-medium text-slate-500">
            Add only the projects that matter
            most.
          </span>
        </ChoiceButton>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-800">
              Add a project
            </p>

            <p className="mt-0.5 text-[9px] text-slate-500">
              Keep it lightweight.
            </p>
          </div>

          <Plus className="h-4 w-4 text-slate-400" />
        </div>

        <input
          value={projectDraft.name}
          onChange={(event) =>
            setProjectDraft(
              (current) => ({
                ...current,
                name: event.target.value,
              }),
            )
          }
          placeholder="Project name"
          className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />

        <input
          value={projectDraft.technologies.join(
            ", ",
          )}
          onChange={(event) =>
            setProjectDraft(
              (current) => ({
                ...current,
                technologies:
                  event.target.value
                    .split(",")
                    .map(
                      (item) =>
                        item.trim(),
                    )
                    .filter(Boolean),
              }),
            )
          }
          placeholder="Technologies (e.g. Python, SQL, Power BI)"
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />

        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              [
                "completed",
                "Completed",
              ],
              [
                "in-progress",
                "In progress",
              ],
              [
                "idea",
                "Idea",
              ],
            ] as const
          ).map(
            ([value, label]) => (
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
                aria-pressed={
                  projectDraft.status ===
                  value
                }
                className={[
                  "rounded-full border px-3 py-1.5 text-[8px] font-bold transition",
                  projectDraft.status ===
                  value
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-500",
                ].join(" ")}
              >
                {label}
              </button>
            ),
          )}
        </div>

        <input
          value={
            projectDraft.contribution
          }
          onChange={(event) =>
            setProjectDraft(
              (current) => ({
                ...current,
                contribution:
                  event.target.value,
              }),
            )
          }
          placeholder="Optional: what did you personally build?"
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />

        <button
          type="button"
          onClick={addProject}
          disabled={
            !projectDraft.name.trim()
          }
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-[10px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Add project
        </button>
      </div>

      {hasProjects && (
        <div className="mt-4 space-y-2">
          {profile.projects.map(
            (project) => (
              <div
                key={project.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-slate-800">
                    {project.name}
                  </p>

                  <p className="mt-1 text-[8px] text-slate-400">
                    {project.technologies
                      .length
                      ? project.technologies.join(
                          " • ",
                        )
                      : "No technologies added"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeProject(
                      project.id,
                    )
                  }
                  className="shrink-0 text-slate-400 transition hover:text-rose-500"
                  aria-label={`Remove ${project.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function LearningPreferencesStep({
  profile,
  toggle,
}: {
  profile: RoadmapProfile;
  toggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                  toggle(
                    option.value,
                  )
                }
                aria-pressed={selected}
                className={[
                  "flex min-h-20 flex-col items-start justify-between rounded-2xl border p-3 text-left outline-none transition",
                  selected
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                ].join(" ")}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50">
                  <Icon className="h-4 w-4" />
                </span>

                <span className="text-[9px] font-bold">
                  {option.label}
                </span>
              </button>
            );
          },
        )}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-3">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" />

        <p className="text-[9px] leading-4 text-indigo-800">
          Pick the formats you are most likely
          to use consistently. You can select
          more than one.
        </p>
      </div>
    </div>
  );
}

function ChoiceRow({
  selected,
  onClick,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3.5 text-left outline-none transition",
        selected
          ? "border-indigo-200 bg-indigo-50/80"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
        "focus-visible:ring-4 focus-visible:ring-indigo-500/10",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          selected
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={[
            "block text-[10px] font-bold",
            selected
              ? "text-indigo-900"
              : "text-slate-800",
          ].join(" ")}
        >
          {title}
        </span>

        <span className="mt-0.5 block text-[9px] leading-4 text-slate-500">
          {description}
        </span>
      </span>

      <CheckCircle2
        className={[
          "h-4 w-4 shrink-0",
          selected
            ? "text-indigo-600"
            : "text-slate-200",
        ].join(" ")}
        strokeWidth={1.9}
      />
    </button>
  );
}

function getStepIcon(
  step: number,
) {
  switch (step) {
    case 1:
      return (
        <Target className="h-4 w-4" />
      );

    case 2:
      return (
        <Sparkles className="h-4 w-4" />
      );

    case 3:
      return (
        <Flag className="h-4 w-4" />
      );

    case 4:
      return (
        <GraduationCap className="h-4 w-4" />
      );

    case 5:
      return (
        <BriefcaseBusiness className="h-4 w-4" />
      );

    case 6:
      return (
        <Code2 className="h-4 w-4" />
      );

    case 7:
      return (
        <Hammer className="h-4 w-4" />
      );

    case 8:
      return (
        <ClockIcon className="h-4 w-4" />
      );

    case 9:
      return (
        <Target className="h-4 w-4" />
      );

    case 10:
      return (
        <Sparkles className="h-4 w-4" />
      );

    default:
      return (
        <Sparkles className="h-4 w-4" />
      );
  }
}

function ClockIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function createEmptyProject(): RoadmapProject {
  return {
    id: `project-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    name: "",
    technologies: [],
    contribution: "",
    status: "idea",
  };
}