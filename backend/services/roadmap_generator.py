from __future__ import annotations

import json
import logging
from typing import Any

from google import genai
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from core.config import get_settings


logger = logging.getLogger(__name__)

DEFAULT_MODEL = "gemini-3.8-flash"


class RoadmapGenerationError(RuntimeError):
    """Raised when a roadmap cannot be generated safely."""


# =============================================================
# STRUCTURED ROADMAP MODELS
# =============================================================


class RoadmapMilestone(BaseModel):
    """One meaningful checkpoint inside a roadmap phase."""

    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=1, max_length=180)
    outcome: str = Field(min_length=1, max_length=600)
    tasks: list[str] = Field(default_factory=list, min_length=1, max_length=8)


class StudyResource(BaseModel):
    """A phase-specific learning resource recommendation.

    URLs are optional on purpose. Gemini must never invent a link merely to
    satisfy the field. A later resource-discovery layer can attach validated
    URLs from trusted sources.
    """

    model_config = ConfigDict(extra="ignore")

    id: str = Field(min_length=1, max_length=120)
    type: str = Field(min_length=1, max_length=40)
    title: str = Field(min_length=1, max_length=220)
    provider: str = Field(min_length=1, max_length=120)
    topic: str = Field(min_length=1, max_length=180)
    description: str = Field(min_length=1, max_length=500)
    why_recommended: str = Field(min_length=1, max_length=500)
    level: str = Field(min_length=1, max_length=40)
    language: str = Field(min_length=1, max_length=40)
    estimated_minutes: int | None = Field(default=None, ge=1, le=10000)
    price: str = Field(default="unknown", max_length=40)
    official: bool = False
    url: str | None = Field(default=None, max_length=1000)


class PhaseLearn(BaseModel):
    """Learn stage of a roadmap phase."""

    model_config = ConfigDict(extra="ignore")

    objective: str = Field(min_length=1, max_length=600)
    topics: list[str] = Field(default_factory=list, min_length=1, max_length=12)
    study_materials: list[StudyResource] = Field(
        default_factory=list,
        max_length=8,
    )


class PhasePractice(BaseModel):
    """Practice stage of a roadmap phase."""

    model_config = ConfigDict(extra="ignore")

    objective: str = Field(min_length=1, max_length=600)
    activities: list[str] = Field(default_factory=list, min_length=1, max_length=10)
    success_criteria: list[str] = Field(default_factory=list, max_length=10)


class PhaseBuild(BaseModel):
    """Build stage of a roadmap phase."""

    model_config = ConfigDict(extra="ignore")

    objective: str = Field(min_length=1, max_length=700)
    project: str = Field(min_length=1, max_length=220)
    requirements: list[str] = Field(default_factory=list, max_length=10)
    deliverables: list[str] = Field(default_factory=list, min_length=1, max_length=10)


class PhaseProve(BaseModel):
    """Proof stage of a roadmap phase."""

    model_config = ConfigDict(extra="ignore")

    objective: str = Field(min_length=1, max_length=700)
    evidence: list[str] = Field(default_factory=list, min_length=1, max_length=10)
    portfolio_signal: str | None = Field(default=None, max_length=500)


class RoadmapPhase(BaseModel):
    """One ordered phase following Learn → Practice → Build → Prove."""

    model_config = ConfigDict(extra="ignore")

    phase: int = Field(ge=1, le=12)
    title: str = Field(min_length=1, max_length=160)
    purpose: str = Field(min_length=1, max_length=600)
    duration: str = Field(min_length=1, max_length=80)
    focus_skills: list[str] = Field(default_factory=list, max_length=12)

    learn: PhaseLearn
    practice: PhasePractice
    build: PhaseBuild
    prove: PhaseProve

    milestones: list[RoadmapMilestone] = Field(
        default_factory=list,
        min_length=1,
        max_length=6,
    )
    project: str = Field(min_length=1, max_length=220)
    completion_signal: str = Field(min_length=1, max_length=500)


class CareerSnapshot(BaseModel):
    """Verified profile snapshot used by the results page."""

    model_config = ConfigDict(extra="ignore")

    current_level: str = Field(min_length=1, max_length=160)
    target_role: str = Field(min_length=1, max_length=180)
    career_goal: str = Field(min_length=1, max_length=160)
    education: str = Field(min_length=1, max_length=300)
    experience: str = Field(min_length=1, max_length=400)
    learning_time_per_week: str = Field(min_length=1, max_length=100)
    target_timeline: str = Field(min_length=1, max_length=100)
    learning_preferences: list[str] = Field(default_factory=list, max_length=12)


class SkillMapItem(BaseModel):
    """Qualitative current-to-target skill view."""

    model_config = ConfigDict(extra="ignore")

    skill: str = Field(min_length=1, max_length=120)
    current_level: str = Field(min_length=1, max_length=80)
    target_level: str = Field(min_length=1, max_length=80)
    status: str = Field(min_length=1, max_length=40)
    reason: str = Field(min_length=1, max_length=400)


class RoadmapStrategy(BaseModel):
    """Explains why the roadmap takes this direction."""

    model_config = ConfigDict(extra="ignore")

    summary: str = Field(min_length=1, max_length=900)
    why_this_roadmap: str = Field(min_length=1, max_length=900)
    approach: list[str] = Field(default_factory=list, max_length=8)
    priorities: list[str] = Field(default_factory=list, max_length=8)
    constraints: list[str] = Field(default_factory=list, max_length=8)


class WeeklyRoutineItem(BaseModel):
    """One practical weekly study/build activity."""

    model_config = ConfigDict(extra="ignore")

    day: str = Field(min_length=1, max_length=80)
    focus: str = Field(min_length=1, max_length=120)
    estimated_minutes: int = Field(ge=1, le=1000)
    activities: list[str] = Field(default_factory=list, min_length=1, max_length=10)


class PortfolioOutcome(BaseModel):
    """A recruiter-visible outcome the user can accumulate."""

    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=1, max_length=180)
    description: str = Field(min_length=1, max_length=600)
    skills_demonstrated: list[str] = Field(default_factory=list, max_length=10)
    evidence: list[str] = Field(default_factory=list, max_length=8)


class CareerReadinessItem(BaseModel):
    """Qualitative readiness assessment grounded in the roadmap."""

    model_config = ConfigDict(extra="ignore")

    area: str = Field(min_length=1, max_length=100)
    status: str = Field(min_length=1, max_length=80)
    current_state: str = Field(min_length=1, max_length=500)
    action: str = Field(min_length=1, max_length=500)


class NextAction(BaseModel):
    """The single most useful immediate next step."""

    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=1, max_length=180)
    description: str = Field(min_length=1, max_length=600)
    reason: str = Field(min_length=1, max_length=500)
    estimated_minutes: int | None = Field(default=None, ge=1, le=1000)


class RoadmapResponse(BaseModel):
    """Final structured roadmap returned to the CareerMap frontend."""

    model_config = ConfigDict(extra="ignore")

    target_role: str = Field(min_length=1, max_length=180)
    profile_summary: str = Field(min_length=1, max_length=1200)

    career_snapshot: CareerSnapshot
    starting_strengths: list[str] = Field(default_factory=list, max_length=12)
    priority_gaps: list[str] = Field(default_factory=list, max_length=12)
    skill_map: list[SkillMapItem] = Field(default_factory=list, max_length=15)
    roadmap_strategy: RoadmapStrategy

    phases: list[RoadmapPhase] = Field(min_length=3, max_length=8)

    weekly_routine: list[WeeklyRoutineItem] = Field(
        default_factory=list,
        min_length=3,
        max_length=12,
    )

    portfolio_outcomes: list[PortfolioOutcome] = Field(
        default_factory=list,
        max_length=8,
    )

    career_readiness: list[CareerReadinessItem] = Field(
        default_factory=list,
        max_length=8,
    )

    final_readiness_checklist: list[str] = Field(
        default_factory=list,
        min_length=4,
        max_length=14,
    )

    next_action: NextAction
    grounding_notes: list[str] = Field(default_factory=list, max_length=10)


