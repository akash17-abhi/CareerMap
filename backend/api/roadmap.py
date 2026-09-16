from __future__ import annotations

import logging
from dataclasses import asdict
from typing import Annotated, Any

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict, Field

from core.config import get_settings
from services.document_parser import (
    DocumentParserError,
    SUPPORTED_EXTENSIONS,
    extract_document_text,
    validate_document,
)
from services.resume_extractor import extract_resume_profile
from services.roadmap_generator import RoadmapGenerationError, generate_roadmap


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    tags=["Roadmap"],
)


class RoadmapGenerateRequest(BaseModel):
    """Frontend-confirmed roadmap input."""

    model_config = ConfigDict(extra="ignore")

    source: str = Field(min_length=1, max_length=40)
    targetJobRole: str = Field(min_length=1, max_length=180)
    profile: dict[str, Any] | None = None
    extractedResume: dict[str, Any] | None = None
    analyzerContext: dict[str, Any] | None = None


ALLOWED_SOURCES = {"manual", "cv", "analyzer"}


# ============================================================================
# Shared helpers
# ============================================================================


def _get_max_upload_bytes() -> int:
    settings = get_settings()
    return settings.max_upload_size_mb * 1024 * 1024


def _validate_filename(filename: str | None) -> str:
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


def _validate_extension(filename: str) -> None:
    filename_lower = filename.lower()
    if not any(filename_lower.endswith(extension) for extension in SUPPORTED_EXTENSIONS):
        supported = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported resume format. Supported formats: {supported}.",
        )


def _content_type_or_none(resume_file: UploadFile) -> str | None:
    content_type = resume_file.content_type
    if not content_type:
        return None
    content_type = content_type.strip()
    return content_type or None


async def _read_upload_safely(resume_file: UploadFile) -> bytes:
    max_bytes = _get_max_upload_bytes()
    content = await resume_file.read(max_bytes + 1)

    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"Resume file is too large. Maximum allowed size is "
                f"{get_settings().max_upload_size_mb} MB."
            ),
        )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded resume file is empty.",
        )

    return content


def _safe_log_context(filename: str) -> dict[str, str]:
    return {"resume_filename": filename}


def _serialize_resume_profile_without_raw_text(profile: object) -> dict[str, object]:
    data = asdict(profile)
    data.pop("raw_text", None)

    sections = data.get("sections")
    if isinstance(sections, list):
        cleaned_sections: list[dict[str, object]] = []
        for section in sections:
            if isinstance(section, dict):
                section_copy = dict(section)
                section_copy.pop("raw_text", None)
                section_copy.pop("lines", None)
                cleaned_sections.append(section_copy)
        data["sections"] = cleaned_sections

    return data


def _clean_profile_payload(profile: dict[str, Any]) -> dict[str, Any]:
    """Remove raw document text and line-level extraction payloads."""
    cleaned = dict(profile)
    cleaned.pop("raw_text", None)
    cleaned.pop("lines", None)

    sections = cleaned.get("sections")
    if isinstance(sections, list):
        stripped_sections: list[dict[str, Any]] = []
        for section in sections:
            if isinstance(section, dict):
                item = dict(section)
                item.pop("raw_text", None)
                item.pop("lines", None)
                stripped_sections.append(item)
        cleaned["sections"] = stripped_sections

    return cleaned


def _clean_analyzer_context(context: dict[str, Any] | None) -> dict[str, Any] | None:
    """
    Keep roadmap generation focused on structured analysis rather than raw
    resume/JD evidence. This reduces unnecessary personal document disclosure.
    """
    if context is None:
        return None

    cleaned: dict[str, Any] = {}

    for key in (
        "role",
        "matchScore",
        "skillsMatchScore",
        "keywordMatchScore",
        "experienceMatchScore",
        "educationMatchScore",
        "semanticSimilarityScore",
        "atsScore",
    ):
        if key in context:
            cleaned[key] = context[key]

    skills = context.get("skills")
    if isinstance(skills, list):
        clean_skills: list[dict[str, Any]] = []
        for skill in skills:
            if not isinstance(skill, dict):
                continue
            item: dict[str, Any] = {}
            for key in (
                "id",
                "name",
                "mentioned",
                "requiredByRole",
                "evidenceFound",
                "evidenceStrength",
                "confidence",
                "score",
                "status",
            ):
                if key in skill:
                    item[key] = skill[key]
            if item:
                clean_skills.append(item)
        cleaned["skills"] = clean_skills

    missing_skills = context.get("missingSkills")
    if isinstance(missing_skills, list):
        clean_missing: list[dict[str, Any]] = []
        for skill in missing_skills:
            if not isinstance(skill, dict):
                continue
            item: dict[str, Any] = {}
            for key in ("id", "name", "importance", "reason", "action"):
                if key in skill:
                    item[key] = skill[key]
            if item:
                clean_missing.append(item)
        cleaned["missingSkills"] = clean_missing

    strengths = context.get("strengths")
    if isinstance(strengths, list):
        clean_strengths: list[dict[str, Any]] = []
        for strength in strengths:
            if not isinstance(strength, dict):
                continue
            item: dict[str, Any] = {}
            for key in ("id", "title", "description", "confidence"):
                if key in strength:
                    item[key] = strength[key]
            if item:
                clean_strengths.append(item)
        cleaned["strengths"] = clean_strengths

    improvements = context.get("improvements")
    if isinstance(improvements, list):
        clean_improvements: list[dict[str, Any]] = []
        for improvement in improvements:
            if not isinstance(improvement, dict):
                continue
            item: dict[str, Any] = {}
            for key in ("id", "title", "priority", "problem", "whyItMatters", "action"):
                if key in improvement:
                    item[key] = improvement[key]
            if item:
                clean_improvements.append(item)
        cleaned["improvements"] = clean_improvements

    return cleaned


