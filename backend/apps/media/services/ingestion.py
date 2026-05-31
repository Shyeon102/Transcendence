from django.db import transaction

from apps.media.models import Genre, Media


def upsert_media_item(item: dict) -> tuple[Media, bool]:
    genre_names = item.pop("genres", [])

    with transaction.atomic():
        media, created = Media.objects.update_or_create(
            external_source=item["external_source"],
            external_id=item["external_id"],
            defaults=item,
        )

        genres = []
        for name in genre_names:
            if not name:
                continue
            genre, _ = Genre.objects.get_or_create(name=name)
            genres.append(genre)
        media.genres.set(genres)

    return media, created


def upsert_media_items(items: list[dict]) -> dict:
    created = 0
    updated = 0

    for item in items:
        _, was_created = upsert_media_item(item.copy())
        if was_created:
            created += 1
        else:
            updated += 1

    return {"created": created, "updated": updated, "total": len(items)}