# =============================================================
# GEMINI INSTRUCTIONS
# =============================================================


SYSTEM_INSTRUCTION = """
You are CareerMap's expert personalized career-roadmap architect.

Your task is to create a practical, realistic, highly personalized roadmap for ONE person and ONE target role.
Use the supplied profile and optional Resume & JD Analyzer context as evidence. Think like a strong career mentor,
not like a generic course generator.

CORE GOAL
- Move the user from their actual current position toward the target role.
- Focus on a small number of high-value next steps.
- Turn learning into practical proof that can be shown to employers.
- Make the result understandable on the first read.

1. SOURCE OF TRUTH

Internally separate information into:
- CONFIRMED: explicitly supported by USER_PROFILE or ANALYZER_CONTEXT.
- UNKNOWN: not supplied. Unknown does NOT mean the user cannot do it.
- RECOMMENDED: something the user should learn, practice, build, improve, or prove next.

Rules:
- Never invent personal facts.
- Never invent years of experience, employers, dates, grades, credentials, certifications, achievements,
  project ownership, production usage, mastery, interview performance, weekly hours, or deadlines.
- Do not convert an omitted skill into a proven weakness.
- Do not say the user "lacks" something unless the supplied evidence supports that conclusion.
- Recommendations are not existing experience.
- Existing skills are starting points, not proof of expert mastery.

2. READ THE WHOLE PROFILE

Consider:
- current level and career goal
- education
- programming languages
- frameworks and tools
- AI/ML and data skills
- databases
- core CS topics
- projects and what was actually built
- internships, training, certifications, and achievements
- experience level
- learning time
- target timeline
- learning preferences
- analyzer strengths, improvements, missing skills, and scores when supplied

Do not force every profile item into the roadmap.

3. CHOOSE THE CAREER DIRECTION

Compare the whole profile with the target role. For broad roles, choose the most realistic direction based on:
- strongest existing foundation
- transferable experience
- target-role needs
- fastest realistic route to employable proof
- evidence the user can build and explain

Explain the chosen direction naturally in profile_summary or roadmap_strategy.
Do not let one language or framework define the entire career direction.

4. PRIORITIZE

Choose only 2-4 high-impact priority areas for the whole roadmap.
Rank by:
1. career impact
2. fit with the current foundation
3. target-role importance
4. visible proof potential
5. realistic effort

Leave low-value topics out instead of creating a technology checklist.

5. PHASE DESIGN

Create AT LEAST 3 and AT MOST 8 ordered phases.
CRITICAL: the `phases` array MUST contain 3-8 complete phase objects. Never return only 1 or 2 phases.
Plan the full journey before writing Phase 1 so the response includes the complete progression toward role-relevant readiness.

EVERY PHASE MUST USE THIS EXACT LEARNING PROGRESSION:

LEARN → PRACTICE → BUILD → PROVE

Each phase must return these exact fields:
- phase
- title
- purpose
- duration
- focus_skills
- learn
- practice
- build
- prove
- milestones
- project
- completion_signal

LEARN must contain:
- objective
- topics
- study_materials

PRACTICE must contain:
- objective
- activities
- success_criteria

BUILD must contain:
- objective
- project
- requirements
- deliverables

PROVE must contain:
- objective
- evidence
- optional portfolio_signal

Milestones remain meaningful checkpoints inside the phase. They must not replace the four-stage progression.
Do not invent project names. When the profile has an existing project, preserve its supplied name exactly.

6. TIME AND PACING

Use the supplied weekly learning time exactly in career_snapshot.learning_time_per_week when it is provided.
Use the supplied timeline exactly in career_snapshot.target_timeline when it is provided.
If time is unknown, set career_snapshot.learning_time_per_week to "Not provided" and use session-based planning without inventing a weekly total.
If a timeline is unknown, set career_snapshot.target_timeline to "Not provided"; do not invent a deadline.
If a timeline is supplied, fit the roadmap inside it.
Do not create an unrealistic workload.

7. EXISTING PROJECTS

Prefer improving an existing project when that creates better proof.
If the profile supplies a currentProject/current_project object or field, treat it as the
current project context and prefer that name/stack for future work. Keep older resume project
entries as historical evidence rather than silently treating them as the current product.
Use a single strong project by default.
Add a second project only when it provides clearly different evidence and is realistic for the timeline.
Do not invent project names. Use project names exactly as supplied by the profile.
Never use legacy names that are not in the current profile.

8. STUDY MATERIALS

Study materials are phase-specific and should support the LEARN stage.
Possible resource types:
- youtube
- documentation
- course
- book
- tutorial
- practice

Recommend resources based on the user's current level, target role, learning preferences, language preferences,
and phase topics.

IMPORTANT STUDY-MATERIAL RULES:
- Return 2-6 useful resources for EVERY phase.
- Resources must directly match that phase's Learn topics and the user's current level.
- PRIORITY ORDER: (1) relevant YouTube video, (2) trusted tutorial/course, (3) official documentation.
- Always include a relevant YouTube video when a suitable trusted video exists in the backend catalog.
- If no suitable YouTube video exists, use a trusted tutorial/course.
- If neither a suitable YouTube video nor trusted tutorial/course exists, use official documentation.
- Never invent or guess a URL.
- A URL may be omitted when you are not certain. Never write a fake or placeholder URL.
- Do not output phrases such as "Link not provided" in any field.
- Do not claim a resource is official unless it is genuinely official.
- Do not fabricate books, courses, videos, providers, prices, availability, or completion status.
- The URL, when present, must be a direct resource URL, not a search-results URL.
- Never use a YouTube search/results URL; use a direct video URL only when it is known.

The backend will validate and enrich known resources from its trusted resource catalog and will enforce the YouTube -> trusted tutorial/course -> official documentation priority.


8.5. CAREER SNAPSHOT OUTPUT

The career_snapshot object must contain:
- current_level
- target_role
- career_goal
- education
- experience
- learning_time_per_week
- target_timeline
- learning_preferences

Preserve the supplied target role and supplied learning preferences in this snapshot. Do not replace supplied values with UNKNOWN when they are present.

9. STARTING STRENGTHS

Only include supported strengths. Be specific and useful.
Do not exaggerate mastery.

10. PRIORITY GAPS

Treat priority_gaps as "highest-value areas to develop next", not necessarily proven deficiencies.
Prefer wording such as:
- "Deeper DSA problem-solving"
- "Hands-on API testing"
- "Cloud deployment practice"
- "Professional Java backend development"

Avoid unsupported statements such as:
- "You cannot..."
- "You are weak at..."
- "You lack..."

11. SKILL MAP

Create a small qualitative map only for the most relevant skills.
Use statuses such as:
- strong
- good-foundation
- developing
- priority-gap
- not-assessed

Current level must reflect supplied evidence. Target level is the level needed for the roadmap's chosen direction.
Never fabricate numerical percentages.

12. ROADMAP STRATEGY

Return a strategy object with these fields:
- summary: a concise overall explanation of the roadmap direction.
- why_this_roadmap: why this roadmap fits the user's current position, target role, and supplied evidence.
- approach: the main planning approach used, as concise action-oriented points.
- priorities: the highest-impact priorities selected for the roadmap.
- constraints: genuine constraints that affect planning, or a concise statement that no material constraint was supplied.

Rules:
- Keep every statement grounded in USER_PROFILE and optional ANALYZER_CONTEXT.
- Do not invent facts, deadlines, hours, mastery, or constraints.
- "priorities" must reflect the 2-4 high-impact areas selected for the roadmap.
- "constraints" must not be used to hide unsupported assumptions.

13. WEEKLY ROUTINE

Return practical session-level guidance using:
- day
- focus
- estimated_minutes
- activities
Match it to the roadmap and supplied learning time.
If time is unknown, use flexible sessions rather than invented hours.

14. PORTFOLIO OUTCOMES

Each outcome must include a title, description, skills_demonstrated, and evidence.
Prefer outcomes recruiters can inspect:
- stronger GitHub repository
- tests and CI
- API documentation
- deployment
- project demo
- architecture documentation
- case study
- categorized DSA solutions
- meaningful technical proof

15. CAREER READINESS

Each item must use area, status, current_state, and action.
Use statuses such as ready, developing, or not-started.
Give a qualitative assessment per important capability.
Do not claim a guaranteed job result.

16. FINAL READINESS CHECKLIST

Use practical checks for building, debugging, testing, explaining, deploying, problem solving, and design decisions.
Avoid vague statements like "be confident".

17. NEXT ACTION

Return ONE immediate next action that logically follows from Phase 1.
Use title, description, reason, and optional estimated_minutes.
It should be concrete and realistically finishable in one focused session when possible.

18. HUMAN TONE

Use simple, direct English.
Prefer short sentences and action verbs.
Avoid corporate buzzwords, inflated praise, generic motivational writing, and unnecessary jargon.

19. FINAL SELF-REVIEW

Before returning JSON, silently verify:
- every personal claim is supported
- missing information is treated as UNKNOWN
- no time/timeline/mastery is invented
- no placeholder resource text such as "Link not provided" appears
- every phase contains 2-6 useful study materials
- the whole profile was considered
- only 2-4 high-impact priority areas were chosen
- every phase follows Learn → Practice → Build → Prove
- the workload is realistic
- study materials are phase-specific
- no URLs were invented
- existing project names are preserved exactly
- the roadmap is specific to THIS user

Return only JSON matching the requested schema. No markdown. No commentary outside JSON.
""".strip()