# ============================================================================
# Resume extraction
# ============================================================================


@router.post(
    "/roadmap/resume/extract",
    summary="Extract a structured resume profile for Roadmap",
    status_code=status.HTTP_200_OK,
)
async def extract_resume_for_roadmap(
    resume: Annotated[
        UploadFile,
        File(description="Resume file. Supported formats: PDF and DOCX."),
    ],
) -> dict[str, object]:
    filename = _validate_filename(resume.filename)
    _validate_extension(filename)
    content_type = _content_type_or_none(resume)

    try:
        resume_bytes = await _read_upload_safely(resume)
        validate_document(
            file_bytes=resume_bytes,
            filename=filename,
            content_type=content_type,
        )

        resume_text = extract_document_text(
            file_bytes=resume_bytes,
            filename=filename,
            content_type=content_type,
        )
        resume_profile = extract_resume_profile(resume_text)

        return {
            "source": "resume",
            "filename": filename,
            "profile": _serialize_resume_profile_without_raw_text(resume_profile),
        }

    except HTTPException:
        raise
    except DocumentParserError as exc:
        logger.warning(
            "Roadmap resume parsing failed: %s",
            exc,
            extra=_safe_log_context(filename),
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        logger.warning(
            "Roadmap resume profile extraction failed: %s",
            exc,
            extra=_safe_log_context(filename),
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception(
            "Unexpected Roadmap resume extraction failure.",
            extra=_safe_log_context(filename),
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Resume profile extraction failed unexpectedly. Please try again.",
        ) from exc
    finally:
        try:
            await resume.close()
        except Exception:
            logger.warning(
                "Failed to close Roadmap resume stream.",
                extra=_safe_log_context(filename),
            )


# ============================================================================
# Roadmap generation
# ============================================================================


@router.post(
    "/roadmap/generate",
    summary="Generate a personalized career roadmap",
    status_code=status.HTTP_200_OK,
)
async def create_personalized_roadmap(
    request: RoadmapGenerateRequest,
) -> dict[str, Any]:
    """Generate a stateless roadmap using the Gemini-first generator."""
    source = request.source.strip().lower()
    if source not in ALLOWED_SOURCES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported roadmap source.",
        )

    target_role = request.targetJobRole.strip()
    if not target_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target job role is required.",
        )

    if request.profile is not None and request.extractedResume is not None:
        logger.info("Both profile and extractedResume supplied; using profile as the primary source.")

    if request.profile is not None:
        profile = _clean_profile_payload(request.profile)
    elif request.extractedResume is not None:
        profile = _clean_profile_payload(request.extractedResume)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A roadmap profile or extracted resume profile is required.",
        )

    analyzer_context = _clean_analyzer_context(request.analyzerContext)

    try:
        roadmap = generate_roadmap(
            profile=profile,
            target_role=target_role,
            analyzer_context=analyzer_context,
        )
    except RoadmapGenerationError as exc:
        logger.warning("Roadmap generation rejected: %s", exc)
        message = str(exc)
        lower_message = message.lower()
        status_code = (
            status.HTTP_503_SERVICE_UNAVAILABLE
            if "configured" in lower_message
            or "initialize" in lower_message
            or "service" in lower_message
            else status.HTTP_502_BAD_GATEWAY
        )
        raise HTTPException(
            status_code=status_code,
            detail=message,
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected personalized roadmap generation failure.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Personalized roadmap generation failed unexpectedly. Please try again.",
        ) from exc

    return {
        "source": source,
        "roadmap": roadmap.model_dump(mode="json"),
    }
