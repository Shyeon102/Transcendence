import requests
import time
from typing import Dict, Optional

ANILIST_URL = "https://graphql.anilist.co"
RATE_LIMIT_DELAY = 0.5  # seconds between requests


class AniListClient:
    """Client for fetching data from AniList GraphQL API"""

    def __init__(self):
        self.url = ANILIST_URL
        self.session = requests.Session()
        self.last_request_time = 0

    def _wait_for_rate_limit(self):
        """Ensure we don't exceed rate limits"""
        elapsed = time.time() - self.last_request_time
        if elapsed < RATE_LIMIT_DELAY:
            time.sleep(RATE_LIMIT_DELAY - elapsed)

    def query(self, query: str, variables: Optional[Dict] = None) -> Dict:
        """
        Execute a GraphQL query against AniList API

        Args:
            query: GraphQL query string
            variables: Query variables dict

        Returns:
            Response data dict

        Raises:
            Exception: If the API request fails
        """
        self._wait_for_rate_limit()

        try:
            response = self.session.post(
                self.url,
                json={'query': query, 'variables': variables or {}},
                timeout=10
            )
            response.raise_for_status()
            self.last_request_time = time.time()

            data = response.json()

            if 'errors' in data:
                raise Exception(f"GraphQL error: {data['errors']}")

            return data.get('data', {})

        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch from AniList: {str(e)}")

    def close(self):
        """Close the session"""
        self.session.close()


def get_anilist_client() -> AniListClient:
    """Factory function to get an AniList client"""
    return AniListClient()