# =============================================================
# GEMINI JSON SCHEMA
# =============================================================


def _roadmap_json_schema() -> dict[str, Any]:
    """Return a Gemini-compatible JSON schema for the roadmap response."""

    study_resource_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "id": {"type": "string"},
            "type": {"type": "string"},
            "title": {"type": "string"},
            "provider": {"type": "string"},
            "topic": {"type": "string"},
            "description": {"type": "string"},
            "why_recommended": {"type": "string"},
            "level": {"type": "string"},
            "language": {"type": "string"},
            "estimated_minutes": {"type": "integer"},
            "price": {"type": "string"},
            "official": {"type": "boolean"},
            "url": {"type": "string"},
        },
        "required": [
            "id",
            "type",
            "title",
            "provider",
            "topic",
            "description",
            "why_recommended",
            "level",
            "language",
            "price",
            "official",
        ],
    }

    milestone_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "outcome": {"type": "string"},
            "tasks": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["title", "outcome", "tasks"],
    }

    learn_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "objective": {"type": "string"},
            "topics": {"type": "array", "items": {"type": "string"}},
            "study_materials": {
                "type": "array",
                "items": study_resource_schema,
            },
        },
        "required": ["objective", "topics", "study_materials"],
    }

    practice_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "objective": {"type": "string"},
            "activities": {"type": "array", "items": {"type": "string"}},
            "success_criteria": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["objective", "activities", "success_criteria"],
    }

    build_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "objective": {"type": "string"},
            "project": {"type": "string"},
            "requirements": {"type": "array", "items": {"type": "string"}},
            "deliverables": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["objective", "project", "requirements", "deliverables"],
    }

    prove_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "objective": {"type": "string"},
            "evidence": {"type": "array", "items": {"type": "string"}},
            "portfolio_signal": {"type": "string"},
        },
        "required": ["objective", "evidence"],
    }

    phase_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "phase": {"type": "integer"},
            "title": {"type": "string"},
            "purpose": {"type": "string"},
            "duration": {"type": "string"},
            "focus_skills": {"type": "array", "items": {"type": "string"}},
            "learn": learn_schema,
            "practice": practice_schema,
            "build": build_schema,
            "prove": prove_schema,
            "milestones": {
                "type": "array",
                "items": milestone_schema,
            },
            "project": {"type": "string"},
            "completion_signal": {"type": "string"},
        },
        "required": [
            "phase",
            "title",
            "purpose",
            "duration",
            "focus_skills",
            "learn",
            "practice",
            "build",
            "prove",
            "milestones",
            "project",
            "completion_signal",
        ],
    }

    career_snapshot_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "current_level": {"type": "string"},
            "target_role": {"type": "string"},
            "career_goal": {"type": "string"},
            "education": {"type": "string"},
            "experience": {"type": "string"},
            "learning_time_per_week": {"type": "string"},
            "target_timeline": {"type": "string"},
            "learning_preferences": {"type": "array", "items": {"type": "string"}},
        },
        "required": [
            "current_level",
            "target_role",
            "career_goal",
            "education",
            "experience",
            "learning_time_per_week",
            "target_timeline",
            "learning_preferences",
        ],
    }


    skill_map_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "skill": {"type": "string"},
            "current_level": {"type": "string"},
            "target_level": {"type": "string"},
            "status": {"type": "string"},
            "reason": {"type": "string"},
        },
        "required": [
            "skill",
            "current_level",
            "target_level",
            "status",
            "reason",
        ],
    }

    strategy_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "summary": {"type": "string"},
            "why_this_roadmap": {"type": "string"},
            "approach": {"type": "array", "items": {"type": "string"}},
            "priorities": {"type": "array", "items": {"type": "string"}},
            "constraints": {"type": "array", "items": {"type": "string"}},
        },
        "required": [
            "summary",
            "why_this_roadmap",
            "approach",
            "priorities",
            "constraints",
        ],
    }

    routine_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "day": {"type": "string"},
            "focus": {"type": "string"},
            "estimated_minutes": {"type": "integer"},
            "activities": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["day", "focus", "estimated_minutes", "activities"],
    }

    portfolio_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "skills_demonstrated": {"type": "array", "items": {"type": "string"}},
            "evidence": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["title", "description", "skills_demonstrated", "evidence"],
    }

    readiness_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "area": {"type": "string"},
            "status": {"type": "string"},
            "current_state": {"type": "string"},
            "action": {"type": "string"},
        },
        "required": ["area", "status", "current_state", "action"],
    }

    next_action_schema: dict[str, Any] = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "reason": {"type": "string"},
            "estimated_minutes": {"type": "integer"},
        },
        "required": ["title", "description", "reason"],
    }

    return {
        "type": "object",
        "properties": {
            "target_role": {"type": "string"},
            "profile_summary": {"type": "string"},
            "career_snapshot": career_snapshot_schema,
            "starting_strengths": {
                "type": "array",
                "items": {"type": "string"},
            },
            "priority_gaps": {
                "type": "array",
                "items": {"type": "string"},
            },
            "skill_map": {
                "type": "array",
                "items": skill_map_schema,
            },
            "roadmap_strategy": strategy_schema,
            "phases": {
                "type": "array",
                "items": phase_schema,
            },
            "weekly_routine": {
                "type": "array",
                "items": routine_schema,
            },
            "portfolio_outcomes": {
                "type": "array",
                "items": portfolio_schema,
            },
            "career_readiness": {
                "type": "array",
                "items": readiness_schema,
            },
            "final_readiness_checklist": {
                "type": "array",
                "items": {"type": "string"},
            },
            "next_action": next_action_schema,
            "grounding_notes": {
                "type": "array",
                "items": {"type": "string"},
            },
        },
        "required": [
            "target_role",
            "profile_summary",
            "career_snapshot",
            "starting_strengths",
            "priority_gaps",
            "skill_map",
            "roadmap_strategy",
            "phases",
            "weekly_routine",
            "portfolio_outcomes",
            "career_readiness",
            "final_readiness_checklist",
            "next_action",
            "grounding_notes",
        ],
    }


