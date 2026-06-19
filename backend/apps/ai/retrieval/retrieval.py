from pgvector.django import CosineDistance
from media.models import Media, MediaEmbedding
from ai.constants import EMBED_MODEL, client


def embed_query(text: str) -> list[float]:
    response = client.embeddings.create(
        model=EMBED_MODEL,
        input=text.strip(),
    )
    return response.data[0].embedding


def retrieve_media(
    query_embedding: list[float],
    media_type: str | None = None,     # 'movie' | 'tv' | None
    top_k: int = 10
) -> list[int]:
    qs = (
        MediaEmbedding.objects
        .select_related('media')
        .annotate(distance=CosineDistance('embedding', query_embedding))
        .order_by('distance')
    )

    if media_type:
        qs = qs.filter(media__media_type=media_type)

    media_ids = qs.values_list('media_id', flat=True)[:top_k]

    return list(media_ids)


def rag_recommendations(
    query: str,
    media_type: str | None = None,
    top_k: int = 10
) -> list[int]:
    query_embedding = embed_query(query)
    return retrieve_media(query_embedding, media_type, top_k)
