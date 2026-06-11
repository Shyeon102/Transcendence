import os
from datetime import date

import requests


TMDB_API_URL = "https://api.themoviedb.org/3"
TMDB_DRAMA_GENRE_ID = 18


class TMDBClient:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("TMDB_API_KEY")
        if not self.api_key:
            raise ValueError("TMDB_API_KEY is required")

    def _get(self, path: str, params: dict | None = None) -> dict:
        query = {"api_key": self.api_key, **(params or {})}
        try:
            response = requests.get(
                f"{TMDB_API_URL}{path}",
                params=query,
                timeout=15,
            )
            response.raise_for_status()
        except requests.RequestException:
            raise RuntimeError(f"TMDB request failed for {path}") from None
        return response.json()

    def discover_movies(self, page: int = 1) -> dict:
        return self._get(
            "/discover/movie",
            {
                "page": page,
                "sort_by": "popularity.desc",
                "include_adult": "true",
                "include_video": "false",
                "primary_release_date.lte": date.today().isoformat(),
            },
        )

    def discover_tv_dramas(self, page: int = 1) -> dict:
        return self._get(
            "/discover/tv",
            {
                "page": page,
                "sort_by": "popularity.desc",
                "include_adult": "true",
                "first_air_date.lte": date.today().isoformat(),
                "with_genres": TMDB_DRAMA_GENRE_ID,
            },
        )

    def movie_details(self, movie_id: int) -> dict:
        return self._get(
            f"/movie/{movie_id}",
            {"append_to_response": "credits,release_dates"},
        )

    def tv_details(self, tv_id: int) -> dict:
        return self._get(
            f"/tv/{tv_id}",
            {"append_to_response": "credits,content_ratings"},
        )

    def _fetch_items(self, limit: int, discover, details) -> list[dict]:
        items = []
        page = 1

        while len(items) < limit:
            data = discover(page=page)
            results = data.get("results", [])
            if not results:
                break

            for item in results:
                if len(items) >= limit:
                    break
                items.append(details(item["id"]))

            if page >= data.get("total_pages", page):
                break
            page += 1

        return items

    def fetch_movies(self, limit: int = 300) -> list[dict]:
        return self._fetch_items(
            limit=limit,
            discover=self.discover_movies,
            details=self.movie_details,
        )

    def fetch_tv_dramas(self, limit: int = 300) -> list[dict]:
        return self._fetch_items(
            limit=limit,
            discover=self.discover_tv_dramas,
            details=self.tv_details,
        )

    def fetch_movies_and_dramas(self, limit: int = 300) -> dict[str, list[dict]]:
        movie_limit = (limit + 1) // 2
        drama_limit = limit // 2
        return {
            "movies": self.fetch_movies(limit=movie_limit),
            "dramas": self.fetch_tv_dramas(limit=drama_limit),
        }