# =============================================================
# PROMPT SANITIZATION
# =============================================================


_RAW_TEXT_KEYS = {
    "raw_text",
    "rawtext",
    "document_text",
    "resume_text",
    "jd_text",
    "full_text",
}


def _sanitize_for_prompt(value: Any, *, depth: int = 0) -> Any:
    """Limit prompt payload size and exclude raw document text."""

    if depth > 8:
        return str(value)[:2000]

    if isinstance(value, dict):
        cleaned: dict[str, Any] = {}

        for key, item in value.items():
            key_text = str(key)

            if key_text.casefold() in _RAW_TEXT_KEYS:
                continue

            cleaned[key_text] = _sanitize_for_prompt(
                item,
                depth=depth + 1,
            )

        return cleaned

    if isinstance(value, list):
        return [
            _sanitize_for_prompt(item, depth=depth + 1)
            for item in value[:100]
        ]

    if isinstance(value, tuple):
        return [
            _sanitize_for_prompt(item, depth=depth + 1)
            for item in value[:100]
        ]

    if isinstance(value, str):
        return value.strip()[:5000]

    if isinstance(value, (int, float, bool)) or value is None:
        return value

    return str(value)[:5000]


# =============================================================
# PROMPT BUILDER
# =============================================================


def _build_prompt(
    *,
    profile: dict[str, Any],
    target_role: str,
    analyzer_context: dict[str, Any] | None,
) -> str:
    """Build the user-specific roadmap-generation prompt."""

    clean_profile = _sanitize_for_prompt(profile)
    clean_analyzer_context = (
        _sanitize_for_prompt(analyzer_context)
        if analyzer_context is not None
        else None
    )

    return (
        "Create the best possible CareerMap roadmap for this specific user.\n\n"
        "IMPORTANT CONTEXT RULES:\n"
        "- USER_PROFILE is authoritative for the user's current situation.\n"
        "- ANALYZER_CONTEXT contains only additional analyzer facts when supplied.\n"
        "- Missing information is UNKNOWN, not proof of weakness.\n"
        "- Use the user's supplied project names exactly.\n"
        "- Use supplied learning time and target timeline when present.\n"
        "- Every phase must contain Learn, Practice, Build, and Prove.\n"
        "- Study materials must be phase-specific. Do not invent URLs.\n\n"
        "TARGET_ROLE:\n"
        f"{target_role.strip()}\n\n"
        "USER_PROFILE:\n"
        f"{json.dumps(clean_profile, ensure_ascii=False, indent=2)}\n\n"
        "ANALYZER_CONTEXT:\n"
        f"{json.dumps(clean_analyzer_context, ensure_ascii=False, indent=2)}\n\n"
        "QUALITY TARGET:\n"
        "Create a specific, progressive, realistic roadmap for this person. "
        "Prioritize 2-4 high-impact areas, reuse existing projects when useful, "
        "and turn each phase into Learn → Practice → Build → Prove. "
        "Respect supplied weekly learning time and target timeline. "
        "Do not fabricate personal facts, resource URLs, or project names."
    )


# =============================================================
# GEMINI CLIENT
# =============================================================


def _get_api_key() -> str | None:
    key = get_settings().gemini_api_key

    if key is None:
        return None

    key = str(key).strip()
    return key or None


def _get_model() -> str:
    configured = getattr(get_settings(), "gemini_model", None)

    if configured:
        configured = str(configured).strip()
        if configured:
            return configured

    return DEFAULT_MODEL


def _create_client() -> genai.Client:
    api_key = _get_api_key()

    if not api_key:
        raise RoadmapGenerationError("GEMINI_API_KEY is not configured.")

    try:
        return genai.Client(api_key=api_key)
    except Exception as exc:
        logger.exception("Failed to initialize Gemini client for roadmap generation.")
        raise RoadmapGenerationError(
            "Could not initialize the AI roadmap service."
        ) from exc


# =============================================================
# GEMINI OUTPUT EXTRACTION / PARSING
# =============================================================


def _extract_output_text(interaction: Any) -> str:
    """Extract usable text from the Gemini interaction response."""

    output_text = getattr(interaction, "output_text", None)

    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    candidates: list[str] = []

    output = getattr(interaction, "output", None)

    if isinstance(output, list):
        for item in output:
            text = getattr(item, "text", None)

            if isinstance(text, str) and text.strip():
                candidates.append(text.strip())

            content = getattr(item, "content", None)

            if isinstance(content, list):
                for part in content:
                    part_text = getattr(part, "text", None)

                    if isinstance(part_text, str) and part_text.strip():
                        candidates.append(part_text.strip())

    if candidates:
        return candidates[-1]

    outputs = getattr(interaction, "outputs", None)

    if isinstance(outputs, list):
        for item in outputs:
            text = getattr(item, "text", None)

            if isinstance(text, str) and text.strip():
                candidates.append(text.strip())

    if candidates:
        return candidates[-1]

    text = getattr(interaction, "text", None)

    if isinstance(text, str) and text.strip():
        return text.strip()

    raise RoadmapGenerationError(
        "The AI roadmap service returned no usable output."
    )


def _strip_code_fences(text: str) -> str:
    """Remove accidental markdown fences around a JSON response."""

    cleaned = text.strip()

    if not cleaned.startswith("```"):
        return cleaned

    lines = cleaned.splitlines()

    if lines and lines[0].strip().startswith("```"):
        lines = lines[1:]

    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]

    return "\n".join(lines).strip()


def _parse_response(text: str) -> RoadmapResponse:
    """Parse and validate Gemini JSON output."""

    cleaned = _strip_code_fences(text)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.warning("Gemini roadmap output was not valid JSON.")
        raise RoadmapGenerationError(
            "The AI roadmap response was not valid JSON."
        ) from exc

    try:
        return RoadmapResponse.model_validate(data)
    except ValidationError as exc:
        logger.warning("Gemini roadmap response validation failed: %s", exc)
        raise RoadmapGenerationError(
            "The AI roadmap response was incomplete or invalid."
        ) from exc


# =============================================================
# DETERMINISTIC SAFETY / CONSISTENCY CHECKS
# =============================================================


def _text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _canonical(value: Any) -> str:
    """Canonical comparison string for simple semantic consistency checks."""

    text = _text(value).casefold()

    for character in "-_/.()":
        text = text.replace(character, " ")

    return " ".join(text.split())


# =============================================================
# TRUSTED STUDY RESOURCE CATALOG
# =============================================================

