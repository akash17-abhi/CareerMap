from __future__ import annotations

from io import BytesIO
from typing import Any, Callable
from xml.sax.saxutils import escape

from reportlab.graphics.shapes import Circle, Drawing, Rect, String
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    LongTable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


# =============================================================================
# CareerMap PDF design system
# =============================================================================

PAGE_WIDTH, PAGE_HEIGHT = A4
LEFT = 17 * mm
RIGHT = 17 * mm
TOP = 18 * mm
BOTTOM = 18 * mm
CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT

NAVY = colors.HexColor("#0f172a")
SLATE_800 = colors.HexColor("#1e293b")
SLATE_700 = colors.HexColor("#334155")
SLATE_600 = colors.HexColor("#475569")
SLATE_500 = colors.HexColor("#64748b")
SLATE_400 = colors.HexColor("#94a3b8")
SLATE_300 = colors.HexColor("#cbd5e1")
SLATE_200 = colors.HexColor("#e2e8f0")
SLATE_100 = colors.HexColor("#f1f5f9")
SLATE_50 = colors.HexColor("#f8fafc")
WHITE = colors.white

INDIGO = colors.HexColor("#4f46e5")
INDIGO_DARK = colors.HexColor("#3730a3")
INDIGO_100 = colors.HexColor("#e0e7ff")
INDIGO_50 = colors.HexColor("#eef2ff")

BLUE = colors.HexColor("#2563eb")
BLUE_100 = colors.HexColor("#dbeafe")
BLUE_50 = colors.HexColor("#eff6ff")

GREEN = colors.HexColor("#059669")
GREEN_DARK = colors.HexColor("#047857")
GREEN_100 = colors.HexColor("#a7f3d0")
GREEN_50 = colors.HexColor("#ecfdf5")

RED = colors.HexColor("#dc2626")
RED_DARK = colors.HexColor("#b91c1c")
RED_100 = colors.HexColor("#fecaca")
RED_50 = colors.HexColor("#fef2f2")

AMBER = colors.HexColor("#d97706")
AMBER_100 = colors.HexColor("#fde68a")
AMBER_50 = colors.HexColor("#fffbeb")

ORANGE = colors.HexColor("#f97316")


# =============================================================================
# Data helpers
# =============================================================================

def _plain(value: Any, fallback: str = "Not provided") -> str:
    if value is None:
        return fallback

    if isinstance(value, bool):
        text = "Yes" if value else "No"
    elif isinstance(value, (dict, list)):
        text = str(value)
    else:
        text = str(value).strip()

    return text or fallback


def _safe(value: Any, fallback: str = "Not provided") -> str:
    return escape(_plain(value, fallback))


def _score(value: Any) -> float:
    try:
        return max(0.0, min(100.0, float(value)))
    except (TypeError, ValueError):
        return 0.0


