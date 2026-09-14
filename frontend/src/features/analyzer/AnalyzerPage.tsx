import { useEffect, useState } from "react";

import AnalyzeButton, {
  type AnalyzeButtonStatus,
} from "@/features/analyzer/components/AnalyzeButton";
import AnalysisProcessing, {
  type ProcessingStep,
} from "@/features/analyzer/components/AnalysisProcessing";
import AnalyzerHeader from "@/features/analyzer/components/AnalyzerHeader";
import AnalyzerWorkspace from "@/features/analyzer/components/AnalyzerWorkspace";
import PrivacyNotice from "@/features/analyzer/components/PrivacyNotice";
import AnalysisResults from "@/features/analyzer/components/results/AnalysisResults";

import { useCareerMapSession } from "@/context/CareerMapSessionContext";
import { analyzeResume } from "@/features/analyzer/services/analysisService";

type AnalyzerState =
  | "input"
  | "processing"
  | "results";

const createInitialProcessingSteps =
  (): ProcessingStep[] => [
    {
      id: "resume",
      label: "Reading your resume",
      status: "active",
    },
    {
      id: "job",
      label: "Understanding job requirements",
      status: "pending",
    },
    {
      id: "skills",
      label: "Comparing skills and keywords",
      status: "pending",
    },
    {
      id: "ats",
      label: "Checking ATS readiness",
      status: "pending",
    },
    {
      id: "recommendations",
      label: "Preparing recommendations",
      status: "pending",
    },
  ];

function getButtonStatus(
  analyzerState: AnalyzerState,
  errorMessage: string | null,
): AnalyzeButtonStatus {
  if (analyzerState === "processing") {
    return "loading";
  }

  if (analyzerState === "results") {
    return "success";
  }

  if (errorMessage) {
    return "error";
  }

  return "idle";
}

