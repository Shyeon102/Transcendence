import os
import requests
import logging
from pgvector.django import CosineDistance
from apps.ai.models import MediaEmbedding
import pandas as pd
import json
from pydantic import BaseModel, Field
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

logger = logging.getLogger(__name__)


class ParsedQuery(BaseModel):
    Title: str | None = None
    Type: str | None = None
    Genres: list[str] = Field(default_factory=list)
    Description: str

    @property
    def embedding_text(self) -> str:
        genres_str = ", ".join(self.Genres) if self.Genres else ""
        parts = []
        if self.Type:
            parts.append(f"This is a {self.Type}.")
        if genres_str:
            parts.append(f"Genres: {genres_str}.")
        if self.Description:
            parts.append(f"Story: {self.Description}.")
        return " ".join(parts).strip()


def _fallback_parse(text: str) -> ParsedQuery:
    text_lower = text.lower()

    media_type = None
    if any(k in text_lower for k in ["영화", "movie", "film"]):
        media_type = "movie"
    elif any(k in text_lower for k in ["애니", "anime", "animation"]):
        media_type = "anime"
    elif any(k in text_lower for k in ["드라마", "drama", "series", "show"]):
        media_type = "drama"

    genre_keywords = {
        "Action": ["액션", "action", "fight", "battle", "전투"],
        "Comedy": ["코미디", "comedy", "funny", "웃긴", "humor"],
        "Romance": ["로맨스", "romance", "romantic", "사랑", "love"],
        "Horror": ["공포", "horror", "scary", "무서운", "thriller"],
        "Sci-Fi": ["sf", "sci-fi", "science fiction", "우주", "space", "future"],
        "Animation": ["애니", "anime", "animation", "animated"],
        "Drama": ["드라마", "drama", "감동", "emotional"],
        "Fantasy": ["판타지", "fantasy", "magic", "마법"],
        "Crime": ["범죄", "crime", "detective", "추리", "mystery"],
        "Adventure": ["어드벤처", "adventure", "여행", "탐험"],
    }
    genres = [
        genre
        for genre, keywords in genre_keywords.items()
        if any(k in text_lower for k in keywords)
    ]

    enriched_description = f"A story about {text}"

    return ParsedQuery(
        Title=None,
        Type=media_type,
        Genres=genres,
        Description=enriched_description,
    )


@retry(
    retry=retry_if_exception_type(Exception),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=8),
    reraise=False,
)
def call_gemini_with_retry(prompt: str) -> ParsedQuery | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/"
        f"models/gemini-3.5-flash:generateContent?key={api_key}"
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    res = requests.post(url, json=payload, timeout=30)
    if res.status_code == 429:
        return None 
    res.raise_for_status()
    data = res.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    parsed = json.loads(text)
    return ParsedQuery(**parsed)


def parse_query(text: str) -> ParsedQuery:
    prompt = f"""
    Analyze the following request and extract media search criteria in JSON format. # noqa: E501

    Request: "{text}"

    Guidelines:
    - Type: Media type should be "movie", "anime", "drama" or null if not specified.
    - Genres: An array of strings. Identify genres mentioned or implied by the query. Return [] if none.
    - Description: Extract the core topic, theme, or narrative elements for semantic search. Keep it concise.

    Output Format:
    Return ONLY a valid JSON object. Do not include any markdown formatting or extra text.
    {{
        "Type": null,
        "Genres": [],
        "Description": ""
    }}
    """
    try:
        result = call_gemini_with_retry(prompt)
        if result is not None:
            return result
    except Exception as e:
        logger.warning("Gemini failed: %s", e)
    return _fallback_parse(text)


def embed_query(text: str) -> list[float]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/"
        f"models/gemini-embedding-2:embedContent?key={api_key}"
    )
    payload = {
        "content": {"parts": [{"text": text.strip()}]},
        "outputDimensionality": 768,
    }
    res = requests.post(url, json=payload, timeout=30)
    res.raise_for_status()
    return res.json()["embedding"]["values"]


def retrieve_media(
    query_embedding: list[float],
    media_type: str | None = None,
    genres: list[str] | None = None,
    top_k: int = 10
) -> pd.Series:
    qs = (
        MediaEmbedding.objects
        .select_related('media')
        .annotate(distance=CosineDistance('embedding', query_embedding))
        .order_by('distance')
    )

    if media_type:
        qs = qs.filter(media__media_type=media_type)

    if genres:
        for g in genres:
            qs = qs.filter(media__genres__name=g)

    qs = qs.distinct()

    results = qs.values('media_id', 'distance')[:top_k]

    return pd.Series(
        {r['media_id']: float(1 / (1 + r['distance'])) for r in results},
        name='retrieval_score',
    )


def rag_recommendations(
    query: str,
    top_k: int = 10
) -> pd.Series:
    parsed_query = parse_query(query)
    logger.info("** Query parsed successfully **")
    query_embedded = embed_query(parsed_query.embedding_text)
    return retrieve_media(
        query_embedded,
        media_type=parsed_query.Type,
        genres=parsed_query.Genres,
        top_k=top_k
    )
