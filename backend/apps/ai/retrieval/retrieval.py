from pgvector.django import CosineDistance
from media.models import Media, MediaEmbedding
from ai import EMBED_MODEL, client


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
) -> list[tuple[Media, float]]:
    qs = (
        MediaEmbedding.objects
        .select_related('media')
        .annotate(distance=CosineDistance('embedding', query_embedding))
        .order_by('distance')
    )

    if media_type:
        qs = qs.filter(media__media_type=media_type)

    results = []
    for emb in qs[:top_k]:
        similarity = round(1.0 - float(emb.distance), 4)
        results.append((emb.media, similarity))
        # results.append({
        #     "media_id": emb['media_id'],
        #     "similarity": similarity
        # })

    return results


def rag_recommendations(
    query: str,
    media_type: str | None = None,
    top_k: int = 10
) -> list[tuple[Media, float]]:
    query_embedding = embed_query(query)
    return retrieve_media(query_embedding, media_type).head(top_k)