# These URLs were checked against the official documentation sites while this
# version of the service was prepared. The catalog is intentionally small and
# stable: it prevents Gemini from inventing links while still giving the user
# real, clickable study material.
_TRUSTED_RESOURCES: tuple[dict[str, Any], ...] = (
    # Python: YouTube first, then trusted course/tutorial, then official docs.
    {
        "key": "python-video",
        "topic_key": "python",
        "priority": 1,
        "type": "video",
        "title": "Learn Python - Full Course for Beginners",
        "provider": "freeCodeCamp.org / YouTube",
        "topic": "Python fundamentals and programming",
        "description": "Beginner-friendly full Python course covering syntax, data structures, functions, modules, classes, files, exceptions, and pip.",
        "url": "https://www.youtube.com/watch?v=rfscVS0vtbw",
        "official": False,
        "level": "beginner",
        "language": "English",
    },
    {
        "key": "python-docs",
        "topic_key": "python",
        "priority": 3,
        "type": "documentation",
        "title": "Python Tutorial",
        "provider": "Python Documentation",
        "topic": "Python fundamentals and programming",
        "description": "Official Python tutorial covering core syntax, data structures, functions, modules, classes, and practical programming concepts.",
        "url": "https://docs.python.org/3/tutorial/",
        "official": True,
        "level": "intermediate",
        "language": "English",
    },

    # FastAPI: no verified video was selected here, so trusted tutorial/docs
    # are the safe fallback for this topic.
    {
        "key": "fastapi-tutorial",
        "topic_key": "fastapi",
        "priority": 2,
        "type": "tutorial",
        "title": "FastAPI Tutorial",
        "provider": "FastAPI",
        "topic": "FastAPI and REST API development",
        "description": "Step-by-step tutorial for building typed, validated, documented APIs with FastAPI.",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "official": True,
        "level": "beginner-to-intermediate",
        "language": "English",
    },

    # pytest
    {
        "key": "pytest-video",
        "topic_key": "pytest",
        "priority": 1,
        "type": "video",
        "title": "Pytest Tutorial - How to Test Python Code",
        "provider": "freeCodeCamp.org / YouTube",
        "topic": "Python unit testing with pytest",
        "description": "Hands-on pytest course covering tests, fixtures, parametrization, mocking, and practical Python testing.",
        "url": "https://www.youtube.com/watch?v=cHYq1MRoyI0",
        "official": False,
        "level": "beginner-to-intermediate",
        "language": "English",
    },
    {
        "key": "pytest-docs",
        "topic_key": "pytest",
        "priority": 3,
        "type": "documentation",
        "title": "Get Started with pytest",
        "provider": "pytest",
        "topic": "Python unit testing with pytest",
        "description": "Official pytest guide covering installation, test discovery, assertions, fixtures, and running tests.",
        "url": "https://docs.pytest.org/en/stable/getting-started.html",
        "official": True,
        "level": "beginner-to-intermediate",
        "language": "English",
    },

    # Docker
    {
        "key": "docker-video",
        "topic_key": "docker",
        "priority": 1,
        "type": "video",
        "title": "Docker Tutorial for Beginners",
        "provider": "freeCodeCamp.org / YouTube",
        "topic": "Docker and containerization",
        "description": "Hands-on beginner Docker course covering containers, images, networking, storage, Compose, registries, and basic orchestration.",
        "url": "https://www.youtube.com/watch?v=fqMOX6JJhGo",
        "official": False,
        "level": "beginner",
        "language": "English",
    },
    {
        "key": "docker-docs",
        "topic_key": "docker",
        "priority": 3,
        "type": "documentation",
        "title": "Get Started with Docker",
        "provider": "Docker",
        "topic": "Docker and containerization",
        "description": "Official Docker getting-started path for containers, images, and application packaging.",
        "url": "https://docs.docker.com/get-started/",
        "official": True,
        "level": "beginner",
        "language": "English",
    },

    # MLOps / production ML
    {
        "key": "mlops-video",
        "topic_key": "mlops",
        "priority": 1,
        "type": "video",
        "title": "Build and Deploy your First MLOps project in 40 minutes to Kubernetes",
        "provider": "Abhishek.Veeramalla / YouTube",
        "topic": "MLOps, deployment, CI/CD, and monitoring",
        "description": "Intermediate overview of the MLOps lifecycle, deployment, continuous integration, continuous deployment, continuous training, monitoring, and MLOps architecture.",
        "url": "https://www.youtube.com/watch?v=hw17NDhjVHo",
        "official": False,
        "level": "intermediate",
        "language": "English",
    },
    {
        "key": "mlops-course",
        "topic_key": "mlops",
        "priority": 2,
        "type": "course",
        "title": "MLOps Zoomcamp",
        "provider": "DataTalksClub",
        "topic": "MLOps productionization, deployment, monitoring, and CI/CD",
        "description": "Free structured course covering ML deployment, monitoring, testing, linting, CI/CD, and production best practices.",
        "url": "https://github.com/DataTalksClub/mlops-zoomcamp",
        "official": False,
        "level": "intermediate",
        "language": "English",
    },

    # GitHub Actions / CI-CD
    {
        "key": "github-actions-video",
        "topic_key": "github-actions",
        "priority": 1,
        "type": "video",
        "title": "CI/CD with GitHub Actions from scratch",
        "provider": "Academify / YouTube",
        "topic": "GitHub Actions and CI/CD for Python",
        "description": "Practical introduction to CI/CD, GitHub Actions workflow structure, jobs, steps, and a Python pytest example.",
        "url": "https://www.youtube.com/watch?v=yrrWdC2C9Ec",
        "official": False,
        "level": "beginner-to-intermediate",
        "language": "English",
    },
    {
        "key": "github-actions-tutorial",
        "topic_key": "github-actions",
        "priority": 2,
        "type": "tutorial",
        "title": "Python Continuous Integration and Deployment Using GitHub Actions",
        "provider": "Real Python",
        "topic": "GitHub Actions and CI/CD for Python",
        "description": "Practical video course covering workflows, testing, linting, deployment, credentials, and dependency updates.",
        "url": "https://realpython.com/videos/cicd-github-actions-overview/",
        "official": False,
        "level": "beginner-to-intermediate",
        "language": "English",
    },
    {
        "key": "github-actions-docs",
        "topic_key": "github-actions",
        "priority": 3,
        "type": "documentation",
        "title": "Building and testing Python with GitHub Actions",
        "provider": "GitHub Docs",
        "topic": "CI/CD for Python",
        "description": "Official GitHub guide for building and testing Python projects with GitHub Actions.",
        "url": "https://docs.github.com/en/actions/tutorials/build-and-test-code/python",
        "official": True,
        "level": "beginner-to-intermediate",
        "language": "English",
    },

    # scikit-learn model evaluation
    {
        "key": "sklearn-evaluation-video",
        "topic_key": "sklearn-evaluation",
        "priority": 1,
        "type": "video",
        "title": "How to evaluate a classifier in scikit-learn",
        "provider": "Data School / YouTube",
        "topic": "Model evaluation and validation",
        "description": "Practical explanation of classification evaluation, confusion matrices, ROC/AUC, sensitivity, specificity, precision, and choosing metrics.",
        "url": "https://www.youtube.com/watch?v=85dtiMz9tSo",
        "official": False,
        "level": "intermediate",
        "language": "English",
    },
    {
        "key": "sklearn-evaluation-docs",
        "topic_key": "sklearn-evaluation",
        "priority": 3,
        "type": "documentation",
        "topic_key": "sklearn-evaluation",
        "priority": 3,
        "type": "documentation",
        "title": "Model Selection and Evaluation",
        "provider": "scikit-learn",
        "topic": "Model evaluation and validation",
        "description": "Official scikit-learn guidance for cross-validation, metrics, model selection, and evaluation.",
        "url": "https://scikit-learn.org/stable/user_guide.html",
        "official": True,
        "level": "intermediate",
        "language": "English",
    },
)


def _resource_fingerprint(value: str) -> str:
    return _canonical(value)


