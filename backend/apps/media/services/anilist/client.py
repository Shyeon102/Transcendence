import asyncio
from requests import session

ANILIST_URL = "https://graphql.anilist.co"


async def fetch_graphql(query: str, variables: dict = None) -> dict:
    """Helper function to fetch data from Anilist GraphQL API"""

    async with asyncio.Semaphore(5):  # Limit concurrent requests
        async with session.post(ANILIST_URL,
                                json={'query': query,
                                      'variables': variables}) as response:
            if response.status != 200:
                raise Exception(
                    f"GraphQL query failed with status {response.status}")
            return await response.json()
