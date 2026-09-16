from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from services.pdf_service import (
    build_analyzer_pdf,
    build_roadmap_pdf,
)


router = APIRouter(
    prefix="/api/pdf",
    tags=["PDF Export"],
)


class AnalyzerPDFRequest(BaseModel):
    analysis: dict[str, Any] = Field(
        ...,
        description="Structured analyzer result returned by CareerMap.",
    )


class RoadmapPDFRequest(BaseModel):
    roadmap: dict[str, Any] = Field(
        ...,
        description="Structured personalized roadmap returned by CareerMap.",
    )
    source: str | None = None
    generated_at: str | None = None


@router.post("/analyzer")
async def export_analyzer_pdf(
    payload: AnalyzerPDFRequest,
):
    """
    Export Resume & JD Analyzer results as a temporary PDF.
    """
    try:
        pdf_buffer = build_analyzer_pdf(
            payload.analysis,
        )

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    'attachment; filename="careermap-analyzer-report.pdf"'
                ),
                "Cache-Control": "no-store",
            },
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate the analyzer PDF.",
        ) from exc


@router.post("/roadmap")
async def export_roadmap_pdf(
    payload: RoadmapPDFRequest,
):
    """
    Export Personalized Career Roadmap results as a temporary PDF.
    """
    try:
        pdf_buffer = build_roadmap_pdf(
            roadmap=payload.roadmap,
            source=payload.source,
            generated_at=payload.generated_at,
        )

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    'attachment; filename="careermap-career-roadmap.pdf"'
                ),
                "Cache-Control": "no-store",
            },
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate the roadmap PDF.",
        ) from exc