def _items(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []

    result: list[str] = []

    for item in value:
        if isinstance(item, dict):
            item = (
                item.get("title")
                or item.get("name")
                or item.get("skill")
                or item.get("description")
                or item
            )

        text = _plain(item, "").strip()

        if text:
            result.append(text)

    return result


def _tone(value: float):
    if value >= 85:
        return GREEN
    if value >= 70:
        return colors.HexColor("#65a30d")
    if value >= 55:
        return AMBER
    if value >= 40:
        return ORANGE
    return RED


def _level(value: float) -> str:
    if value >= 85:
        return "Excellent"
    if value >= 70:
        return "Strong"
    if value >= 55:
        return "Moderate"
    if value >= 40:
        return "Partial"
    return "Limited"


def _chunks(text: str, max_chars: int = 620) -> list[str]:
    """
    Split unusually long individual list items into safe, page-flowable
    pieces. Normal items remain a single row.
    """
    words = text.split()

    if len(text) <= max_chars:
        return [text]

    result: list[str] = []
    current: list[str] = []
    length = 0

    for word in words:
        extra = len(word) + (1 if current else 0)

        if current and length + extra > max_chars:
            result.append(" ".join(current))
            current = [word]
            length = len(word)
        else:
            current.append(word)
            length += extra

    if current:
        result.append(" ".join(current))

    return result or [text]


# =============================================================================
# Typography
# =============================================================================

def _styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()

    common = dict(
        splitLongWords=True,
        wordWrap="LTR",
    )

    return {
        "title": ParagraphStyle(
            "cm_title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=23,
            textColor=NAVY,
            spaceAfter=1,
            **common,
        ),
        "report": ParagraphStyle(
            "cm_report",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7,
            leading=9,
            textColor=INDIGO_DARK,
            spaceAfter=4,
            **common,
        ),
        "subtitle": ParagraphStyle(
            "cm_subtitle",
            parent=base["Normal"],
            fontSize=9,
            leading=12,
            textColor=SLATE_600,
            spaceAfter=7,
            **common,
        ),
        "kicker": ParagraphStyle(
            "cm_kicker",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=6.4,
            leading=7.8,
            textColor=INDIGO_DARK,
            spaceAfter=2,
            keepWithNext=1,
            **common,
        ),
        "section": ParagraphStyle(
            "cm_section",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=14.5,
            textColor=NAVY,
            spaceBefore=4,
            spaceAfter=5,
            keepWithNext=1,
            **common,
        ),
        "card": ParagraphStyle(
            "cm_card",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=8.4,
            leading=10.2,
            textColor=NAVY,
            spaceAfter=3,
            **common,
        ),
        "body": ParagraphStyle(
            "cm_body",
            parent=base["BodyText"],
            fontSize=8,
            leading=10.8,
            textColor=SLATE_700,
            spaceAfter=3,
            **common,
        ),
        "small": ParagraphStyle(
            "cm_small",
            parent=base["BodyText"],
            fontSize=7.1,
            leading=9.5,
            textColor=SLATE_600,
            spaceAfter=1.5,
            **common,
        ),
        "tiny": ParagraphStyle(
            "cm_tiny",
            parent=base["BodyText"],
            fontSize=6.2,
            leading=7.8,
            textColor=SLATE_500,
            spaceAfter=1,
            **common,
        ),
        "bullet": ParagraphStyle(
            "cm_bullet",
            parent=base["BodyText"],
            fontSize=7.25,
            leading=9.6,
            leftIndent=8,
            firstLineIndent=-5,
            textColor=SLATE_700,
            spaceAfter=0,
            **common,
        ),
        "table_head": ParagraphStyle(
            "cm_table_head",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=6.5,
            leading=7.8,
            textColor=SLATE_700,
            **common,
        ),
        "phase": ParagraphStyle(
            "cm_phase",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=12.8,
            textColor=NAVY,
            spaceAfter=2,
            **common,
        ),
        "milestone": ParagraphStyle(
            "cm_milestone",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.9,
            leading=9.8,
            textColor=NAVY,
            spaceAfter=1.5,
            **common,
        ),
        "footer": ParagraphStyle(
            "cm_footer",
            parent=base["Normal"],
            fontSize=6.1,
            leading=7.2,
            textColor=SLATE_500,
            **common,
        ),
    }


# =============================================================================
# Page chrome
# =============================================================================

def _page_chrome(
    report_name: str,
    role: str,
) -> Callable:
    def draw(canvas, document) -> None:
        canvas.saveState()

        # Lightweight header on continuation pages.
        if document.page > 1:
            header_y = PAGE_HEIGHT - 9.5 * mm

            canvas.setFont("Helvetica-Bold", 6.7)
            canvas.setFillColor(NAVY)
            canvas.drawString(
                LEFT,
                header_y,
                "CareerMap",
            )

            canvas.setFont("Helvetica", 6.2)
            canvas.setFillColor(SLATE_500)
            canvas.drawRightString(
                PAGE_WIDTH - RIGHT,
                header_y,
                f"{report_name}  •  {role}",
            )

            canvas.setStrokeColor(SLATE_200)
            canvas.setLineWidth(0.45)
            canvas.line(
                LEFT,
                header_y - 2.2 * mm,
                PAGE_WIDTH - RIGHT,
                header_y - 2.2 * mm,
            )

        # Footer.
        footer_y = 8.5 * mm

        canvas.setStrokeColor(SLATE_200)
        canvas.setLineWidth(0.45)
        canvas.line(
            LEFT,
            footer_y + 2.7 * mm,
            PAGE_WIDTH - RIGHT,
            footer_y + 2.7 * mm,
        )

        canvas.setFont("Helvetica-Bold", 6.6)
        canvas.setFillColor(NAVY)
        canvas.drawString(
            LEFT,
            footer_y - 0.2 * mm,
            "CareerMap",
        )

        canvas.setFont("Helvetica", 6.1)
        canvas.setFillColor(SLATE_500)
        canvas.drawRightString(
            PAGE_WIDTH - RIGHT,
            footer_y - 0.2 * mm,
            f"Page {document.page}",
        )

        canvas.restoreState()

    return draw


# =============================================================================
# Visual components
# =============================================================================

def _bar(value: float, width: float = 65 * mm) -> Drawing:
    value = _score(value)
    height = 5.2

    drawing = Drawing(width, height)

    drawing.add(
        Rect(
            0,
            0,
            width,
            height,
            rx=2.6,
            ry=2.6,
            fillColor=SLATE_100,
            strokeColor=None,
        )
    )

    filled = width * value / 100

    if filled:
        drawing.add(
            Rect(
                0,
                0,
                filled,
                height,
                rx=2.6,
                ry=2.6,
                fillColor=_tone(value),
                strokeColor=None,
            )
        )

    return drawing


def _donut(value: float) -> Drawing:
    value = _score(value)

    import math

    drawing = Drawing(78, 78)
    cx, cy, radius = 39, 39, 25

    drawing.add(
        Circle(
            cx,
            cy,
            radius,
            fillColor=WHITE,
            strokeColor=SLATE_200,
            strokeWidth=7,
        )
    )

    segments = 40
    active = int(round(segments * value / 100))

    for index in range(segments):
        angle = math.radians(90 - index * 360 / segments)

        drawing.add(
            Circle(
                cx + math.cos(angle) * radius,
                cy + math.sin(angle) * radius,
                2.8,
                fillColor=_tone(value) if index < active else SLATE_200,
                strokeColor=None,
            )
        )

    drawing.add(
        String(
            cx,
            cy + 2,
            f"{int(round(value))}%",
            fontName="Helvetica-Bold",
            fontSize=16,
            fillColor=NAVY,
            textAnchor="middle",
        )
    )

    drawing.add(
        String(
            cx,
            cy - 9,
            "Overall Match",
            fontName="Helvetica",
            fontSize=5.7,
            fillColor=SLATE_500,
            textAnchor="middle",
        )
    )

    return drawing


def _info_box(
    label: str,
    text: str,
    styles,
    background=SLATE_50,
    border=SLATE_200,
) -> Table:
    table = Table(
        [[
            Paragraph(_safe(label.upper()), styles["kicker"]),
            Paragraph(_safe(text), styles["small"]),
        ]],
        colWidths=[34 * mm, CONTENT_WIDTH - 34 * mm],
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), background),
                ("BOX", (0, 0), (-1, -1), 0.5, border),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )

    return table


def _list_table(
    values: list[str],
    styles,
    numbered: bool = False,
    background=WHITE,
    border=SLATE_200,
) -> LongTable:
    if not values:
        values = ["None provided."]

    rows: list[list[Any]] = []

    for index, value in enumerate(values, start=1):
        pieces = _chunks(value)

        for piece_index, piece in enumerate(pieces):
            if numbered:
                marker = (
                    f"{index}."
                    if piece_index == 0
                    else "↳"
                )
            else:
                marker = "•" if piece_index == 0 else "↳"

            rows.append(
                [
                    Paragraph(
                        f"<b>{marker}</b>",
                        styles["small"],
                    ),
                    Paragraph(
                        _safe(piece),
                        styles["small"],
                    ),
                ]
            )

    table = LongTable(
        rows,
        colWidths=[9 * mm, CONTENT_WIDTH - 9 * mm],
        repeatRows=0,
        splitByRow=1,
        hAlign="LEFT",
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), background),
                ("BOX", (0, 0), (-1, -1), 0.5, border),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, border),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )

    return table


