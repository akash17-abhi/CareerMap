import { useState } from "react";
import { Download } from "lucide-react";

interface PDFExportButtonProps {
  endpoint: string;
  payload: Record<string, unknown>;
  filename: string;
  label?: string;
  className?: string;
}

export default function PDFExportButton({
  endpoint,
  payload,
  filename,
  label = "Export as PDF",
  className = "",
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "Unable to export the PDF.";

        try {
          const errorPayload = (await response.json()) as {
            detail?: unknown;
          };

          if (
            errorPayload &&
            typeof errorPayload.detail === "string" &&
            errorPayload.detail.trim()
          ) {
            message = errorPayload.detail;
          }
        } catch {
          // Keep the fallback error message.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error("The PDF export returned an empty file.");
      }

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to export the PDF. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className={[
          "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl",
          "border border-slate-200 bg-white px-3.5",
          "text-[10px] font-semibold text-slate-700",
          "shadow-sm transition",
          "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        ].join(" ")}
      >
        {isExporting ? (
          <>
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"
            />
            Generating PDF...
          </>
        ) : (
          <>
            <Download
              className="h-3.5 w-3.5"
              strokeWidth={1.9}
            />
            {label}
          </>
        )}
      </button>

      {error && (
        <p
          role="alert"
          className="max-w-xs text-right text-[9px] leading-4 text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}