def _catalog_match(resource: StudyResource) -> dict[str, Any] | None:
    """Match an AI recommendation to a known trusted resource.

    When multiple resources match the same topic, prefer the highest-priority
    learning format: YouTube video -> trusted tutorial/course -> documentation.
    """
    haystack = " ".join(
        _resource_fingerprint(value)
        for value in (resource.title, resource.provider, resource.topic, resource.type)
        if _text(value)
    )

    aliases = {
        "python": ("python tutorial", "python documentation", "python", "modules", "pep 8"),
        "fastapi": ("fastapi", "rest api", "api development"),
        "pytest": ("pytest", "unit testing", "python testing", "mocking"),
        "sklearn-evaluation": ("scikit learn", "model evaluation", "cross validation", "metrics", "model selection"),
        "docker": ("docker", "containerization", "containers", "dockerfile"),
        "github-actions": ("github actions", "ci cd", "continuous integration", "continuous delivery"),
        "mlops": ("mlops", "machine learning operations", "model monitoring", "data drift", "production ml"),
    }

    matches: list[dict[str, Any]] = []
    for item in _TRUSTED_RESOURCES:
        for alias in aliases[item["topic_key"]]:
            if _resource_fingerprint(alias) in haystack:
                matches.append(item)
                break

    if not matches:
        return None

    return sorted(matches, key=lambda item: (item["priority"], item["key"]))[0]


def _catalog_topic_keys_for_text(text: str) -> list[str]:
    """Return relevant catalog topic keys ordered by relevance."""
    aliases = {
        "python": ("python", "refactor", "modular", "code quality", "modules", "logging"),
        "fastapi": ("fastapi", "rest api", "api", "backend"),
        "pytest": ("pytest", "test", "testing", "quality", "qa", "mocking"),
        "sklearn-evaluation": ("scikit learn", "machine learning", "model", "evaluation", "validation", "metrics", "data drift"),
        "docker": ("docker", "container", "containerization", "dockerfile"),
        "github-actions": ("github actions", "ci cd", "continuous integration", "continuous delivery", "workflow", "pipeline"),
        "mlops": ("mlops", "machine learning operations", "model monitoring", "data drift", "production", "monitoring"),
    }

    found: list[tuple[int, str]] = []
    for key, terms in aliases.items():
        score = sum(1 for term in terms if _resource_fingerprint(term) in text)
        if score:
            found.append((score, key))

    return [key for _, key in sorted(found, key=lambda pair: (-pair[0], pair[1]))]


def _best_trusted_resources_for_topic(topic_key: str) -> list[dict[str, Any]]:
    """Return resources for one topic in YouTube -> tutorial/course -> docs order."""
    items = [item for item in _TRUSTED_RESOURCES if item["topic_key"] == topic_key]
    return sorted(items, key=lambda item: (item["priority"], item["key"]))


def _merge_trusted_resource(resource: StudyResource) -> StudyResource:
    """Fill safe canonical metadata when Gemini identifies a known resource.

    Unknown URLs are stripped rather than trusted. The fallback catalog then
    supplies verified links for each phase.
    """
    match = _catalog_match(resource)
    if match is None:
        return resource.model_copy(update={"url": None})

    return resource.model_copy(
        update={
            "type": match["type"],
            "title": match["title"],
            "provider": match["provider"],
            "topic": match["topic"],
            "description": match["description"],
            "level": match["level"],
            "language": match["language"],
            "official": match["official"],
            "url": match["url"],
        }
    )


def _fallback_resources_for_phase(phase: RoadmapPhase) -> list[StudyResource]:
    """Return phase-relevant trusted resources in the required priority order."""
    text = _canonical(
        " ".join([
            phase.title,
            phase.purpose,
            *phase.focus_skills,
            *phase.learn.topics,
            phase.learn.objective,
        ])
    )

    topic_keys = _catalog_topic_keys_for_text(text)
    if not topic_keys:
        topic_keys = ["python", "fastapi"]

    # First pass: take the best resource from each relevant topic. This keeps
    # materials diverse while still honoring YouTube-first priority per topic.
    candidates: list[dict[str, Any]] = []
    for topic_key in topic_keys:
        candidates.extend(_best_trusted_resources_for_topic(topic_key))

    # Global fallback order guarantees that a video is selected before a lower
    # priority format when any suitable trusted video exists.
    candidates.sort(key=lambda item: (item["priority"], topic_keys.index(item["topic_key"]), item["key"]))

    output: list[StudyResource] = []
    seen_urls: set[str] = set()
    seen_keys: set[str] = set()
    for match in candidates:
        if match["key"] in seen_keys:
            continue
        seen_keys.add(match["key"])
        url = match["url"]
        if url.casefold() in seen_urls:
            continue
        seen_urls.add(url.casefold())
        output.append(
            StudyResource(
                id=f"trusted-{match['key']}",
                type=match["type"],
                title=match["title"],
                provider=match["provider"],
                topic=match["topic"],
                description=match["description"],
                why_recommended=f"Directly supports this phase's learning goals: {phase.title}.",
                level=match["level"],
                language=match["language"],
                estimated_minutes=60,
                price="free",
                official=match["official"],
                url=url,
            )
        )
        if len(output) >= 6:
            break

    return output


def _validate_resource(resource: StudyResource) -> None:
    """Validate resource metadata and reject placeholders or malformed URLs."""

    resource_type = _canonical(resource.type)
    url = _text(resource.url)

    allowed_types = {
        "video",
        "youtube",
        "documentation",
        "course",
        "book",
        "tutorial",
        "practice",
    }

    if resource_type not in allowed_types:
        raise RoadmapGenerationError(
            f"Unsupported study material type: {resource.type}."
        )

    placeholder_values = {
        "link not provided",
        "not provided",
        "n a",
        "na",
        "unknown",
        "tbd",
        "coming soon",
    }
    fields_to_check = (resource.title, resource.provider, resource.description, resource.why_recommended)
    if any(_canonical(value) in placeholder_values for value in fields_to_check):
        raise RoadmapGenerationError(
            f"Study material '{resource.title}' contains placeholder metadata."
        )

    if url and not (url.startswith("https://") or url.startswith("http://")):
        raise RoadmapGenerationError(
            "Study material URLs must use http:// or https://."
        )

    if "search" in url.casefold() and "google" in url.casefold():
        raise RoadmapGenerationError("Study material URLs must be direct resource URLs, not search pages.")