def _skill_table(
    values: list[str],
    styles,
    background,
    border,
    text_color,
) -> LongTable:
    if not values:
        values = ["None provided."]

    chip_style = ParagraphStyle(
        "cm_skill_chip",
        parent=styles["tiny"],
        fontName="Helvetica-Bold",
        fontSize=6.2,
        leading=7.5,
        textColor=text_color,
        alignment=TA_CENTER,
        splitLongWords=True,
        wordWrap="LTR",
    )

    rows: list[list[Any]] = []

    for start in range(0, len(values), 3):
        row = [
            Paragraph(_safe(value), chip_style)
            for value in values[start:start + 3]
        ]

        while len(row) < 3:
            row.append("")

        rows.append(row)

    table = LongTable(
        rows,
        colWidths=[CONTENT_WIDTH / 3] * 3,
        repeatRows=0,
        splitByRow=1,
        hAlign="LEFT",
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), background),
                ("BOX", (0, 0), (-1, -1), 0.5, border),
                ("INNERGRID", (0, 0), (-1, -1), 1.2, WHITE),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )

    return table


def _score_table(rows: list[tuple[str, Any]], styles) -> LongTable:
    data: list[list[Any]] = [
        [
            Paragraph("Criteria", styles["table_head"]),
            Paragraph("Visual", styles["table_head"]),
            Paragraph("Score", styles["table_head"]),
            Paragraph("Level", styles["table_head"]),
        ]
    ]

    for label, raw in rows:
        value = _score(raw)

        score_style = ParagraphStyle(
            f"score_{label}",
            parent=styles["small"],
            fontName="Helvetica-Bold",
            textColor=NAVY,
            alignment=TA_RIGHT,
        )

        level_style = ParagraphStyle(
            f"level_{label}",
            parent=styles["tiny"],
            fontName="Helvetica-Bold",
            textColor=_tone(value),
        )

        data.append(
            [
                Paragraph(_safe(label), styles["small"]),
                _bar(value, 62 * mm),
                Paragraph(
                    f"{int(round(value))}%",
                    score_style,
                ),
                Paragraph(
                    _safe(_level(value)),
                    level_style,
                ),
            ]
        )

    table = LongTable(
        data,
        colWidths=[
            39 * mm,
            67 * mm,
            17 * mm,
            CONTENT_WIDTH - 39 * mm - 67 * mm - 17 * mm,
        ],
        repeatRows=1,
        splitByRow=1,
        hAlign="LEFT",
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), SLATE_50),
                ("BOX", (0, 0), (-1, -1), 0.55, SLATE_200),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, SLATE_200),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )

    return table


def _phase_header(
    number: str,
    title: str,
    duration: str,
    styles,
) -> Table:
    number_cell = Table(
        [[
            Paragraph(
                _safe(number),
                ParagraphStyle(
                    "phase_number",
                    fontName="Helvetica-Bold",
                    fontSize=10,
                    leading=11,
                    textColor=WHITE,
                    alignment=TA_CENTER,
                ),
            )
        ]],
        colWidths=[10 * mm],
        rowHeights=[10 * mm],
    )

    number_cell.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), NAVY),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    table = Table(
        [[
            number_cell,
            [
                Paragraph(
                    f"PHASE {escape(number)}",
                    styles["kicker"],
                ),
                Paragraph(
                    _safe(title),
                    styles["phase"],
                ),
            ],
            Paragraph(
                _safe(duration),
                ParagraphStyle(
                    "phase_duration",
                    parent=styles["tiny"],
                    fontName="Helvetica-Bold",
                    textColor=SLATE_600,
                    alignment=TA_CENTER,
                ),
            ),
        ]],
        colWidths=[13 * mm, 111 * mm, 36 * mm],
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), SLATE_50),
                ("BOX", (0, 0), (-1, -1), 0.55, SLATE_200),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )

    return table


def _milestone_table(
    number: int,
    milestone: dict[str, Any],
    styles,
) -> LongTable:
    title = _plain(
        milestone.get("title"),
        f"Milestone {number}",
    )
    outcome = _plain(
        milestone.get("outcome"),
        "No outcome provided.",
    )
    tasks = _items(milestone.get("tasks"))

    rows: list[list[Any]] = [
        [
            Paragraph(
                f"<b>{number}</b>",
                ParagraphStyle(
                    f"milestone_number_{number}",
                    fontName="Helvetica-Bold",
                    fontSize=8,
                    leading=9,
                    textColor=WHITE,
                    alignment=TA_CENTER,
                ),
            ),
            Paragraph(
                _safe(title),
                styles["milestone"],
            ),
        ],
        [
            "",
            Paragraph(
                f"<b>Outcome:</b> {_safe(outcome)}",
                styles["small"],
            ),
        ],
    ]

    for task in tasks or ["No tasks provided."]:
        pieces = _chunks(task)

        for piece_index, piece in enumerate(pieces):
            rows.append(
                [
                    "",
                    Paragraph(
                        (
                            f"• {_safe(piece)}"
                            if piece_index == 0
                            else f"↳ {_safe(piece)}"
                        ),
                        styles["small"],
                    ),
                ]
            )

    table = LongTable(
        rows,
        colWidths=[10 * mm, CONTENT_WIDTH - 10 * mm],
        repeatRows=2,
        splitByRow=1,
        hAlign="LEFT",
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, 0), INDIGO),
                ("BACKGROUND", (1, 0), (1, 0), SLATE_50),
                ("BACKGROUND", (1, 1), (1, -1), WHITE),
                ("BOX", (0, 0), (-1, -1), 0.5, SLATE_200),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, SLATE_200),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (0, 0), (0, 0), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )

    return table


