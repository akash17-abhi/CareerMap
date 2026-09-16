from __future__ import annotations

import re
import unicodedata


# ============================================================
# NORMALIZATION
# ============================================================


def normalize_unicode(text: str) -> str:
    """
    Normalize Unicode characters while preserving readable text.

    This helps handle documents containing different forms of
    apostrophes, dashes, spaces, and other Unicode variants.
    """

    if not text:
        return ""

    normalized = unicodedata.normalize(
        "NFKC",
        text,
    )

    # Normalize common whitespace variants.
    normalized = normalized.replace("\u00a0", " ")
    normalized = normalized.replace("\u2007", " ")
    normalized = normalized.replace("\u202f", " ")

    # Normalize common dash variants.
    normalized = normalized.replace("–", "-")
    normalized = normalized.replace("—", "-")
    normalized = normalized.replace("−", "-")

    # Normalize curly quotes.
    normalized = normalized.replace("“", '"')
    normalized = normalized.replace("”", '"')
    normalized = normalized.replace("‘", "'")
    normalized = normalized.replace("’", "'")

    return normalized


# ============================================================
# LINE NORMALIZATION
# ============================================================


def normalize_lines(text: str) -> str:
    """
    Normalize line formatting while keeping meaningful section
    boundaries intact.
    """

    text = normalize_unicode(text)

    # Normalize line endings.
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove zero-width characters.
    text = re.sub(
        r"[\u200b\u200c\u200d\ufeff]",
        "",
        text,
    )

    # Normalize tabs and repeated spaces.
    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    # Remove trailing whitespace.
    text = re.sub(
        r"[ \t]+\n",
        "\n",
        text,
    )

    # Remove excessive blank lines.
    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    return text.strip()


# ============================================================
# BULLET NORMALIZATION
# ============================================================


def normalize_bullets(text: str) -> str:
    """
    Normalize common bullet characters to a consistent '-'
    representation.

    This improves downstream parsing while preserving the
    actual bullet content.
    """

    if not text:
        return ""

    bullet_pattern = r"^[\s]*(?:[•●▪◦‣⁃∙·]|➢|➤|◆|■)[\s]+"

    normalized_lines: list[str] = []

    for line in text.splitlines():
        normalized_line = re.sub(
            bullet_pattern,
            "- ",
            line,
        )

        normalized_lines.append(
            normalized_line,
        )

    return "\n".join(normalized_lines)


# ============================================================
# CONTACT / URL NORMALIZATION
# ============================================================


def normalize_contact_spacing(text: str) -> str:
    """
    Normalize common spacing around email addresses, URLs and
    phone-like sequences without removing the underlying data.
    """

    if not text:
        return ""

    # Normalize spaces accidentally inserted around @.
    text = re.sub(
        r"\s*@\s*",
        "@",
        text,
    )

    # Normalize spaces around periods in URLs/email-like strings.
    text = re.sub(
        r"(?<=\w)\s+\.\s+(?=\w)",
        ".",
        text,
    )

    # Normalize repeated spaces around slashes in URLs.
    text = re.sub(
        r"\s*/\s*",
        "/",
        text,
    )

    return text


# ============================================================
# TOKENIZATION
# ============================================================


def tokenize_text(text: str) -> list[str]:
    """
    Produce simple word/technical-token tokens.

    This is deliberately conservative because technical terms
    such as C++, C#, .NET, scikit-learn, GitHub, and Power BI
    can be damaged by aggressive tokenization.
    """

    if not text:
        return []

    normalized = normalize_unicode(text).lower()

    tokens = re.findall(
        r"[a-zA-Z0-9+#.\-_/]+",
        normalized,
    )

    return [
        token
        for token in tokens
        if token.strip()
    ]


# ============================================================
# SIMPLE SENTENCE SEGMENTATION
# ============================================================


def split_into_sentences(text: str) -> list[str]:
    """
    Split text into approximately sentence-sized units.

    Resume bullets do not always end with punctuation, so line
    boundaries are also treated as useful segmentation points.
    """

    if not text:
        return []

    normalized = normalize_lines(text)

    sentence_candidates = re.split(
        r"(?<=[.!?])\s+|\n+",
        normalized,
    )

    sentences = [
        sentence.strip()
        for sentence in sentence_candidates
        if sentence.strip()
    ]

    return sentences


