import { useMemo, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useCareerMapSession } from "@/context/CareerMapSessionContext";

import EntryScreen from "@/features/roadmap/components/setup/EntryScreens";
import ResumeUploadScreen from "@/features/roadmap/components/setup/ResumeUploadScreen";
import ResumeRoleScreen from "@/features/roadmap/components/setup/ResumeRoleScreen";
import ManualProfileScreen from "@/features/roadmap/components/setup/ManualProfileScreen";
import ManualReviewScreen from "@/features/roadmap/components/setup/ManualReviewScreen";
import RoadmapResultsScreen from "@/features/roadmap/components/results/RoadmapResultsScreen";

import {
  EMPTY_PROFILE,
  ROLE_SUGGESTIONS,
  TOTAL_PROFILE_STEPS,
} from "@/features/roadmap/utils/roadmapConstants";

import { isProfileStepValid } from "@/features/roadmap/utils/roadmapValidation";

import { mapGeneratedRoadmap } from "@/features/roadmap/utils/roadmapMappers";

import { extractResumeProfile } from "@/features/roadmap/services/resumeExtractionService";

import {
  generateRoadmap as requestRoadmap,
} from "@/features/roadmap/services/roadmapService";

import type {
  GeneratedRoadmap,
  RoadmapProfile,
  RoadmapProject,
  RoadmapSkill,
} from "@/features/roadmap/types/roadmap";

import type { SetupMode } from "@/features/roadmap/types/roadmapForm";

import type { GenerateRoadmapRequest } from "@/features/roadmap/types/roadmapApi";


function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}