# =============================================================================
# Analyzer PDF
# =============================================================================

def build_analyzer_pdf(
    analysis: dict[str, Any],
) -> BytesIO:
    styles = _styles()
    buffer = BytesIO()

    role = _plain(
        analysis.get("role"),
        "Target role",
    )
    overall = _score(
        analysis.get("matchScore"),
    )

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=RIGHT,
        leftMargin=LEFT,
        topMargin=TOP,
        bottomMargin=BOTTOM,
        title="CareerMap Resume & JD Analysis Report",
        author="CareerMap",
        allowSplitting=1,
    )

    story: list[Any] = [
        Paragraph("CareerMap", styles["title"]),
        Paragraph(
            "RESUME & JD ANALYSIS REPORT",
            styles["report"],
        ),
        Paragraph(
            f"Target Role: <b>{_safe(role)}</b>",
            styles["subtitle"],
        ),
    ]

    assessment = Table(
        [[
            [
                Paragraph(
                    "OVERALL ASSESSMENT",
                    styles["kicker"],
                ),
                Paragraph(
                    (
                        "A structured comparison of your resume against "
                        "the selected target role, highlighting alignment, "
                        "gaps, and practical improvement opportunities."
                    ),
                    styles["body"],
                ),
                Paragraph(
                    f"<b>{_safe(_level(overall))} Match</b>",
                    ParagraphStyle(
                        "assessment_level",
                        parent=styles["small"],
                        fontName="Helvetica-Bold",
                        textColor=_tone(overall),
                    ),
                ),
            ],
            _donut(overall),
        ]],
        colWidths=[126 * mm, 34 * mm],
    )

    assessment.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BLUE_50),
                ("BOX", (0, 0), (-1, -1), 0.6, BLUE_100),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    story.extend(
        [
            assessment,
            Spacer(1, 8),
            *_section("Performance", "Score Breakdown", styles),
            _score_table(
                [
                    ("Overall Role Match", analysis.get("matchScore")),
                    ("Skills Match", analysis.get("skillsMatchScore")),
                    ("Keyword Match", analysis.get("keywordMatchScore")),
                    ("Experience Match", analysis.get("experienceMatchScore")),
                    ("Education Match", analysis.get("educationMatchScore")),
                    ("Semantic Similarity", analysis.get("semanticSimilarityScore")),
                    ("ATS Readiness", analysis.get("atsScore")),
                ],
                styles,
            ),
            Spacer(1, 8),
            *_section("Skill Coverage", "Matched Skills", styles),
            Paragraph(
                f"{len(_items(analysis.get('skills')))} skills identified",
                styles["small"],
            ),
            _skill_table(
                _items(analysis.get("skills")),
                styles,
                GREEN_50,
                GREEN_100,
                GREEN_DARK,
            ),
            Spacer(1, 8),
            *_section("Skill Coverage", "Missing & Weak Skills", styles),
            Paragraph(
                f"{len(_items(analysis.get('missingSkills')))} skills to improve",
                styles["small"],
            ),
            _skill_table(
                _items(analysis.get("missingSkills")),
                styles,
                RED_50,
                RED_100,
                RED_DARK,
            ),
            Spacer(1, 8),
            *_section("Profile Insights", "Resume Strengths", styles),
            _list_table(
                _items(analysis.get("strengths")),
                styles,
                background=GREEN_50,
                border=GREEN_100,
            ),
            Spacer(1, 8),
            *_section("Profile Insights", "Recommended Improvements", styles),
        ]
    )

    improvements: list[str] = []

    for item in analysis.get("improvements") or []:
        if isinstance(item, dict):
            title = _plain(
                item.get("title"),
                "Improvement",
            )
            description = _plain(
                item.get("description")
                or item.get("detail"),
                "",
            )

            improvements.append(
                f"{title}: {description}"
                if description
                else title
            )
        else:
            improvements.append(_plain(item))

    story.extend(
        [
            _list_table(
                improvements,
                styles,
                numbered=True,
                background=AMBER_50,
                border=AMBER_100,
            ),
            Spacer(1, 8),
            _info_box(
                "What this means",
                (
                    "Prioritize the largest gaps first. Use the missing "
                    "skills and recommendations to improve role alignment, "
                    "resume evidence, and ATS readiness."
                ),
                styles,
                AMBER_50,
                AMBER_100,
            ),
            Spacer(1, 7),
            _info_box(
                "Privacy notice",
                (
                    "Scores are rendered exactly as returned by CareerMap. "
                    "PDF bytes are generated temporarily in memory and are "
                    "not permanently stored."
                ),
                styles,
            ),
            Spacer(1, 3),
            Paragraph(
                "CareerMap • Plan Smarter. Build Faster. Go Further.",
                styles["footer"],
            ),
        ]
    )

    document.build(
        story,
        onFirstPage=_page_chrome(
            "Resume & JD Analysis",
            role,
        ),
        onLaterPages=_page_chrome(
            "Resume & JD Analysis",
            role,
        ),
    )

    buffer.seek(0)
    return buffer


# =============================================================================
# Roadmap PDF
# =============================================================================

