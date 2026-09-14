import { Navigate } from "react-router-dom";

import EntryScreen from "@/features/roadmap/components/setup/EntryScreens";
import ResumeUploadScreen from "@/features/roadmap/components/setup/ResumeUploadScreen";
import ResumeRoleScreen from "@/features/roadmap/components/setup/ResumeRoleScreen";
import ManualProfileScreen from "@/features/roadmap/components/setup/ManualProfileScreen";
import ManualReviewScreen from "@/features/roadmap/components/setup/ManualReviewScreen";
import RoadmapResultsScreen from "@/features/roadmap/components/results/RoadmapResultsScreen";
import type { useRoadmapSetup } from "@/features/roadmap/hooks/useRoadmapSetup";

type RoadmapFlowProps = ReturnType<typeof useRoadmapSetup>;

function RoadmapFlow(props: RoadmapFlowProps) {
  const {
    setupMode,
    profileStep,
    profile,
    generationState,
    generationError,
    resumeFile,
    resumeExtracting,
    resumeError,
    extractedResume,
    customSkill,
    setCustomSkill,
    customEducationField,
    setCustomEducationField,
    customRole,
    setCustomRole,
    projectDraft,
    setProjectDraft,
    generatedRoadmap,
    cameFromAnalyzer,
    roadmapSource,
    roadmapGeneratedAt,
    fileInputRef,
    roleSuggestions,
    totalProfileSteps,
    manualStepValid,
    updateProfile,
    startManualProfile,
    startCvUpload,
    openFilePicker,
    handleResumeFile,
    toggleSkill,
    addCustomSkill,
    updateSkillLevel,
    toggleExperienceType,
    addProject,
    removeProject,
    toggleLearningPreference,
    nextProfileStep,
    previousProfileStep,
    backFromManualReview,
    modifyManualReview,
    generateFromManualReview,
    generateFromResume,
    selectRoleSuggestion,
    goToEntry,
    goToCvUpload,
    startOver,
  } = props;

  if (generatedRoadmap) {
    return (
      <RoadmapResultsScreen
        roadmap={generatedRoadmap}
        source={roadmapSource}
        generatedAt={roadmapGeneratedAt}
        cameFromAnalyzer={cameFromAnalyzer}
        onStartOver={startOver}
      />
    );
  }

  if (setupMode === "entry") {
    return (
      <EntryScreen
        onResume={startCvUpload}
        onManual={startManualProfile}
      />
    );
  }

  if (setupMode === "cv-upload") {
    return (
      <ResumeUploadScreen
        fileInputRef={fileInputRef}
        resumeFile={resumeFile}
        isExtracting={resumeExtracting}
        errorMessage={resumeError}
        onBack={goToEntry}
        onOpenPicker={openFilePicker}
        onFileSelected={handleResumeFile}
      />
    );
  }

  if (setupMode === "cv-role") {
    return (
      <ResumeRoleScreen
        resumeFile={resumeFile}
        extractionReady={Boolean(extractedResume)}
        role={profile.preferredRole}
        customRole={customRole}
        suggestions={roleSuggestions}
        onRoleChange={(value) => updateProfile("preferredRole", value)}
        onSuggestion={(suggestion) => {
          setCustomRole("");
          selectRoleSuggestion(suggestion);
        }}
        onCustomRoleChange={setCustomRole}
        onBack={goToCvUpload}
        onGenerate={generateFromResume}
        isGenerating={generationState === "loading"}
        generationError={generationError}
        generationSuccess={generationState === "success"}
      />
    );
  }

  if (setupMode === "manual-profile") {
    return (
      <ManualProfileScreen
        profile={profile}
        step={profileStep}
        totalSteps={totalProfileSteps}
        valid={manualStepValid}
        customSkill={customSkill}
        customEducationField={customEducationField}
        projectDraft={projectDraft}
        onBack={previousProfileStep}
        onNext={nextProfileStep}
        updateProfile={updateProfile}
        toggleSkill={toggleSkill}
        addCustomSkill={addCustomSkill}
        setCustomSkill={setCustomSkill}
        updateSkillLevel={updateSkillLevel}
        toggleExperienceType={toggleExperienceType}
        setCustomEducationField={setCustomEducationField}
        addProject={addProject}
        setProjectDraft={setProjectDraft}
        removeProject={removeProject}
        toggleLearningPreference={toggleLearningPreference}
      />
    );
  }

  if (setupMode === "manual-review") {
    return (
      <ManualReviewScreen
        profile={profile}
        onBack={backFromManualReview}
        onModify={modifyManualReview}
        onGenerate={generateFromManualReview}
        isGenerating={generationState === "loading"}
        generationError={generationError}
        generationSuccess={generationState === "success"}
      />
    );
  }

  return <Navigate to="/roadmap" replace />;
}

export default RoadmapFlow;