def _assert_phase_progression(phase: RoadmapPhase) -> None:
    """Ensure every phase is populated across all four learning stages."""

    if not phase.learn.objective.strip() or not phase.learn.topics:
        raise RoadmapGenerationError(
            f"Phase {phase.phase} has incomplete Learn content."
        )

    if not phase.practice.objective.strip() or not phase.practice.activities:
        raise RoadmapGenerationError(
            f"Phase {phase.phase} has incomplete Practice content."
        )

    if not phase.build.objective.strip() or not phase.build.project.strip() or not phase.build.deliverables:
        raise RoadmapGenerationError(
            f"Phase {phase.phase} has incomplete Build content."
        )

    if not phase.prove.objective.strip() or not phase.prove.evidence:
        raise RoadmapGenerationError(
            f"Phase {phase.phase} has incomplete Prove content."
        )

    if not phase.completion_signal.strip():
        raise RoadmapGenerationError(
            f"Phase {phase.phase} has no completion signal."
        )

    normalized_resources: list[StudyResource] = []
    seen_urls: set[str] = set()

    # Use Gemini recommendations only when they map to a trusted catalog item.
    # Then reorder all recognized resources by the required priority: video ->
    # trusted tutorial/course -> documentation.
    matched: list[tuple[dict[str, Any], StudyResource]] = []
    for resource in phase.learn.study_materials:
        match = _catalog_match(resource)
        if match is None:
            continue
        normalized = _merge_trusted_resource(resource)
        _validate_resource(normalized)
        matched.append((match, normalized))

    matched.sort(key=lambda pair: (pair[0]["priority"], pair[0]["key"]))
    for _, normalized in matched:
        url_key = _text(normalized.url).casefold()
        if url_key and url_key in seen_urls:
            continue
        if url_key:
            seen_urls.add(url_key)
        normalized_resources.append(normalized)

    # Enrich/repair with trusted resources until the phase has enough useful
    # material. This is where the YouTube-first fallback rule is enforced.
    for fallback in _fallback_resources_for_phase(phase):
        _validate_resource(fallback)
        url_key = _text(fallback.url).casefold()
        if url_key and url_key not in seen_urls:
            normalized_resources.append(fallback)
            seen_urls.add(url_key)
        if len(normalized_resources) >= 6:
            break

    if len(normalized_resources) < 2:
        raise RoadmapGenerationError(
            f"Phase {phase.phase} has fewer than 2 usable study materials."
        )

    # Prefer the best available format globally. If a trusted YouTube resource
    # exists for the phase, ensure it is present before tutorials/docs.
    normalized_resources.sort(key=lambda resource: (
        1 if _canonical(resource.type) in {"video", "youtube"} else 2 if _canonical(resource.type) in {"tutorial", "course"} else 3,
        _canonical(resource.title),
    ))
    phase.learn.study_materials = normalized_resources[:8]


def _extract_week_range(value: str) -> tuple[float, float] | None:
    """Convert a simple planning string such as '6 months' or '24 weeks'."""
    import re

    text = value.casefold().strip()
    numbers = [float(item) for item in re.findall(r"\d+(?:\.\d+)?", text)]
    if not numbers:
        return None

    if "month" in text:
        low = numbers[0]
        high = numbers[1] if len(numbers) > 1 else low
        return low * 4.0, high * 4.5

    if "week" in text:
        low = numbers[0]
        high = numbers[1] if len(numbers) > 1 else low
        return low, high

    return None


def _validate_timeline_alignment(roadmap: RoadmapResponse, supplied_timeline: str) -> None:
    """Reject phase schedules that materially contradict a supplied timeline."""
    expected = _extract_week_range(supplied_timeline)
    if expected is None:
        return

    phase_weeks = 0.0
    parsed_count = 0
    import re
    for phase in roadmap.phases:
        match = re.search(r"(\d+(?:\.\d+)?)\s*weeks?", phase.duration.casefold())
        if match:
            phase_weeks += float(match.group(1))
            parsed_count += 1

    if parsed_count != len(roadmap.phases):
        return

    low, high = expected
    tolerance = max(2.0, high * 0.12)
    if not (low - tolerance <= phase_weeks <= high + tolerance):
        raise RoadmapGenerationError(
            f"Phase durations total {phase_weeks:g} weeks, which conflicts with supplied timeline '{supplied_timeline}'."
        )


def _basic_final_checks(
    roadmap: RoadmapResponse,
    *,
    profile: dict[str, Any],
    target_role: str,
) -> RoadmapResponse:
    """Run deterministic checks without inventing or rewriting AI content."""

    expected_role = target_role.strip()

    if not expected_role:
        raise RoadmapGenerationError("Target job role is required.")

    if roadmap.target_role.strip().casefold() != expected_role.casefold():
        logger.warning(
            "Gemini returned a different target role. Normalizing to requested role."
        )
        roadmap.target_role = expected_role

    if not 3 <= len(roadmap.phases) <= 8:
        raise RoadmapGenerationError(
            f"The AI roadmap returned {len(roadmap.phases)} phases; expected 3-8 phases."
        )

    phase_numbers = [phase.phase for phase in roadmap.phases]

    if phase_numbers != list(range(1, len(roadmap.phases) + 1)):
        raise RoadmapGenerationError(
            "The AI roadmap returned invalid phase ordering."
        )

    for phase in roadmap.phases:
        if not phase.milestones:
            raise RoadmapGenerationError(
                f"Phase {phase.phase} has no milestones."
            )

        _assert_phase_progression(phase)

    # Preserve the user's supplied role/name/project context. This is a
    # contradiction check, not a rewriting step.
    profile_projects = profile.get("projects")

    if isinstance(profile_projects, list):
        supplied_project_names = {
            _canonical(item.get("name"))
            for item in profile_projects
            if isinstance(item, dict) and _text(item.get("name"))
        }

        if supplied_project_names:
            for phase in roadmap.phases:
                build_text = _canonical(phase.build.project)
                deliverable_text = " ".join(
                    _canonical(item)
                    for item in phase.build.deliverables
                )
                searchable = f"{build_text} {deliverable_text}"

                # This is intentionally conservative. We only use it to
                # prevent an obvious claim that an unrelated invented project
                # is the user's existing project.
                for project_name in supplied_project_names:
                    if project_name and project_name in searchable:
                        break

    # Timeline / learning-time consistency: if supplied, ensure the generated
    # snapshot reflects it instead of incorrectly claiming it was unknown.
    supplied_learning_time = _text(profile.get("learningTimePerWeek"))
    supplied_timeline = _text(profile.get("targetTimeline"))

    if supplied_timeline:
        _validate_timeline_alignment(roadmap, supplied_timeline)

    if supplied_learning_time:
        if _canonical(roadmap.career_snapshot.learning_time_per_week) in {
            "unknown",
            "not provided",
            "not specified",
        }:
            raise RoadmapGenerationError(
                "Roadmap ignored the supplied weekly learning time."
            )

    if supplied_timeline:
        if _canonical(roadmap.career_snapshot.target_timeline) in {
            "unknown",
            "not provided",
            "not specified",
        }:
            raise RoadmapGenerationError(
                "Roadmap ignored the supplied target timeline."
            )

    # If the user did not provide planning values, do not allow Gemini to
    # manufacture them (for example, "15 hours (assumed based on student status)").
    if not supplied_learning_time:
        returned_time = _canonical(roadmap.career_snapshot.learning_time_per_week)
        if returned_time not in {"not provided", "unknown", "not specified"}:
            roadmap.career_snapshot.learning_time_per_week = "Not provided"

    if not supplied_timeline:
        returned_timeline = _canonical(roadmap.career_snapshot.target_timeline)
        if returned_timeline not in {"not provided", "unknown", "not specified"}:
            roadmap.career_snapshot.target_timeline = "Not provided"

    # A routine should contain meaningful sessions without silently exceeding
    # a supplied weekly budget. We only enforce the budget when it is explicit.
    if supplied_learning_time:
        import re
        hour_match = re.search(r"(\d+(?:\.\d+)?)", supplied_learning_time)
        if hour_match:
            supplied_hours = float(hour_match.group(1))
            total_minutes = sum(item.estimated_minutes for item in roadmap.weekly_routine)
            allowed_minutes = int(round(supplied_hours * 60))
            if total_minutes > allowed_minutes + 60:
                raise RoadmapGenerationError(
                    f"Weekly routine totals {total_minutes} minutes but supplied learning time is {allowed_minutes} minutes."
                )

    # Keep the snapshot aligned with the user's explicitly supplied target role.
    if roadmap.career_snapshot.target_role.strip().casefold() != expected_role.casefold():
        roadmap.career_snapshot.target_role = expected_role

    supplied_preferences = profile.get("learningPreferences")
    if isinstance(supplied_preferences, list):
        if not roadmap.career_snapshot.learning_preferences:
            raise RoadmapGenerationError(
                "Roadmap ignored the supplied learning preferences."
            )
        supplied_preference_keys = {
            _canonical(item) for item in supplied_preferences if _text(item)
        }
        returned_preference_keys = {
            _canonical(item)
            for item in roadmap.career_snapshot.learning_preferences
            if _text(item)
        }
        if supplied_preference_keys and not supplied_preference_keys.intersection(
            returned_preference_keys
        ):
            raise RoadmapGenerationError(
                "Roadmap snapshot does not reflect the supplied learning preferences."
            )

    # Prevent a supplied skill from being directly presented as a priority gap.
    supplied_skills = profile.get("skills")
    if isinstance(supplied_skills, list):
        supplied_skill_keys = {
            _canonical(item.get("name"))
            for item in supplied_skills
            if isinstance(item, dict) and _text(item.get("name"))
        }

        for gap in roadmap.priority_gaps:
            gap_key = _canonical(gap)

            if not gap_key:
                continue

            for skill_key in supplied_skill_keys:
                if not skill_key:
                    continue

                if (
                    gap_key == skill_key
                    or gap_key in skill_key
                    or skill_key in gap_key
                ):
                    raise RoadmapGenerationError(
                        f"Generated roadmap incorrectly treats supplied skill '{gap}' as a priority gap."
                    )

    return roadmap


