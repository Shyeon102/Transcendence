from apps.media.services.normalizer import (
    normalize_genre_names,
    normalize_rating,
    parse_partial_date,
)


def parse_anime(raw: dict) -> dict:
    title = raw.get("title") or {}
    start_date = raw.get("startDate") or {}
    studios = raw.get("studios", {}).get("nodes", [])
    cover = raw.get("coverImage") or {}
    country = raw.get("countryOfOrigin") or "JP"

    return {
        "external_source": "anilist",
        "external_id": str(raw["id"]),
        "title": (
            title.get("english")
            or title.get("romaji")
            or title.get("native")
            or ""
        ),
        "media_type": "anime",
        "genres": normalize_genre_names(raw.get("genres", [])),
        "country": country,
        "description": raw.get("description") or "",
        "director": studios[0].get("name", "") if studios else "",
        "cast": "",
        "release_date": parse_partial_date(
            start_date.get("year"),
            start_date.get("month"),
            start_date.get("day"),
        ),
        "image_url": cover.get("large") or cover.get("medium") or "",
        "side_poster_url": raw.get("bannerImage") or "",
        "age_rating": "18+" if raw.get("isAdult") else "",
        "language": "jp" if country == "JP" else "",
        "runtime": raw.get("duration"),
        "avg_rating": normalize_rating(raw.get("averageScore"), scale=20),
        "rating_count": int(raw.get("popularity") or 0),
    }
