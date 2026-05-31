from datetime import date


GENRE_ALIASES = {
    "science fiction": "Sci-Fi",
    "sci-fi": "Sci-Fi",
    "sci fi": "Sci-Fi",
    "slice of life": "Slice of Life",
}


def normalize_genre_name(name: str) -> str:
    cleaned = " ".join((name or "").strip().split())
    if not cleaned:
        return ""
    return GENRE_ALIASES.get(cleaned.lower(), cleaned.title())


def normalize_genre_names(names) -> list[str]:
    normalized = []
    seen = set()

    for name in names:
        parts = str(name or "").split("&")
        for part in parts:
            genre = normalize_genre_name(part)
            if genre and genre not in seen:
                normalized.append(genre)
                seen.add(genre)

    return normalized


def parse_partial_date(year=None, month=None, day=None):
    if not year:
        return None
    return date(int(year), int(month or 1), int(day or 1))


def parse_iso_date(value: str):
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def normalize_rating(value, scale: float):
    if value is None:
        return 0
    return round(float(value) / scale, 2)