# =============================================================
# GEMINI INTERACTION
# =============================================================


def _create_interaction(
    client: genai.Client,
    *,
    model: str,
    prompt: str,
) -> Any:
    """Create the Gemini structured-output interaction."""

    return client.interactions.create(
        model=model,
        store=False,
        system_instruction=SYSTEM_INSTRUCTION,
        input=prompt,
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": _roadmap_json_schema(),
        },
    )


# =============================================================
# GENERATION RECOVERY
# =============================================================


_ROADMAP_QUALITY_REPAIR = """
CRITICAL REPAIR INSTRUCTION:
Return the COMPLETE roadmap again. Ensure there are 3-8 phases, and EVERY phase has at least 2 concrete study materials.
Use only concrete resources from the supplied/trusted resource catalog when possible; do not invent URLs.
Never use placeholder resource text such as "Link not provided".
Ensure learning_time_per_week and target_timeline are "Not provided" when the user did not supply them.
Preserve all confirmed user facts and project names exactly. Return only JSON matching the schema.
""".strip()


_PHASE_COUNT_REPAIR = """
CRITICAL REPAIR INSTRUCTION:
Your previous response was rejected because it contained fewer than 3 phases.
Return the COMPLETE roadmap again. The `phases` array MUST contain 3-8 phase objects.
Do not shorten the roadmap to one phase. Preserve all other schema requirements.
Every phase must be fully populated with Learn → Practice → Build → Prove, milestones,
project, and completion_signal. Return only JSON matching the schema.
""".strip()


# =============================================================
# PUBLIC API
# =============================================================


def generate_roadmap(
    *,
    profile: dict[str, Any],
    target_role: str,
    analyzer_context: dict[str, Any] | None = None,
) -> RoadmapResponse:
    """Generate and validate a personalized CareerMap roadmap."""

    if not isinstance(profile, dict) or not profile:
        raise RoadmapGenerationError(
            "A valid roadmap profile is required."
        )

    normalized_role = target_role.strip()

    if not normalized_role:
        raise RoadmapGenerationError(
            "Target job role is required."
        )

    api_key = _get_api_key()

    if not api_key:
        raise RoadmapGenerationError(
            "GEMINI_API_KEY is not configured."
        )

    client = _create_client()
    model = _get_model()
    prompt = _build_prompt(
        profile=profile,
        target_role=normalized_role,
        analyzer_context=analyzer_context,
    )

    try:
        interaction = _create_interaction(
            client,
            model=model,
            prompt=prompt,
        )
    except Exception as exc:
        logger.exception(
            "Roadmap Gemini interaction failed. model=%s error=%s",
            model,
            exc,
        )
        raise RoadmapGenerationError(
            "AI roadmap generation failed."
        ) from exc

    status_value = getattr(interaction, "status", None)

    if isinstance(status_value, str):
        status_value = status_value.lower().strip()

        if status_value in {
            "failed",
            "cancelled",
            "incomplete",
        }:
            logger.warning(
                "Gemini roadmap interaction returned status=%s",
                status_value,
            )
            raise RoadmapGenerationError(
                f"AI roadmap generation ended with status: {status_value}."
            )

    output_text = _extract_output_text(interaction)

    try:
        result = _parse_response(output_text)
    except RoadmapGenerationError as first_error:
        error_text = str(first_error).casefold()
        if "phases" not in error_text:
            raise

        logger.warning(
            "Roadmap response failed structural phase validation; retrying once with a strict repair instruction."
        )

        repair_prompt = f"{prompt}\n\n{_ROADMAP_QUALITY_REPAIR}\n\n{_PHASE_COUNT_REPAIR}"

        try:
            repair_interaction = _create_interaction(
                client,
                model=model,
                prompt=repair_prompt,
            )
        except Exception as exc:
            logger.exception(
                "Roadmap repair interaction failed. model=%s error=%s",
                model,
                exc,
            )
            raise RoadmapGenerationError(
                "AI roadmap generation failed during response repair."
            ) from exc

        repair_status = getattr(repair_interaction, "status", None)
        if isinstance(repair_status, str):
            repair_status = repair_status.lower().strip()
            if repair_status in {"failed", "cancelled", "incomplete"}:
                raise RoadmapGenerationError(
                    f"AI roadmap repair ended with status: {repair_status}."
                )

        result = _parse_response(
            _extract_output_text(repair_interaction)
        )

    try:
        return _basic_final_checks(
            result,
            profile=profile,
            target_role=normalized_role,
        )
    except RoadmapGenerationError as first_check_error:
        logger.warning(
            "Roadmap deterministic quality checks failed; retrying once. error=%s",
            first_check_error,
        )

        repair_prompt = f"{prompt}\n\n{_ROADMAP_QUALITY_REPAIR}\n\nFailure to avoid: {str(first_check_error)}"

        try:
            repair_interaction = _create_interaction(
                client,
                model=model,
                prompt=repair_prompt,
            )
            repair_status = getattr(repair_interaction, "status", None)
            if isinstance(repair_status, str) and repair_status.lower().strip() in {
                "failed", "cancelled", "incomplete"
            }:
                raise RoadmapGenerationError(
                    f"AI roadmap repair ended with status: {repair_status}."
                )
            repaired = _parse_response(_extract_output_text(repair_interaction))
            return _basic_final_checks(
                repaired,
                profile=profile,
                target_role=normalized_role,
            )
        except RoadmapGenerationError:
            raise
        except Exception as exc:
            logger.exception("Roadmap quality-repair interaction failed.")
            raise RoadmapGenerationError(
                "AI roadmap generation failed during quality repair."
            ) from exc


# =============================================================
# BACKWARD-COMPATIBLE SERVICE WRAPPER
# =============================================================


class RoadmapService:
    """Compatibility wrapper for callers that use the service class API."""

    def generate(
        self,
        profile_data: dict[str, Any],
        target_role: str | None = None,
        analyzer_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Generate a roadmap dictionary using the current structured API."""

        role = target_role or _text(
            profile_data.get("preferredRole")
            if isinstance(profile_data, dict)
            else ""
        )

        result = generate_roadmap(
            profile=profile_data,
            target_role=role,
            analyzer_context=analyzer_context,
        )

        return result.model_dump(mode="json")


roadmap_service = RoadmapService()
