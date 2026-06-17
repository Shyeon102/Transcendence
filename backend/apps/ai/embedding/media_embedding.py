from apps.ai.models import MediaEmbedding
from django.db import transaction
from apps.ai.client import EMBEDDING_MODEL, client
from media.models import Media
from celery import shared_task
from django.db.models.signals import post_save
from django.dispatch import receiver

# def build_source_text(row) -> str:
#     return f"""
# Title: {row['title']}
# Type: {row['media_type']}
# Genres: {row['genres_text']}
# Director: {row['director']}
# Cast: {row['cast']}
# Country: {row['country']}
# Release Date: {row['release_date']}
# Rating: {row['avg_rating']} ({row['rating_count']} votes)
# Description:
# {row['description']}
# """


def build_source_text(media: Media) -> str:
    genres_text = ", ".join([genre.name for genre in media.genres.all()])
    return f"""
Title: {media.title}
Type: {media.media_type}
Genres: {genres_text}
Director: {media.director or 'Unknown'}
Cast: {media.cast or 'Unknown'}
Country: {media.country}
Rating: {media.avg_rating} ({media.rating_count} votes)
Description:
{media.description}
""".strip()


def get_embedding(text: str) -> list[float]:
    try:
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text
        )
        return response.embeddings[0].values
    except Exception as e:
        raise e


@shared_task(
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={'max_retries': 3}
)
def create_media_embedding_task(media_id):
    try:
        media = Media.objects.get(id=media_id)
    except Media.DoesNotExist:
        return
    text = build_source_text(media)
    vector = get_embedding(text)
    MediaEmbedding.objects.update_or_create(
        media=media,
        defaults={
            "embedding": vector,
            "source_text": text,
        }
    )


@receiver(post_save, sender=Media)
def media_saved(sender, instance, **kwargs):
    create_media_embedding_task.delay(instance.id)


# batch embedding for multiple media items


def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts
    )
    return [item.embedding for item in response.data]


BATCH_SIZE = 50


@shared_task(
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={'max_retries': 3}
)
def create_media_embeddings_batch(media_ids: list[int]):
    medias = (
        Media.objects
        .filter(id__in=media_ids)
        .prefetch_related("genres")
    )
    media_list = list(medias)
    if not media_list:
        return

    texts = [build_source_text(m) for m in media_list]

    vectors = get_embeddings_batch(texts)

    with transaction.atomic():
        for media, text, vector in zip(media_list, texts, vectors):
            MediaEmbedding.objects.update_or_create(
                media=media,
                defaults={
                    "embedding": vector,
                    "source_text": text,
                }
            )
# will be changed to redis.cache, need to look @lulu
# from django.core.cache import cache

# MEDIA_EMBEDDING_QUEUE_KEY = "media_embedding_queue"


# @receiver(post_save, sender=Media)
# def media_saved(sender, instance, created, **kwargs):
#     if not created:
#         return
#     queue = cache.get(MEDIA_EMBEDDING_QUEUE_KEY, [])
#     queue.append(instance.id)
#     cache.set(MEDIA_EMBEDDING_QUEUE_KEY, queue, timeout=3600)


# @shared_task
# def flush_media_embedding_queue():
#     queue = cache.get(MEDIA_EMBEDDING_QUEUE_KEY, [])
#     if not queue:
#         return
#     cache.set(MEDIA_EMBEDDING_QUEUE_KEY, [], timeout=3600)
#     create_media_embeddings_batch(queue)
