from __future__ import annotations

import fastapi
import fastapi.middleware.cors

from api.analyzer import router as analyzer_router
from api.roadmap import router as roadmap_router
from api.export import router as export_router
from core.config import get_settings


settings = get_settings()


app = fastapi.FastAPI(
    title=settings.app_name,
    description="Privacy-First AI Career Assistant API",
    version=settings.app_version,
)


app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    analyzer_router
)

app.include_router(
    roadmap_router
)

app.include_router(
    export_router
)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "CareerMap API is running",
        "status": "healthy",
        "version": settings.app_version,
    }


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "careermap-api",
        "environment": settings.environment,
    }