# ============================================================
# NORMALIZED SEARCH TEXT
# ============================================================


def build_search_text(text: str) -> str:
    """
    Build a normalized representation intended for local
    keyword/skill matching.

    Important:
    This representation is for matching only.
    It must not replace the original extracted text used
    for evidence display.
    """

    if not text:
        return ""

    normalized = normalize_lines(text)
    normalized = normalize_bullets(normalized)
    normalized = normalize_contact_spacing(normalized)

    # Lowercase for case-insensitive matching.
    normalized = normalized.lower()

    # Normalize remaining whitespace.
    normalized = re.sub(
        r"\s+",
        " ",
        normalized,
    )

    return normalized.strip()


# ============================================================
# SECTION DETECTION SUPPORT
# ============================================================


COMMON_SECTION_HEADERS = {
    "summary",
    "professional summary",
    "profile",
    "objective",
    "career objective",
    "skills",
    "technical skills",
    "technical skill",
    "core skills",
    "education",
    "academic background",
    "academic qualifications",
    "experience",
    "work experience",
    "professional experience",
    "internship",
    "internships",
    "internship experience",
    "projects",
    "project",
    "academic projects",
    "personal projects",
    "certifications",
    "certificates",
    "courses",
    "courses & certificates",
    "achievements",
    "key achievements",
    "awards",
    "languages",
    "tools",
    "technical tools",
    "professional skills",
}


def normalize_section_header(header: str) -> str:
    """
    Normalize a possible section heading.
    """

    if not header:
        return ""

    normalized = normalize_unicode(header).lower().strip()

    normalized = re.sub(
        r"[:|]+$",
        "",
        normalized,
    )

    normalized = re.sub(
        r"\s+",
        " ",
        normalized,
    )

    return normalized


def is_section_header(line: str) -> bool:
    """
    Determine whether a line is likely to be a common resume
    section heading.

    This is intentionally conservative.
    """

    normalized = normalize_section_header(line)

    if not normalized:
        return False

    if normalized in COMMON_SECTION_HEADERS:
        return True

    # A short all-uppercase line is often a section heading.
    stripped = line.strip()

    if (
        len(stripped) <= 60
        and stripped
        and stripped.upper() == stripped
        and re.search(r"[A-Z]", stripped)
    ):
        return True

    return False


# ============================================================
# SECTION SPLITTING
# ============================================================


def split_into_sections(
    text: str,
) -> dict[str, str]:
    """
    Split normalized document text into logical sections.

    This is a lightweight structural helper and is not intended
    to replace the dedicated resume extractor.
    """

    normalized = normalize_lines(text)

    if not normalized:
        return {}

    sections: dict[str, list[str]] = {}
    current_section = "general"

    sections[current_section] = []

    for raw_line in normalized.splitlines():
        line = raw_line.strip()

        if not line:
            continue

        if is_section_header(line):
            current_section = normalize_section_header(
                line,
            )

            if current_section not in sections:
                sections[current_section] = []

            continue

        sections.setdefault(
            current_section,
            [],
        ).append(line)

    return {
        section: "\n".join(lines).strip()
        for section, lines in sections.items()
        if lines
    }


# ============================================================
# COMBINED PREPROCESSOR
# ============================================================


def preprocess_text(
    text: str,
) -> str:
    """
    Run the standard local preprocessing pipeline.

    The returned text is suitable for downstream extraction
    and matching.

    Original extracted text must still be retained separately
    when evidence tracing is required.
    """

    if not text:
        return ""

    processed = normalize_unicode(text)
    processed = normalize_lines(processed)
    processed = normalize_bullets(processed)
    processed = normalize_contact_spacing(processed)

    return processed.strip()


# ============================================================
# VALIDATION
# ============================================================


def validate_preprocessed_text(
    text: str,
    minimum_characters: int = 50,
) -> str:
    """
    Validate the preprocessed representation before passing it
    to downstream local analysis services.
    """

    processed = preprocess_text(text)

    if len(processed) < minimum_characters:
        raise ValueError(
            "The processed document contains too little text "
            "for reliable analysis."
        )

    return processed