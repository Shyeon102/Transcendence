import requests
from datetime import date

from .queries import SEARCH_QUERY

ANILIST_URL = "https://graphql.anilist.co"


class AniListClient:
    def fetch_graphql(self, query: str, variables: dict | None = None) -> dict:
        response = requests.post(
            ANILIST_URL,
            json={"query": query, "variables": variables or {}},
            timeout=20,
        )
        response.raise_for_status()
        return response.json()

    def fetch_anime_page(
        self,
        page: int = 1,
        per_page: int = 50,
        sort: list[str] | None = None,
    ) -> dict:
        return self.fetch_graphql(
            SEARCH_QUERY,
            {
                "page": page,
                "perPage": per_page,
                "sort": sort or ["POPULARITY_DESC"],
            },
        )

    def _has_started(self, item: dict) -> bool:
        start_date = item.get("startDate") or {}
        year = start_date.get("year")
        if not year:
            return True

        item_date = date(
            int(year),
            int(start_date.get("month") or 1),
            int(start_date.get("day") or 1),
        )
        return item_date <= date.today()

    def fetch_anime(self, limit: int = 300) -> list[dict]:
        anime = []
        page = 1
        per_page = min(max(limit, 1), 50)

        while len(anime) < limit:
            data = self.fetch_anime_page(page=page, per_page=per_page)
            page_data = data.get("data", {}).get("Page", {})
            results = page_data.get("media", [])
            if not results:
                break

            for item in results:
                if len(anime) >= limit:
                    break
                if self._has_started(item):
                    anime.append(item)

            page_info = page_data.get("pageInfo", {})
            if not page_info.get("hasNextPage"):
                break
            page += 1

        return anime