function newProject(): RoadmapProject {
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


function RoadmapPage() {
  const {
    analysis,
    roadmapInput,
    setRoadmapInput,
  } = useCareerMapSession();

  const location = useLocation();

  const [setupMode, setSetupMode] =
    useState<SetupMode>("entry");

  const [profileStep, setProfileStep] =
    useState(1);

  const [profile, setProfile] =
    useState<RoadmapProfile>(EMPTY_PROFILE);

  const [generationState, setGenerationState] =
    useState<
      "idle" | "loading" | "success"
    >("idle");

  const [generationError, setGenerationError] =
    useState<string | null>(null);

  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const [resumeExtracting, setResumeExtracting] =
    useState(false);

  const [resumeError, setResumeError] =
    useState<string | null>(null);

  const [extractedResume, setExtractedResume] =
    useState<Record<string, unknown> | null>(
      null,
    );

  const [customSkill, setCustomSkill] =
    useState("");

  const [
    customEducationField,
    setCustomEducationField,
  ] = useState("");

  const [customRole, setCustomRole] =
    useState("");

  const [projectDraft, setProjectDraft] =
    useState<RoadmapProject>(newProject());

  const generatedRoadmap =
    useMemo<GeneratedRoadmap | null>(() => {
      if (!isRecord(roadmapInput)) {
        return null;
      }

      return mapGeneratedRoadmap(
        roadmapInput.generatedRoadmap,
      );
    }, [roadmapInput]);

  const cameFromAnalyzer =
    location.state &&
    typeof location.state === "object" &&
    "from" in location.state &&
    location.state.from === "analyzer";

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);


  const updateProfile = <
    K extends keyof RoadmapProfile
  >(
    key: K,
    value: RoadmapProfile[K],
  ) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };


  const resetProfileFlow = () => {
    setProfile(EMPTY_PROFILE);

    setResumeFile(null);

    setResumeExtracting(false);

    setResumeError(null);

    setExtractedResume(null);

    setCustomSkill("");

    setCustomEducationField("");

    setCustomRole("");

    setProjectDraft(newProject());

    setProfileStep(1);

    setGenerationState("idle");

    setGenerationError(null);
  };


  const startManualProfile = () => {
    resetProfileFlow();

    setSetupMode("manual-profile");
  };


  const startCvUpload = () => {
    resetProfileFlow();

    setSetupMode("cv-upload");
  };


  const openFilePicker = () => {
    fileInputRef.current?.click();
  };


  const handleResumeFile = async (
    file: File | null,
  ) => {
    if (!file) {
      return;
    }

    setResumeError(null);

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    const fileName =
      file.name.toLowerCase();

    const validExtension =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc");

    if (
      !allowedTypes.includes(file.type) &&
      !validExtension
    ) {
      setResumeError(
        "Please upload a PDF, DOCX, or DOC resume.",
      );

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResumeError(
        "Your resume should be 10 MB or smaller.",
      );

      return;
    }

    setResumeFile(file);

    setResumeExtracting(true);

    try {
      const extracted =
        await extractResumeProfile(file);

      setExtractedResume(extracted);

      setSetupMode("cv-role");
    } catch (error) {
      setResumeError(
        error instanceof Error
          ? error.message
          : "Resume extraction failed. Please try again.",
      );

      return;
    } finally {
      setResumeExtracting(false);
    }
  };


  const toggleSkill = (
    name: string,
  ) => {
    setProfile((current) => {
      const exists =
        current.skills.some(
          (skill) =>
            skill.name.toLowerCase() ===
            name.toLowerCase(),
        );

      return {
        ...current,

        skills: exists
          ? current.skills.filter(
              (skill) =>
                skill.name.toLowerCase() !==
                name.toLowerCase(),
            )
          : [
              ...current.skills,
              {
                name,
                level: "intermediate",
              },
            ],
      };
    });
  };


  const addCustomSkill = () => {
    const value =
      customSkill.trim();

    if (!value) {
      return;
    }

    if (
      !profile.skills.some(
        (skill) =>
          skill.name.toLowerCase() ===
          value.toLowerCase(),
      )
    ) {
      setProfile((current) => ({
        ...current,

        skills: [
          ...current.skills,
          {
            name: value,
            level: "intermediate",
          },
        ],
      }));
    }

    setCustomSkill("");
  };


  const updateSkillLevel = (
    skillName: string,
    level: RoadmapSkill["level"],
  ) => {
    setProfile((current) => ({
      ...current,

      skills: current.skills.map(
        (skill) =>
          skill.name === skillName
            ? {
                ...skill,
                level,
              }
            : skill,
      ),
    }));
  };


  const toggleExperienceType = (
    type: string,
  ) => {
    setProfile((current) => ({
      ...current,

      experience: {
        ...current.experience,

        types:
          current.experience.types.includes(
            type,
          )
            ? current.experience.types.filter(
                (value) =>
                  value !== type,
              )
            : [
                ...current.experience.types,
                type,
              ],
      },
    }));
  };


  const addProject = () => {
    const name =
      projectDraft.name.trim();

    if (!name) {
      return;
    }

    setProfile((current) => ({
      ...current,

      projects: [
        ...current.projects,
        {
          ...projectDraft,
          name,
        },
      ],
    }));

    setProjectDraft(newProject());
  };


  const removeProject = (
    id: string,
  ) => {
    setProfile((current) => ({
      ...current,

      projects:
        current.projects.filter(
          (project) =>
            project.id !== id,
        ),
    }));
  };


  const toggleLearningPreference = (
    value: string,
  ) => {
    setProfile((current) => ({
      ...current,

      learningPreferences:
        current.learningPreferences.includes(
          value,
        )
          ? current.learningPreferences.filter(
              (item) =>
                item !== value,
            )
          : [
              ...current.learningPreferences,
              value,
            ],
    }));
  };


  const manualStepValid =
    useMemo(
      () =>
        isProfileStepValid(
          profile,
          profileStep,
        ),
      [profile, profileStep],
    );


  const nextProfileStep = () => {
    if (!manualStepValid) {
      return;
    }

    if (
      profileStep ===
      TOTAL_PROFILE_STEPS
    ) {
      setSetupMode(
        "manual-review",
      );

      return;
    }

    setProfileStep((current) =>
      Math.min(
        TOTAL_PROFILE_STEPS,
        current + 1,
      ),
    );
  };


  const previousProfileStep = () => {
    if (profileStep > 1) {
      setProfileStep((current) =>
        current - 1,
      );

      return;
    }

    setSetupMode("entry");
  };


  const generateRoadmap = async (
    payload: Omit<
      GenerateRoadmapRequest,
      "analyzerContext"
    >,
  ) => {
    const targetJobRole =
      payload.targetJobRole.trim();

    if (!targetJobRole) {
      return;
    }

    setGenerationState("loading");

    setGenerationError(null);

    try {
      const result =
        await requestRoadmap({
          ...payload,

          targetJobRole,

          analyzerContext: analysis
            ? {
                role: analysis.role,
                matchScore:
                  analysis.matchScore,
                skillsMatchScore:
                  analysis.skillsMatchScore,
                keywordMatchScore:
                  analysis.keywordMatchScore,
                experienceMatchScore:
                  analysis.experienceMatchScore,
                educationMatchScore:
                  analysis.educationMatchScore,
                semanticSimilarityScore:
                  analysis.semanticSimilarityScore,
                atsScore:
                  analysis.atsScore,
                skills:
                  analysis.skills,
                missingSkills:
                  analysis.missingSkills,
                strengths:
                  analysis.strengths,
                improvements:
                  analysis.improvements,
              }
            : null,
        });

      setRoadmapInput({
        ...payload,

        targetJobRole,

        generatedRoadmap:
          result.roadmap,

        generatedAt:
          new Date().toISOString(),
      });

      setGenerationState(
        "success",
      );
    } catch (error) {
      setGenerationState("idle");

      setGenerationError(
        error instanceof Error
          ? error.message
          : "Personalized roadmap generation failed. Please try again.",
      );
    }
  };


  const generateFromManualReview =
    async () => {
      await generateRoadmap({
        source: "manual",

        targetJobRole:
          profile.preferredRole,

        profile,
      });
    };


  const generateFromResume =
    async () => {
      const targetJobRole =
        profile.preferredRole.trim();

      if (
        !targetJobRole ||
        !resumeFile ||
        !extractedResume
      ) {
        return;
      }

      await generateRoadmap({
        source: "cv",

        targetJobRole,

        extractedResume,

        resumeMetadata: {
          name: resumeFile.name,
          type: resumeFile.type,
          size: resumeFile.size,
        },
      });
    };


  const selectRoleSuggestion = (
    role: string,
  ) => {
    setProfile((current) => ({
      ...current,

      preferredRole: role,
    }));
  };


  /*
   * -------------------------------------------------------
   * RESULTS
   * -------------------------------------------------------
   */

  if (generatedRoadmap) {
    return (
      <RoadmapResultsScreen
        roadmap={generatedRoadmap}

        source={
          isRecord(roadmapInput) &&
          typeof roadmapInput.source ===
            "string"
            ? roadmapInput.source
            : null
        }

        generatedAt={
          isRecord(roadmapInput) &&
          typeof roadmapInput.generatedAt ===
            "string"
            ? roadmapInput.generatedAt
            : null
        }

        cameFromAnalyzer={
          cameFromAnalyzer
        }

        onStartOver={() => {
          setRoadmapInput(null);

          resetProfileFlow();

          setSetupMode("entry");
        }}
      />
    );
  }


  /*
   * -------------------------------------------------------
   * ENTRY
   * -------------------------------------------------------
   */

  if (
    setupMode === "entry"
  ) {
    return (
      <EntryScreen
        onResume={startCvUpload}
        onManual={
          startManualProfile
        }
      />
    );
  }


  /*
   * -------------------------------------------------------
   * RESUME UPLOAD
   * -------------------------------------------------------
   */

  if (
    setupMode === "cv-upload"
  ) {
    return (
      <ResumeUploadScreen
        fileInputRef={
          fileInputRef
        }

        resumeFile={
          resumeFile
        }

        isExtracting={
          resumeExtracting
        }

        errorMessage={
          resumeError
        }

        onBack={() =>
          setSetupMode("entry")
        }

        onOpenPicker={
          openFilePicker
        }

        onFileSelected={
          handleResumeFile
        }
      />
    );
  }


  /*
   * -------------------------------------------------------
   * RESUME ROLE
   * -------------------------------------------------------
   */

  if (
    setupMode === "cv-role"
  ) {
    return (
      <ResumeRoleScreen
        resumeFile={
          resumeFile
        }

        extractionReady={
          Boolean(
            extractedResume,
          )
        }

        role={
          profile.preferredRole
        }

        customRole={
          customRole
        }

        suggestions={
          ROLE_SUGGESTIONS
        }

        onRoleChange={(value) => {
          setProfile(
            (current) => ({
              ...current,

              preferredRole:
                value,
            }),
          );
        }}

        onSuggestion={(
          suggestion,
        ) => {
          setCustomRole("");

          selectRoleSuggestion(
            suggestion,
          );
        }}

        onCustomRoleChange={
          setCustomRole
        }

        onBack={() =>
          setSetupMode(
            "cv-upload",
          )
        }

        onGenerate={
          generateFromResume
        }

        isGenerating={
          generationState ===
          "loading"
        }

        generationError={
          generationError
        }

        generationSuccess={
          generationState ===
          "success"
        }
      />
    );
  }


  /*
   * -------------------------------------------------------
   * MANUAL PROFILE
   * -------------------------------------------------------
   */

  if (
    setupMode ===
    "manual-profile"
  ) {
    return (
      <ManualProfileScreen
        profile={profile}

        step={profileStep}

        totalSteps={
          TOTAL_PROFILE_STEPS
        }

        valid={
          manualStepValid
        }

        customSkill={
          customSkill
        }

        customEducationField={
          customEducationField
        }

        projectDraft={
          projectDraft
        }

        onBack={
          previousProfileStep
        }

        onNext={
          nextProfileStep
        }

        updateProfile={
          updateProfile
        }

        toggleSkill={
          toggleSkill
        }

        addCustomSkill={
          addCustomSkill
        }

        setCustomSkill={
          setCustomSkill
        }

        updateSkillLevel={
          updateSkillLevel
        }

        toggleExperienceType={
          toggleExperienceType
        }

        setCustomEducationField={
          setCustomEducationField
        }

        addProject={
          addProject
        }

        setProjectDraft={
          setProjectDraft
        }

        removeProject={
          removeProject
        }

        toggleLearningPreference={
          toggleLearningPreference
        }
      />
    );
  }


  /*
   * -------------------------------------------------------
   * MANUAL REVIEW
   * -------------------------------------------------------
   */

  if (
    setupMode ===
    "manual-review"
  ) {
    return (
      <ManualReviewScreen
        profile={profile}

        onBack={() => {
          setProfileStep(
            TOTAL_PROFILE_STEPS,
          );

          setSetupMode(
            "manual-profile",
          );
        }}

        onModify={() => {
          setProfileStep(1);

          setSetupMode(
            "manual-profile",
          );
        }}

        onGenerate={
          generateFromManualReview
        }

        isGenerating={
          generationState ===
          "loading"
        }

        generationError={
          generationError
        }

        generationSuccess={
          generationState ===
          "success"
        }
      />
    );
  }


  /*
   * -------------------------------------------------------
   * FALLBACK
   * -------------------------------------------------------
   */

  return (
    <Navigate
      to="/roadmap"
      replace
    />
  );
}


export default RoadmapPage;