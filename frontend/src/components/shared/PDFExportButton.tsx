import { useState } from "react";
import { Download } from "lucide-react";

interface PDFExportButtonProps {
  endpoint: string;
  payload: Record<string, unknown>;
  filename: string;
  label?: string;
  exportingLabel?: string;
  className?: string;
}

export default function PDFExportButton({
  endpoint,
  payload,
  filename,
  label = "Export as PDF",
  exportingLabel = "Generating PDF...",
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
          Accept: "application/pdf, application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await getErrorMessage(response);
        throw new Error(message);
      }

      const contentType =
        response.headers.get("content-type")?.toLowerCase() ?? "";

      if (
        contentType &&
        !contentType.includes("application/pdf") &&
        !contentType.includes("application/octet-stream")
      ) {
        throw new Error(
          "The export service did not return a valid PDF file.",
        );
      }

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error(
          "The PDF export returned an empty file.",
        );
      }

      const safeFilename = normalizeFilename(filename);

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = safeFilename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);
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
    <div className="flex min-w-0 flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        aria-busy={isExporting}
        aria-label={isExporting ? exportingLabel : label}
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

            <span>{exportingLabel}</span>
          </>
        ) : (
          <>
            <Download
              className="h-3.5 w-3.5"
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <span>{label}</span>
          </>
        )}
      </button>

      {error ? (
        <p
          role="alert"
          className="max-w-xs text-right text-[9px] leading-4 text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

async function getErrorMessage(
  response: Response,
): Promise<string> {
  const fallback =
    "Unable to export the PDF. Please try again.";

  const contentType =
    response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    try {
      const payload: unknown = await response.json();

      if (
        payload &&
        typeof payload === "object" &&
        !Array.isArray(payload) &&
        "detail" in payload
      ) {
        const detail = (payload as { detail?: unknown }).detail;

        if (
          typeof detail === "string" &&
          detail.trim()
        ) {
          return detail.trim();
        }
      }

      return fallback;
    } catch {
      return fallback;
    }
  }

  try {
    const text = (await response.text()).trim();

    return text || fallback;
  } catch {
    return fallback;
  }
}

function normalizeFilename(filename: string): string {
  const trimmed = filename.trim();

  if (!trimmed) {
    return "careermap-export.pdf";
  }

  if (trimmed.toLowerCase().endsWith(".pdf")) {
    return trimmed;
  }

  return `${trimmed}.pdf`;
}