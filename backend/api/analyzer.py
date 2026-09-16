from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from core.config import get_settings
from schemas.analyzer import AnalyzerResult
from services.analyzer_engine import (
    analyze_local_document,
    validate_local_analyzer_result,
)
from services.document_parser import (
    DocumentParserError,
    SUPPORTED_EXTENSIONS,
    validate_document,
)
from services.gemini_service import (
    GeminiServiceError,
    try_enhance_local_analysis,
)


# ============================================================================
# Configuration
# ============================================================================

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    tags=["Analyzer"],
)


# ============================================================================
# Helpers
# ============================================================================

def _get_max_upload_bytes() -> int:
    settings = get_settings()

    return (
        settings.max_upload_size_mb
        * 1024
        * 1024
    )


def _validate_filename(
    filename: str | None,
) -> str:
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume filename is required.",
        )

    cleaned = filename.strip()

    if not cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume filename cannot be empty.",
        )

    return cleaned


def _validate_extension(
    filename: str,
) -> None:
    filename_lower = filename.lower()

    if not any(
        filename_lower.endswith(
            extension
        )
        for extension in SUPPORTED_EXTENSIONS
    ):
        supported = ", ".join(
            sorted(SUPPORTED_EXTENSIONS)
        )

        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported resume format. "
                f"Supported formats: {supported}."
            ),
        )


def _validate_job_description(
    job_description: str,
) -> str:
    if job_description is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is required.",
        )

    cleaned = job_description.strip()

    if not cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty.",
        )

    # Prevent accidentally sending an extremely large payload into the
    # extraction/analysis pipeline.
    max_jd_characters = 100_000

    if len(cleaned) > max_jd_characters:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                "Job description is too large. "
                "Please provide a shorter job description."
            ),
        )

    return cleaned


async def _read_upload_safely(
    resume_file: UploadFile,
) -> bytes:
    """
    Read the uploaded resume completely into memory with a hard size limit.

    No temporary disk file is created.
    """
    max_bytes = _get_max_upload_bytes()

    content = await resume_file.read(
        max_bytes + 1
    )

    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"Resume file is too large. "
                f"Maximum allowed size is "
                f"{get_settings().max_upload_size_mb} MB."
            ),
        )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded resume file is empty.",
        )

    return content


def _content_type_or_none(
    resume_file: UploadFile,
) -> str | None:
    content_type = resume_file.content_type

    if not content_type:
        return None

    content_type = content_type.strip()

    return content_type or None


def _safe_log_context(
    filename: str,
) -> dict[str, str]:
    """
    Keep logging privacy-conscious.

    Do not log:
        - resume content
        - job description
        - extracted candidate data
        - scores
        - Gemini prompts

    `resume_filename` is used instead of `filename` because Python's
    logging LogRecord already has a reserved `filename` attribute.
    """
    return {
        "resume_filename": filename,
    }


# ============================================================================
# Analyze Endpoint
# ============================================================================

@router.post(
    "/analyze",
    response_model=AnalyzerResult,
    status_code=status.HTTP_200_OK,
    summary="Analyze a resume against a job description",
    description=(
        "Runs deterministic local resume/JD analysis and then optionally "
        "uses Gemini to validate and enhance the structured local result. "
        "Resume content is processed in memory and is not persisted."
    ),
)
async def analyze_resume(
    resume_file: Annotated[
        UploadFile,
        File(
            description=(
                "Resume file. Supported formats: PDF and DOCX."
            )
        ),
    ],
    job_description: Annotated[
        str,
        Form(
            description="Target job description text."
        ),
    ],
) -> AnalyzerResult:
    """
    Analyze one resume against one job description.

    Processing order:
        1. Validate upload metadata.
        2. Read resume into memory.
        3. Extract document text locally.
        4. Run complete deterministic local analysis.
        5. Validate local result.
        6. Run Gemini validation/enhancement.
        7. Return final structured response.

    Privacy:
        - No resume file is written to disk by this endpoint.
        - No database is used.
        - No analysis history is stored here.
        - Gemini receives the structured local analysis rather than the
          original resume/JD by default.
    """
    filename = _validate_filename(
        resume_file.filename
    )

    _validate_extension(
        filename
    )

    normalized_jd = _validate_job_description(
        job_description
    )

    content_type = _content_type_or_none(
        resume_file
    )

    try:
        # ---------------------------------------------------------------
        # Read file into memory.
        # ---------------------------------------------------------------

        resume_bytes = await _read_upload_safely(
            resume_file
        )

        # ---------------------------------------------------------------
        # Validate file bytes/metadata before analysis.
        # ---------------------------------------------------------------

        try:
            validate_document(
                file_bytes=resume_bytes,
                filename=filename,
                content_type=content_type,
            )

        except DocumentParserError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc

        # ---------------------------------------------------------------
        # Complete LOCAL analysis.
        # ---------------------------------------------------------------

        local_analysis = analyze_local_document(
            resume_bytes=resume_bytes,
            resume_filename=filename,
            job_description=normalized_jd,
            content_type=content_type,
        )

        # ---------------------------------------------------------------
        # Critical source-of-truth validation.
        # ---------------------------------------------------------------

        validate_local_analyzer_result(
            local_analysis
        )

        # ---------------------------------------------------------------
        # Gemini enhancement.
        #
        # If Gemini is unavailable, this safely returns local analysis
        # without fabricated AI fields.
        # ---------------------------------------------------------------

        final_result = try_enhance_local_analysis(
            local_analysis
        )

        return final_result

    except HTTPException:
        raise

    except DocumentParserError as exc:
        logger.warning(
            "Document parsing failed: %s",
            exc,
            extra=_safe_log_context(
                filename
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except GeminiServiceError as exc:
        # Normally try_enhance_local_analysis catches GeminiServiceError
        # and returns the local result. This branch protects the endpoint
        # if the behavior changes or a lower-level service raises outside
        # that fallback boundary.
        logger.exception(
            "Gemini service error.",
            extra=_safe_log_context(
                filename
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "AI enhancement is temporarily unavailable. "
                "Please try again."
            ),
        ) from exc

    except ValueError as exc:
        logger.warning(
            "Analyzer validation error: %s",
            exc,
            extra=_safe_log_context(
                filename
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        # Do not expose internal implementation details or stack traces
        # through the API response.
        logger.exception(
            "Unexpected resume analysis failure.",
            extra=_safe_log_context(
                filename
            ),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Resume analysis failed unexpectedly. "
                "Please try again."
            ),
        ) from exc

    finally:
        # The endpoint intentionally does not create a temporary file.
        #
        # Python/FastAPI will release the in-memory objects after request
        # handling. No resume/JD persistence is performed here.
        #
        # Keep this block explicit as a privacy boundary so future changes
        # do not accidentally skip cleanup logic.
        try:
            await resume_file.close()
        except Exception:
            logger.warning(
                "Failed to close uploaded resume stream.",
                extra=_safe_log_context(
                    filename
                ),
            )


# ============================================================================
# Lightweight API Diagnostics
# ============================================================================

@router.get(
    "/analyze/status",
    summary="Analyzer service status",
)
async def analyzer_status() -> dict[str, str | int]:
    """
    Return non-sensitive analyzer configuration information.
    """
    settings = get_settings()

    return {
        "service": "careermap-analyzer",
        "status": "ready",
        "max_upload_size_mb": settings.max_upload_size_mb,
        "supported_formats": ", ".join(
            sorted(
                SUPPORTED_EXTENSIONS
            )
        ),
    }