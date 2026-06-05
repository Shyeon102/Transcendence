from apps.media.services.normalizer import (
    normalize_genre_names,
    normalize_rating,
    parse_iso_date,
)


POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500"


def parse_movie(raw: dict) -> dict:
    credits = raw.get("credits") or {}
    crew = credits.get("crew") or []
    cast = credits.get("cast") or []
    director = next(
        (person.get("name", "") for person in crew
         if person.get("job") == "Director"),
        "",
    )

    poster_path = raw.get("poster_path") or ""
    countries = raw.get("production_countries") or []
    country = countries[0].get("iso_3166_1", "") if countries else ""

    return {
        "external_source": "tmdb",
        "external_id": str(raw["id"]),
        "title": raw.get("title") or raw.get("original_title") or "",
        "media_type": "movie",
        "genres": normalize_genre_names(
            genre.get("name", "") for genre in raw.get("genres", [])
        ),
        "country": country,
        "description": raw.get("overview") or "",
        "director": director,
        "cast": ", ".join(
            person.get("name", "") for person in cast[:5]
            if person.get("name")
        ),
        "release_date": parse_iso_date(raw.get("release_date", "")),
        "image_url": f"{POSTER_BASE_URL}{poster_path}" if poster_path else "",
        "avg_rating": normalize_rating(raw.get("vote_average"), scale=2),
        "rating_count": int(raw.get("vote_count") or 0),
    }


def parse_tv_drama(raw: dict) -> dict:
    credits = raw.get("credits") or {}
    cast = credits.get("cast") or []
    creators = raw.get("created_by") or []
    poster_path = raw.get("poster_path") or ""
    origin_countries = raw.get("origin_country") or []

    return {
        "external_source": "tmdb",
        "external_id": f"tv:{raw['id']}",
        "title": raw.get("name") or raw.get("original_name") or "",
        "media_type": "drama",
        "genres": normalize_genre_names(
            genre.get("name", "") for genre in raw.get("genres", [])
        ),
        "country": origin_countries[0] if origin_countries else "",
        "description": raw.get("overview") or "",
        "director": ", ".join(
            creator.get("name", "") for creator in creators
            if creator.get("name")
        ),
        "cast": ", ".join(
            person.get("name", "") for person in cast[:5]
            if person.get("name")
        ),
        "release_date": parse_iso_date(raw.get("first_air_date", "")),
        "image_url": f"{POSTER_BASE_URL}{poster_path}" if poster_path else "",
        "avg_rating": normalize_rating(raw.get("vote_average"), scale=2),
        "rating_count": int(raw.get("vote_count") or 0),
    }