def build_roadmap_pdf(
    roadmap: dict[str, Any],
    source: str | None = None,
    generated_at: str | None = None,
) -> BytesIO:
    """Build the complete v2 CareerMap Personalized Career Roadmap PDF."""

    styles = _styles()
    buffer = BytesIO()

    role = _plain(
        roadmap.get("target_role"),
        "Target role",
    )

    phases = [
        phase
        for phase in (roadmap.get("phases") or [])
        if isinstance(phase, dict)
    ]

    milestone_count = sum(
        len(
            [
                milestone
                for milestone in (phase.get("milestones") or [])
                if isinstance(milestone, dict)
            ]
        )
        for phase in phases
    )

    source_label = (
        "Resume-based"
        if source == "cv"
        else "Profile-based"
    )

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=RIGHT,
        leftMargin=LEFT,
        topMargin=TOP,
        bottomMargin=BOTTOM,
        title="CareerMap Personalized Career Roadmap",
        author="CareerMap",
        allowSplitting=1,
    )

    snapshot = roadmap.get("career_snapshot")
    snapshot = snapshot if isinstance(snapshot, dict) else {}

    strategy = roadmap.get("roadmap_strategy")
    strategy = strategy if isinstance(strategy, dict) else {}

    skill_map = [
        item
        for item in (roadmap.get("skill_map") or [])
        if isinstance(item, dict)
    ]

    career_readiness = [
        item
        for item in (roadmap.get("career_readiness") or [])
        if isinstance(item, dict)
    ]

    next_action = roadmap.get("next_action")
    next_action = next_action if isinstance(next_action, dict) else {}

    story: list[Any] = [
        Paragraph("CareerMap", styles["title"]),
        Paragraph(
            "PERSONALIZED CAREER ROADMAP",
            styles["report"],
        ),
        Paragraph(
            f"Target Role: <b>{_safe(role)}</b>",
            styles["subtitle"],
        ),
        _info_box(
            "Profile summary",
            _plain(
                roadmap.get("profile_summary"),
                "No profile summary was provided.",
            ),
            styles,
            BLUE_50,
            BLUE_100,
        ),
        Spacer(1, 7),
    ]

    # -------------------------------------------------------------------------
    # Career snapshot
    # -------------------------------------------------------------------------
    story.extend(
        [
            *_section(
                "Starting Point",
                "Career Snapshot",
                styles,
            ),
            _info_box(
                "Current level",
                _plain(snapshot.get("current_level")),
                styles,
            ),
            Spacer(1, 4),
            _info_box(
                "Career goal",
                _plain(snapshot.get("career_goal")),
                styles,
            ),
            Spacer(1, 4),
            _info_box(
                "Education",
                _plain(snapshot.get("education")),
                styles,
            ),
            Spacer(1, 4),
            _info_box(
                "Experience",
                _plain(snapshot.get("experience")),
                styles,
            ),
            Spacer(1, 4),
            _info_box(
                "Learning time",
                _plain(snapshot.get("learning_time_per_week")),
                styles,
            ),
            Spacer(1, 4),
            _info_box(
                "Target timeline",
                _plain(snapshot.get("target_timeline")),
                styles,
            ),
            Spacer(1, 4),
            _info_box(
                "Learning preferences",
                _plain(
                    ", ".join(_items(snapshot.get("learning_preferences")))
                    if _items(snapshot.get("learning_preferences"))
                    else None
                ),
                styles,
            ),
            Spacer(1, 8),
        ]
    )

    # -------------------------------------------------------------------------
    # Strengths and priority gaps
    # -------------------------------------------------------------------------
    story.extend(
        [
            *_section(
                "Starting Point",
                "Strengths & Priority Gaps",
                styles,
            ),
            _list_table(
                _items(roadmap.get("starting_strengths")),
                styles,
                background=GREEN_50,
                border=GREEN_100,
            ),
            Spacer(1, 6),
            Paragraph(
                "Priority gaps",
                styles["card"],
            ),
            _list_table(
                _items(roadmap.get("priority_gaps")),
                styles,
                background=RED_50,
                border=RED_100,
            ),
            Spacer(1, 9),
        ]
    )

    # -------------------------------------------------------------------------
    # Roadmap strategy
    # -------------------------------------------------------------------------
    story.extend(
        [
            *_section(
                "Personalization",
                "Why This Roadmap",
                styles,
            ),
            _info_box(
                "Strategy",
                _plain(
                    strategy.get("summary"),
                    "No roadmap strategy summary was provided.",
                ),
                styles,
                INDIGO_50,
                INDIGO_100,
            ),
            Spacer(1, 5),
        ]
    )

    why = _plain(strategy.get("why_this_roadmap"), "")
    if why:
        story.extend(
            [
                _info_box(
                    "Personalization logic",
                    why,
                    styles,
                    INDIGO_50,
                    INDIGO_100,
                ),
                Spacer(1, 5),
            ]
        )

    approach = _items(strategy.get("approach"))
    if approach:
        story.extend(
            [
                Paragraph("Approach", styles["card"]),
                _list_table(
                    approach,
                    styles,
                    numbered=True,
                    background=SLATE_50,
                    border=SLATE_200,
                ),
                Spacer(1, 5),
            ]
        )

    priorities = _items(strategy.get("priorities"))
    if priorities:
        story.extend(
            [
                Paragraph("Priority focus", styles["card"]),
                _list_table(
                    priorities,
                    styles,
                    background=INDIGO_50,
                    border=INDIGO_100,
                ),
                Spacer(1, 5),
            ]
        )

    constraints = _items(strategy.get("constraints"))
    if constraints:
        story.extend(
            [
                Paragraph("Planning constraints", styles["card"]),
                _list_table(
                    constraints,
                    styles,
                    background=AMBER_50,
                    border=AMBER_100,
                ),
                Spacer(1, 8),
            ]
        )

    # -------------------------------------------------------------------------
    # Skill map
    # -------------------------------------------------------------------------
    story.extend(
        [
            *_section(
                "Capability Map",
                "Skill Map",
                styles,
            ),
        ]
    )

    if skill_map:
        skill_rows = [
            [
                Paragraph("Skill", styles["table_head"]),
                Paragraph("Status", styles["table_head"]),
                Paragraph("Current", styles["table_head"]),
                Paragraph("Target", styles["table_head"]),
                Paragraph("Why", styles["table_head"]),
            ]
        ]

        for index, item in enumerate(skill_map):
            skill = _plain(item.get("skill"), f"Skill {index + 1}")
            status = _plain(item.get("status"))
            current = _plain(item.get("current_level"))
            target = _plain(item.get("target_level"))
            reason = _plain(item.get("reason"))

            skill_rows.append(
                [
                    Paragraph(_safe(skill), styles["small"]),
                    Paragraph(_safe(status.replace("-", " ")), styles["small"]),
                    Paragraph(_safe(current), styles["small"]),
                    Paragraph(_safe(target), styles["small"]),
                    Paragraph(_safe(reason), styles["tiny"]),
                ]
            )

        skill_table = LongTable(
            skill_rows,
            colWidths=[
                30 * mm,
                23 * mm,
                25 * mm,
                25 * mm,
                CONTENT_WIDTH - 103 * mm,
            ],
            repeatRows=1,
            splitByRow=1,
            hAlign="LEFT",
        )

        skill_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), SLATE_50),
                    ("BOX", (0, 0), (-1, -1), 0.55, SLATE_200),
                    ("INNERGRID", (0, 0), (-1, -1), 0.35, SLATE_200),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 5),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )

        story.extend([skill_table, Spacer(1, 9)])
    else:
        story.extend(
            [
                Paragraph("No skill map was provided.", styles["small"]),
                Spacer(1, 8),
            ]
        )

    # -------------------------------------------------------------------------
    # Career journey
    # -------------------------------------------------------------------------
    story.extend(
        [
            *_section(
                "Career Journey",
                "Step-by-Step Roadmap",
                styles,
            ),
            Paragraph(
                "Learn → Practice → Build → Prove",
                styles["small"],
            ),
            Spacer(1, 4),
        ]
    )

    for index, phase in enumerate(phases, start=1):
        phase_number = _plain(
            phase.get("phase"),
            str(index),
        )
        phase_title = _plain(
            phase.get("title"),
            f"Phase {index}",
        )
        duration = _plain(
            phase.get("duration"),
        )
        purpose = _plain(
            phase.get("purpose"),
        )

        header_and_purpose = Table(
            [[
                [
                    _phase_header(
                        phase_number,
                        phase_title,
                        duration,
                        styles,
                    ),
                    Spacer(1, 3),
                    Paragraph(
                        f"<b>Purpose:</b> {_safe(purpose)}",
                        styles["body"],
                    ),
                ]
            ]],
            colWidths=[CONTENT_WIDTH],
        )

        header_and_purpose.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ]
            )
        )

        story.extend(
            [
                header_and_purpose,
                Spacer(1, 4),
            ]
        )

        focus = _items(phase.get("focus_skills"))
        if focus:
            story.extend(
                [
                    Paragraph("Focus skills", styles["card"]),
                    _skill_table(
                        focus,
                        styles,
                        INDIGO_50,
                        INDIGO_100,
                        INDIGO_DARK,
                    ),
                    Spacer(1, 5),
                ]
            )

        # Explicit v2 stages.
        stage_specs = (
            (
                "01 • Learn",
                phase.get("learn"),
                INDIGO_50,
                INDIGO_100,
            ),
            (
                "02 • Practice",
                phase.get("practice"),
                BLUE_50,
                BLUE_100,
            ),
            (
                "03 • Build",
                phase.get("build"),
                INDIGO_50,
                INDIGO_100,
            ),
            (
                "04 • Prove",
                phase.get("prove"),
                GREEN_50,
                GREEN_100,
            ),
        )

        for stage_title, raw_stage, background, border in stage_specs:
            stage = raw_stage if isinstance(raw_stage, dict) else {}

            story.append(
                Paragraph(
                    _safe(stage_title),
                    styles["card"],
                )
            )

            objective = _plain(stage.get("objective"), "")
            if objective:
                story.extend(
                    [
                        _info_box(
                            "Objective",
                            objective,
                            styles,
                            background,
                            border,
                        ),
                        Spacer(1, 4),
                    ]
                )

            if stage_title.startswith("01"):
                topics = _items(stage.get("topics"))
                if topics:
                    story.extend(
                        [
                            Paragraph("Topics", styles["tiny"]),
                            _list_table(
                                topics,
                                styles,
                                background=WHITE,
                                border=SLATE_200,
                            ),
                            Spacer(1, 4),
                        ]
                    )

                resources = [
                    resource
                    for resource in (stage.get("study_materials") or [])
                    if isinstance(resource, dict)
                ]

                if resources:
                    resource_rows = [
                        [
                            Paragraph("Type", styles["table_head"]),
                            Paragraph("Resource", styles["table_head"]),
                            Paragraph("Provider", styles["table_head"]),
                            Paragraph("Details", styles["table_head"]),
                        ]
                    ]

                    for resource in resources:
                        resource_rows.append(
                            [
                                Paragraph(
                                    _safe(
                                        _plain(
                                            resource.get("type"),
                                            "Resource",
                                        )
                                    ),
                                    styles["tiny"],
                                ),
                                Paragraph(
                                    _safe(
                                        _plain(
                                            resource.get("title"),
                                            "Untitled resource",
                                        )
                                    ),
                                    styles["small"],
                                ),
                                Paragraph(
                                    _safe(
                                        _plain(
                                            resource.get("provider"),
                                            "",
                                        )
                                    ),
                                    styles["tiny"],
                                ),
                                Paragraph(
                                    _safe(
                                        _plain(
                                            resource.get("description"),
                                            "",
                                        )
                                    ),
                                    styles["tiny"],
                                ),
                            ]
                        )

                    resource_table = LongTable(
                        resource_rows,
                        colWidths=[
                            20 * mm,
                            55 * mm,
                            30 * mm,
                            CONTENT_WIDTH - 105 * mm,
                        ],
                        repeatRows=1,
                        splitByRow=1,
                        hAlign="LEFT",
                    )
                    resource_table.setStyle(
                        TableStyle(
                            [
                                ("BACKGROUND", (0, 0), (-1, 0), SLATE_50),
                                ("BOX", (0, 0), (-1, -1), 0.5, SLATE_200),
                                ("INNERGRID", (0, 0), (-1, -1), 0.3, SLATE_200),
                                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                                ("TOPPADDING", (0, 0), (-1, -1), 5),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                            ]
                        )
                    )

                    story.extend(
                        [
                            Paragraph("Study materials", styles["tiny"]),
                            resource_table,
                            Spacer(1, 4),
                        ]
                    )

                estimated = stage.get("estimated_minutes")
                if isinstance(estimated, (int, float)):
                    story.extend(
                        [
                            _info_box(
                                "Estimated time",
                                f"{int(estimated)} minutes",
                                styles,
                            ),
                            Spacer(1, 4),
                        ]
                    )

            elif stage_title.startswith("02"):
                activities = _items(stage.get("activities"))
                if activities:
                    story.extend(
                        [
                            Paragraph("Activities", styles["tiny"]),
                            _list_table(
                                activities,
                                styles,
                                background=WHITE,
                                border=SLATE_200,
                            ),
                            Spacer(1, 4),
                        ]
                    )

                criteria = _items(stage.get("success_criteria"))
                if criteria:
                    story.extend(
                        [
                            Paragraph("Success criteria", styles["tiny"]),
                            _list_table(
                                criteria,
                                styles,
                                background=BLUE_50,
                                border=BLUE_100,
                            ),
                            Spacer(1, 4),
                        ]
                    )

            elif stage_title.startswith("03"):
                project = _plain(stage.get("project"), "")
                if project:
                    story.extend(
                        [
                            _info_box(
                                "Practical project",
                                project,
                                styles,
                                INDIGO_50,
                                INDIGO_100,
                            ),
                            Spacer(1, 4),
                        ]
                    )

                requirements = _items(stage.get("requirements"))
                if requirements:
                    story.extend(
                        [
                            Paragraph("Requirements", styles["tiny"]),
                            _list_table(
                                requirements,
                                styles,
                                background=WHITE,
                                border=SLATE_200,
                            ),
                            Spacer(1, 4),
                        ]
                    )

                deliverables = _items(stage.get("deliverables"))
                if deliverables:
                    story.extend(
                        [
                            Paragraph("Deliverables", styles["tiny"]),
                            _list_table(
                                deliverables,
                                styles,
                                background=INDIGO_50,
                                border=INDIGO_100,
                            ),
                            Spacer(1, 4),
                        ]
                    )

            elif stage_title.startswith("04"):
                evidence = _items(stage.get("evidence"))
                if evidence:
                    story.extend(
                        [
                            Paragraph("Evidence", styles["tiny"]),
                            _list_table(
                                evidence,
                                styles,
                                background=WHITE,
                                border=SLATE_200,
                            ),
                            Spacer(1, 4),
                        ]
                    )

                portfolio_signal = _plain(
                    stage.get("portfolio_signal"),
                    "",
                )
                if portfolio_signal:
                    story.extend(
                        [
                            _info_box(
                                "Portfolio signal",
                                portfolio_signal,
                                styles,
                                GREEN_50,
                                GREEN_100,
                            ),
                            Spacer(1, 4),
                        ]
                    )

        phase_milestones = [
            milestone
            for milestone in (phase.get("milestones") or [])
            if isinstance(milestone, dict)
        ]

        if phase_milestones:
            story.append(
                Paragraph(
                    "Milestones",
                    styles["card"],
                )
            )

            for milestone_index, milestone in enumerate(
                phase_milestones,
                start=1,
            ):
                story.extend(
                    [
                        _milestone_table(
                            milestone_index,
                            milestone,
                            styles,
                        ),
                        Spacer(1, 4),
                    ]
                )

        completion_signal = _plain(
            phase.get("completion_signal"),
            "",
        )
        if completion_signal:
            story.extend(
                [
                    _info_box(
                        "Completion signal",
                        completion_signal,
                        styles,
                        GREEN_50,
                        GREEN_100,
                    ),
                    Spacer(1, 8),
                ]
            )

    # -------------------------------------------------------------------------
    # Execution
    # -------------------------------------------------------------------------
    story.extend(
        [
            PageBreak(),
            *_section(
                "Execution",
                "Weekly Study Plan",
                styles,
            ),
        ]
    )

    weekly_items = [
        item
        for item in (roadmap.get("weekly_routine") or [])
        if isinstance(item, dict)
    ]

    if weekly_items:
        weekly_rows = [
            [
                Paragraph("Day", styles["table_head"]),
                Paragraph("Minutes", styles["table_head"]),
                Paragraph("Focus", styles["table_head"]),
                Paragraph("Activities", styles["table_head"]),
            ]
        ]

        for item in weekly_items:
            activities = _items(item.get("activities"))
            weekly_rows.append(
                [
                    Paragraph(_safe(_plain(item.get("day"))), styles["small"]),
                    Paragraph(
                        _safe(_plain(item.get("estimated_minutes"))),
                        styles["small"],
                    ),
                    Paragraph(_safe(_plain(item.get("focus"))), styles["small"]),
                    Paragraph(
                        _safe(" • ".join(activities))
                        if activities
                        else "",
                        styles["small"],
                    ),
                ]
            )

        weekly_table = LongTable(
            weekly_rows,
            colWidths=[
                25 * mm,
                20 * mm,
                50 * mm,
                CONTENT_WIDTH - 95 * mm,
            ],
            repeatRows=1,
            splitByRow=1,
            hAlign="LEFT",
        )
        weekly_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), SLATE_50),
                    ("BOX", (0, 0), (-1, -1), 0.55, SLATE_200),
                    ("INNERGRID", (0, 0), (-1, -1), 0.35, SLATE_200),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 5),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        story.extend([weekly_table, Spacer(1, 9)])
    else:
        story.extend(
            [
                Paragraph("No weekly routine was specified.", styles["small"]),
                Spacer(1, 9),
            ]
        )

    # -------------------------------------------------------------------------
    # Portfolio outcomes
    # -------------------------------------------------------------------------
    story.extend(
        [
            *_section(
                "Portfolio",
                "Portfolio Outcomes",
                styles,
            ),
        ]
    )

    portfolio_items = [
        item
        for item in (roadmap.get("portfolio_outcomes") or [])
        if isinstance(item, dict)
    ]

    if portfolio_items:
        for item in portfolio_items:
            title = _plain(item.get("title"), "Portfolio outcome")
            description = _plain(item.get("description"), "")
            skills = _items(item.get("skills_demonstrated"))
            evidence = _items(item.get("evidence"))

            story.extend(
                [
                    _info_box(
                        title,
                        description or "No description was provided.",
                        styles,
                        GREEN_50,
                        GREEN_100,
                    ),
                    Spacer(1, 4),
                ]
            )

            if skills:
                story.extend(
                    [
                        Paragraph(
                            "Skills demonstrated",
                            styles["tiny"],
                        ),
                        _skill_table(
                            skills,
                            styles,
                            INDIGO_50,
                            INDIGO_100,
                            INDIGO_DARK,
                        ),
                        Spacer(1, 4),
                    ]
                )

            if evidence:
                story.extend(
                    [
                        Paragraph("Evidence", styles["tiny"]),
                        _list_table(
                            evidence,
                            styles,
                            background=WHITE,
                            border=SLATE_200,
                        ),
                        Spacer(1, 7),
                    ]
                )
    else:
        story.extend(
            [
                Paragraph(
                    "No portfolio outcomes were specified.",
                    styles["small"],
                ),
                Spacer(1, 9),
            ]
        )

    # -------------------------------------------------------------------------
    # Career readiness
    # -------------------------------------------------------------------------
    story.extend(
        [
            *_section(
                "Readiness",
                "Career Readiness",
                styles,
            ),
        ]
    )

    if career_readiness:
        for item in career_readiness:
            status = _plain(item.get("status")).replace("-", " ")
            story.extend(
                [
                    _info_box(
                        f"{_plain(item.get('area'))} • {status}",
                        _plain(
                            item.get("current_state"),
                            "No current state was provided.",
                        ),
                        styles,
                        SLATE_50,
                        SLATE_200,
                    ),
                    Spacer(1, 4),
                    _info_box(
                        "Recommended action",
                        _plain(
                            item.get("action"),
                            "No action was specified.",
                        ),
                        styles,
                        GREEN_50,
                        GREEN_100,
                    ),
                    Spacer(1, 6),
                ]
            )
    else:
        story.extend(
            [
                Paragraph(
                    "No career readiness guidance was provided.",
                    styles["small"],
                ),
                Spacer(1, 8),
            ]
        )

    # -------------------------------------------------------------------------
    # Final readiness checklist
    # -------------------------------------------------------------------------
    story.extend(
        [
            *_section(
                "Readiness",
                "Final Readiness Checklist",
                styles,
            ),
            _list_table(
                _items(roadmap.get("final_readiness_checklist")),
                styles,
                numbered=True,
                background=GREEN_50,
                border=GREEN_100,
            ),
            Spacer(1, 9),
        ]
    )

    # -------------------------------------------------------------------------
    # Next action
    # -------------------------------------------------------------------------
    next_title = _plain(
        next_action.get("title"),
        "",
    )
    next_description = _plain(
        next_action.get("description"),
        "",
    )
    next_reason = _plain(
        next_action.get("reason"),
        "",
    )
    next_minutes = next_action.get("estimated_minutes")

    if next_title or next_description:
        story.extend(
            [
                *_section(
                    "Next Step",
                    "Your Next Action",
                    styles,
                ),
                _info_box(
                    next_title or "Next action",
                    next_description or "No description was provided.",
                    styles,
                    INDIGO_50,
                    INDIGO_100,
                ),
                Spacer(1, 4),
            ]
        )

        if next_reason:
            story.extend(
                [
                    _info_box(
                        "Why now",
                        next_reason,
                        styles,
                        SLATE_50,
                        SLATE_200,
                    ),
                    Spacer(1, 4),
                ]
            )

        if isinstance(next_minutes, (int, float)):
            story.extend(
                [
                    _info_box(
                        "Estimated time",
                        f"{int(next_minutes)} minutes",
                        styles,
                    ),
                    Spacer(1, 8),
                ]
            )

    # -------------------------------------------------------------------------
    # Grounding / transparency
    # -------------------------------------------------------------------------
    grounding_notes = _items(roadmap.get("grounding_notes"))

    if grounding_notes:
        story.extend(
            [
                *_section(
                    "Transparency",
                    "How CareerMap Built This",
                    styles,
                ),
                _list_table(
                    grounding_notes,
                    styles,
                    background=SLATE_50,
                    border=SLATE_200,
                ),
                Spacer(1, 8),
            ]
        )

    story.extend(
        [
            _info_box(
                "Privacy notice",
                (
                    "PDF bytes are generated temporarily in memory and are "
                    "not permanently stored by this export service."
                ),
                styles,
            ),
            Spacer(1, 3),
            Paragraph(
                (
                    f"Source: {_safe(source, 'Not provided')} • "
                    f"Generated: {_safe(generated_at, 'Not provided')}"
                ),
                styles["footer"],
            ),
            Paragraph(
                "CareerMap • Plan Smarter. Build Faster. Go Further.",
                styles["footer"],
            ),
        ]
    )

    document.build(
        story,
        onFirstPage=_page_chrome(
            "Personalized Career Roadmap",
            role,
        ),
        onLaterPages=_page_chrome(
            "Personalized Career Roadmap",
            role,
        ),
    )

    buffer.seek(0)
    return buffer


def _section(
    kicker: str,
    title: str,
    styles,
) -> list[Paragraph]:
    return [
        Paragraph(
            _safe(kicker.upper()),
            styles["kicker"],
        ),
        Paragraph(
            _safe(title),
            styles["section"],
        ),
    ]