export default function AnalyzerPage() {
  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const [jobDescription, setJobDescription] =
    useState("");

  const {
    analysis,
    setAnalysis: setSessionAnalysis,
    setAnalyzedRole,
    setResumeMetadata,
    clearAnalysis,
  } = useCareerMapSession();

  const [analyzerState, setAnalyzerState] =
    useState<AnalyzerState>(
      analysis ? "results" : "input",
    );

  const [processingSteps, setProcessingSteps] =
    useState<ProcessingStep[]>(
      createInitialProcessingSteps(),
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const canAnalyze =
    resumeFile !== null &&
    jobDescription.trim().length > 0;

  useEffect(() => {
    if (analyzerState !== "processing") {
      return;
    }

    const timers = [
      window.setTimeout(() => {
        setProcessingSteps((currentSteps) =>
          currentSteps.map((step, index) => {
            if (index === 0) {
              return {
                ...step,
                status: "completed",
              };
            }

            if (index === 1) {
              return {
                ...step,
                status: "active",
              };
            }

            return step;
          }),
        );
      }, 800),

      window.setTimeout(() => {
        setProcessingSteps((currentSteps) =>
          currentSteps.map((step, index) => {
            if (index === 1) {
              return {
                ...step,
                status: "completed",
              };
            }

            if (index === 2) {
              return {
                ...step,
                status: "active",
              };
            }

            return step;
          }),
        );
      }, 1600),

      window.setTimeout(() => {
        setProcessingSteps((currentSteps) =>
          currentSteps.map((step, index) => {
            if (index === 2) {
              return {
                ...step,
                status: "completed",
              };
            }

            if (index === 3) {
              return {
                ...step,
                status: "active",
              };
            }

            return step;
          }),
        );
      }, 2400),

      window.setTimeout(() => {
        setProcessingSteps((currentSteps) =>
          currentSteps.map((step, index) => {
            if (index === 3) {
              return {
                ...step,
                status: "completed",
              };
            }

            if (index === 4) {
              return {
                ...step,
                status: "active",
              };
            }

            return step;
          }),
        );
      }, 3200),

      window.setTimeout(() => {
        setProcessingSteps((currentSteps) =>
          currentSteps.map((step) => ({
            ...step,
            status: "completed",
          })),
        );
      }, 4000),
    ];

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, [analyzerState]);

  const handleResumeChange = (
    file: File | null,
  ) => {
    setResumeFile(file);

    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleJobDescriptionChange = (
    value: string,
  ) => {
    setJobDescription(value);

    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setErrorMessage(
        "Please upload your resume before starting the analysis.",
      );
      return;
    }

    const trimmedJobDescription =
      jobDescription.trim();

    if (!trimmedJobDescription) {
      setErrorMessage(
        "Please add the target job description before starting the analysis.",
      );
      return;
    }

    setErrorMessage(null);
    setSessionAnalysis(null);
    clearAnalysis();

    setProcessingSteps(
      createInitialProcessingSteps(),
    );

    setAnalyzerState("processing");

    try {
      const result = await analyzeResume({
        resumeFile,
        jobDescription: trimmedJobDescription,
      });

      setSessionAnalysis(result);

      setAnalyzedRole(
        result.role?.trim() || null,
      );

      setResumeMetadata({
        name: resumeFile.name,
        type: resumeFile.type,
        size: resumeFile.size,
      });

      setProcessingSteps((currentSteps) =>
        currentSteps.map((step) => ({
          ...step,
          status: "completed",
        })),
      );

      setAnalyzerState("results");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing your resume.";

      setErrorMessage(message);
      clearAnalysis();
      setAnalyzerState("input");

      setProcessingSteps(
        createInitialProcessingSteps(),
      );
    }
  };

  const handleStartAgain = () => {
    setResumeFile(null);
    setJobDescription("");
    clearAnalysis();
    setErrorMessage(null);

    setAnalyzerState("input");

    setProcessingSteps(
      createInitialProcessingSteps(),
    );
  };

  const buttonStatus = getButtonStatus(
    analyzerState,
    errorMessage,
  );

  /*
   * Processing state
   */
  if (analyzerState === "processing") {
    return (
      <main
        className="
          min-w-0 overflow-x-clip
          bg-white
        "
        aria-label="Resume analysis in progress"
      >
        <AnalysisProcessing
          steps={processingSteps}
        />
      </main>
    );
  }

  /*
   * Results state
   */
  if (
    analyzerState === "results" &&
    analysis
  ) {
    return (
      <main
        className="
          min-w-0 overflow-x-clip
          bg-white
        "
        aria-label="Resume analysis results"
      >
        <AnalysisResults
          analysis={analysis}
          resumeFile={resumeFile}
          onStartAgain={handleStartAgain}
        />
      </main>
    );
  }

  /*
   * Input state
   */
  return (
    <main
      className="
        relative min-w-0 overflow-x-clip
        bg-white
      "
    >
      {/* Background accents */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute -left-28 top-6
            h-48 w-48 rounded-full
            bg-blue-100/20 blur-3xl
            sm:-left-20 sm:top-10
            sm:h-60 sm:w-60
            lg:h-64 lg:w-64
          "
        />

        <div
          className="
            absolute -right-28 top-20
            h-52 w-52 rounded-full
            bg-violet-100/20 blur-3xl
            sm:-right-20 sm:top-28
            sm:h-64 sm:w-64
            lg:h-72 lg:w-72
          "
        />
      </div>

      <section
        className="
          relative
          py-9
          sm:py-12
          lg:py-16
        "
      >
        <div className="careermap-container">
          {/* Header */}
          <div className="min-w-0">
            <AnalyzerHeader />
          </div>

          {/* Workspace */}
          <div
            className="
              mt-5
              sm:mt-7
              lg:mt-8
            "
          >
            <AnalyzerWorkspace
              resumeFile={resumeFile}
              onResumeChange={
                handleResumeChange
              }
              jobDescription={
                jobDescription
              }
              onJobDescriptionChange={
                handleJobDescriptionChange
              }
            />
          </div>

          {/* Analyze button */}
          <div
            className="
              mt-4
              sm:mt-5
              lg:mt-6
            "
          >
            <AnalyzeButton
              disabled={
                !canAnalyze ||
                buttonStatus === "error"
              }
              status={buttonStatus}
              onClick={handleAnalyze}
            />
          </div>

          {/* Error message */}
          {errorMessage && (
            <div
              className="
                mx-auto mt-3
                max-w-5xl
                sm:mt-4
              "
              role="alert"
              aria-live="assertive"
            >
              <div
                className="
                  rounded-xl
                  border border-rose-200
                  bg-rose-50
                  px-3 py-2.5
                  sm:px-4 sm:py-3
                "
              >
                <p
                  className="
                    text-center
                    text-[10px] font-medium leading-4
                    text-rose-700
                    sm:text-[11px] sm:leading-5
                  "
                >
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Privacy notice */}
          <div
            className="
              mt-4
              sm:mt-5
              lg:mt-6
            "
          >
            <PrivacyNotice />
          </div>
        </div>
      </section>
    </main>
  );
}
