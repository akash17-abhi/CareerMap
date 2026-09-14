import { motion } from "framer-motion";

import JobDescriptionInput from "@/features/analyzer/components/JobDescriptionInput";
import ResumeUpload from "@/features/analyzer/components/ResumeUpload";

interface AnalyzerWorkspaceProps {
  resumeFile: File | null;
  onResumeChange: (file: File | null) => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
}

export default function AnalyzerWorkspace({
  resumeFile,
  onResumeChange,
  jobDescription,
  onJobDescriptionChange,
}: AnalyzerWorkspaceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        mx-auto w-full max-w-5xl min-w-0
      "
    >
      <div
        className="
          grid min-w-0
          gap-3
          sm:gap-4
          lg:grid-cols-2 lg:items-stretch
          lg:gap-5
        "
      >
        <div className="min-w-0">
          <ResumeUpload
            resumeFile={resumeFile}
            onResumeChange={onResumeChange}
          />
        </div>

        <div className="min-w-0">
          <JobDescriptionInput
            value={jobDescription}
            onChange={onJobDescriptionChange}
          />
        </div>
      </div>
    </motion.div>
  );
}