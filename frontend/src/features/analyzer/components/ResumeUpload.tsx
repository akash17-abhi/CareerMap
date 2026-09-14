import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

interface ResumeUploadProps {
  resumeFile: File | null;
  onResumeChange: (file: File | null) => void;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES =
  MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const isSupportedFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();

  return (
    ALLOWED_TYPES.includes(file.type) ||
    fileName.endsWith(".pdf") ||
    fileName.endsWith(".docx")
  );
};

function ResumeUpload({
  resumeFile,
  onResumeChange,
}: ResumeUploadProps) {
  const [dragActive, setDragActive] =
    useState(false);

  const [validationError, setValidationError] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const validateFile = (
    file: File,
  ): string | null => {
    if (!isSupportedFile(file)) {
      return "Unsupported file type. Please upload a PDF or DOCX file.";
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB} MB.`;
    }

    if (file.size === 0) {
      return "This file appears to be empty. Please choose another resume.";
    }

    return null;
  };

  const handleFile = (file?: File) => {
    if (!file) {
      return;
    }

    const error = validateFile(file);

    if (error) {
      onResumeChange(null);
      setValidationError(error);
      return;
    }

    setValidationError(null);
    onResumeChange(file);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setDragActive(false);

    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setDragActive(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAreaKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openFilePicker();
    }
  };

  const removeResume = () => {
    onResumeChange(null);
    setValidationError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formattedFileSize = resumeFile
    ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB`
    : "";

  return (
    <section
      className="
        careermap-card min-w-0
        p-3.5
        sm:p-4
        lg:p-5
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div
            aria-hidden="true"
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-lg border border-blue-100
              bg-blue-50 text-blue-600
              sm:h-10 sm:w-10 sm:rounded-xl
            "
          >
            <FileText
              className="h-4 w-4"
              strokeWidth={1.9}
            />
          </div>

          <div className="min-w-0">
            <h2
              className="
                text-sm font-semibold
                tracking-tight text-slate-900
              "
            >
              Your resume
            </h2>

            <p
              className="
                mt-0.5 text-[10px] leading-4
                text-slate-500
                sm:text-[11px]
              "
            >
              Upload the resume you want to analyze.
            </p>
          </div>
        </div>

        <span
          className="
            shrink-0 rounded-full
            border border-slate-200
            bg-slate-50
            px-2 py-1
            text-[8px] font-semibold uppercase
            tracking-[0.08em] text-slate-500
            sm:text-[9px]
          "
        >
          Required
        </span>
      </div>

      {/* Valid uploaded file */}
      {resumeFile ? (
        <motion.div
          initial={{
            opacity: 0,
            y: 4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            mt-3 rounded-xl
            border border-emerald-100
            bg-emerald-50/40
            p-2.5
            sm:mt-4 sm:p-3
          "
        >
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-lg border border-emerald-100
                bg-white text-emerald-600
                shadow-[0_2px_8px_rgba(15,23,42,0.04)]
              "
            >
              <FileText
                className="h-4 w-4"
                strokeWidth={1.9}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p
                title={resumeFile.name}
                className="
                  truncate text-[11px]
                  font-semibold text-slate-800
                  sm:text-xs
                "
              >
                {resumeFile.name}
              </p>

              <p
                className="
                  mt-0.5 text-[9px]
                  text-slate-500
                  sm:text-[10px]
                "
              >
                {formattedFileSize}
              </p>
            </div>

            <button
              type="button"
              onClick={removeResume}
              aria-label={`Remove ${resumeFile.name}`}
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-lg
                border border-transparent
                text-slate-400
                outline-none
                transition-[background-color,color,border-color]
                duration-200
                hover:border-slate-200
                hover:bg-white
                hover:text-slate-700
                focus-visible:border-slate-300
                focus-visible:bg-white
                focus-visible:ring-4
                focus-visible:ring-blue-500/10
              "
            >
              <X
                className="h-4 w-4"
                strokeWidth={1.8}
              />
            </button>
          </div>

          <div
            className="
              mt-2.5 flex items-center gap-1.5
              text-[9px] font-medium
              text-emerald-700
              sm:text-[10px]
            "
            role="status"
            aria-live="polite"
          >
            <CheckCircle2
              className="h-3.5 w-3.5 shrink-0"
              strokeWidth={2}
              aria-hidden="true"
            />

            <span>
              Resume ready for analysis
            </span>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Upload area */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload your resume"
            aria-describedby="resume-upload-help resume-upload-error"
            aria-invalid={
              validationError ? "true" : "false"
            }
            onClick={openFilePicker}
            onKeyDown={handleUploadAreaKeyDown}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              "mt-3 flex min-h-[148px] w-full",
              "cursor-pointer flex-col items-center justify-center",
              "rounded-xl border-2 border-dashed",
              "px-4 py-4 text-center",
              "outline-none",
              "transition-[border-color,background-color,box-shadow]",
              "duration-200",
              "sm:mt-4 sm:min-h-[165px] sm:px-5",
              "focus-visible:ring-4 focus-visible:ring-blue-500/10",
              validationError
                ? "border-rose-300 bg-rose-50/40"
                : dragActive
                  ? "border-blue-400 bg-blue-50/70"
                  : "border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/20",
            ].join(" ")}
          >
            <motion.div
              animate={{
                y: dragActive ? -2 : 0,
              }}
              transition={{
                duration: 0.2,
              }}
              className={[
                "flex h-9 w-9 items-center justify-center",
                "rounded-lg border",
                "sm:h-10 sm:w-10 sm:rounded-xl",
                validationError
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : dragActive
                    ? "border-blue-200 bg-blue-100 text-blue-600"
                    : "border-slate-200 bg-white text-slate-400 shadow-[0_2px_8px_rgba(15,23,42,0.04)]",
              ].join(" ")}
            >
              <Upload
                className="h-4 w-4"
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </motion.div>

            <p
              className="
                mt-2.5 text-[13px]
                font-semibold leading-5
                text-slate-800
                sm:text-sm
              "
            >
              {dragActive
                ? "Drop your resume here"
                : "Upload your resume"}
            </p>

            <p
              className="
                mt-0.5 text-[10px]
                leading-4 text-slate-500
                sm:text-[11px]
              "
            >
              Drag &amp; drop or click to browse
            </p>

            <span
              className="
                mt-2.5 inline-flex min-h-9
                items-center justify-center
                rounded-lg border border-slate-200
                bg-white px-3
                text-[10px] font-semibold
                text-slate-700
                shadow-[0_2px_8px_rgba(15,23,42,0.04)]
                sm:min-h-10 sm:px-3.5
              "
            >
              Choose file
            </span>
          </div>

          {/* Inline validation error */}
          {validationError && (
            <motion.div
              initial={{
                opacity: 0,
                y: -3,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              id="resume-upload-error"
              role="alert"
              aria-live="assertive"
              className="
                mt-2.5 flex items-start gap-2
                rounded-lg
                border border-rose-200
                bg-rose-50
                px-2.5 py-2
                sm:px-3
              "
            >
              <AlertCircle
                className="
                  mt-0.5 h-3.5 w-3.5
                  shrink-0 text-rose-600
                "
                strokeWidth={1.9}
                aria-hidden="true"
              />

              <p
                className="
                  text-[10px] leading-4
                  text-rose-700
                  sm:text-[11px]
                "
              >
                {validationError}
              </p>
            </motion.div>
          )}
        </>
      )}

      {/* Helper text */}
      <p
        id="resume-upload-help"
        className="
          mt-2 text-[9px] leading-4
          text-slate-500
          sm:mt-2.5 sm:text-[10px]
        "
      >
        PDF or DOCX • Max {MAX_FILE_SIZE_MB} MB • Used only for the requested
        analysis
      </p>

      {/* Native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Choose resume file"
      />
    </section>
  );
}

export default ResumeUpload;