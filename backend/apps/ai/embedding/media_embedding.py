import time
import logging
import tiktoken
from django.db import transaction
from apps.ai.models import MediaEmbedding
from apps.media.models import Media
from google.genai import Client
import os
import requests

logger = logging.getLogger(__name__)
client = Client(api_key=os.getenv("GEMINI_API_KEY"))
# ── Gemini embedding-2 제약 ──────────────────────────────────────────────────
# Free tier 기준으로 보수적으로 설정
# RPM: 1500  →  task 내부 chunk당 sleep으로 완급 조절
# 입력 토큰: 2048 per text
MAX_TOKENS_PER_TEXT = 2048
# Gemini batch embed API는 최대 100개까지 한 번에 가능하나
# 보수적으로 10개씩 끊어서 요청
GEMINI_CHUNK_SIZE = 10
# chunk 1개 요청 후 대기(초). 1500 RPM = 초당 25건.
# chunk 10개 → 0.4초 대기하면 분당 ~150 chunk = 1500 req 이하로 유지
RATE_LIMIT_SLEEP = 0.4
# tiktoken 인코더 (토큰 수 계산용, cl100k_base ≈ Gemini 토큰 수와 근사치)
_enc = tiktoken.get_encoding("cl100k_base")


def truncate_to_token_limit(
    text: str,
    max_tokens: int = MAX_TOKENS_PER_TEXT
) -> str:
    tokens = _enc.encode(text)
    if len(tokens) <= max_tokens:
        return text
    truncated = _enc.decode(tokens[:max_tokens])
    logger.debug("Text truncate: %d → %d tokens", len(tokens), max_tokens)
    return truncated


# def build_source_text(media: Media) -> str:
#     genres = ", ".join(g.name for g in media.genres.all())
#     raw = (
#         f"Title: {media.title}\n"
#         f"Type: {media.media_type}\n"
#         f"Genres: {genres}\n"
#         f"Description: {media.description or ''}\n"
#     )
#     return truncate_to_token_limit(raw)


def build_source_text(media: Media) -> str:
    genres = ", ".join(g.name for g in media.genres.all())
    raw = (
        f"{media.title} is a {media.media_type}.\n"
        f"Genres: {genres}.\n"
        f"Story: {media.description or ''}.\n"
    ).strip()
    return truncate_to_token_limit(raw)


def get_batch_embeddings(texts: list[str]) -> list[list[float]]:
    api_key = os.getenv("GEMINI_API_KEY")
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/gemini-embedding-2:batchEmbedContents?key={api_key}"
    )
    all_embeddings: list[list[float]] = []

    for i in range(0, len(texts), GEMINI_CHUNK_SIZE):
        chunk = texts[i:i + GEMINI_CHUNK_SIZE]
        payload = {
            "requests": [
                {
                    "model": "models/gemini-embedding-2",
                    "content": {"parts": [{"text": t}]},
                    "outputDimensionality": 768,
                }
                for t in chunk
            ]
        }

        for attempt in range(5):
            response = requests.post(url, json=payload, timeout=30)
            if response.status_code == 429:
                wait = int(response.headers.get("Retry-After", 30))
                logger.warning(
                    "429 rate limit, %dsec wait (attempt %d/%d)",
                    wait,
                    attempt + 1,
                    5
                )
                time.sleep(wait)
                continue
            response.raise_for_status()
            break
        else:
            raise ValueError(
                f"429 retry failed after 5 attempts (chunk offset={i})"
                )

        data = response.json()
        embeddings = data.get("embeddings", [])

        if not embeddings:
            raise ValueError(f"Empty embedding response (chunk offset={i})")
        if len(embeddings) != len(chunk):
            raise ValueError(
                f"Response count mismatch: requested {len(chunk)} items, "
                f"received {len(embeddings)} responses "
                f"(chunk offset={i})"
            )

        all_embeddings.extend(emb["values"] for emb in embeddings)

        if i + GEMINI_CHUNK_SIZE < len(texts):
            time.sleep(RATE_LIMIT_SLEEP)

    return all_embeddings


def process_embedding_batch(media_ids: list[int]) -> None:
    already_done = set(
        MediaEmbedding.objects
        .filter(media_id__in=media_ids)
        .values_list("media_id", flat=True)
    )
    remaining_ids = [mid for mid in media_ids if mid not in already_done]
    if not remaining_ids:
        return

    medias = list(
        Media.objects
        .filter(id__in=remaining_ids)
        .prefetch_related("genres")
    )
    texts = [build_source_text(m) for m in medias]
    vectors = get_batch_embeddings(texts)

    if len(vectors) != len(medias):
        raise ValueError(
            f"Vector count mismatch: "
            f"m - {len(medias)}, v - {len(vectors)}"
        )

    embeddings_to_save = [
        MediaEmbedding(media=m, embedding=v, source_text=t)
        for m, v, t in zip(medias, vectors, texts)
    ]

    with transaction.atomic():
        MediaEmbedding.objects.bulk_create(
            embeddings_to_save,
            update_conflicts=True,
            unique_fields=["media"],
            update_fields=["embedding", "source_text"],
        )
