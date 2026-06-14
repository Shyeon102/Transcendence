from django.core.management.base import BaseCommand

from apps.media.models import Genre, Media


GENRES = [
    "Drama",
    "Sci-Fi",
    "Thriller",
    "Animation",
    "Indie",
    "Documentary",
]

MEDIA_SEED = [
    {
        "title": "Poor Things",
        "media_type": "movie",
        "genres": ["Indie", "Drama"],
        "country": "UK",
        "description": "A bold, genre-defying drama about rebirth and "
        "rebellion.",
        "image_url": "https://example.com/poor_things.jpg",
        "age_rating": "R",
        "language": "English",
        "runtime": 135,
        "side_poster_url": "https://example.com/poor_things_side.jpg",
    },
    {
        "title": "Dune: Part Two",
        "media_type": "movie",
        "genres": ["Sci-Fi", "Drama"],
        "country": "US",
        "description": "The next chapter in the epic sci-fi saga.",
        "image_url": "https://example.com/dune_two.jpg",
        "age_rating": "PG-13",
        "language": "English",
        "runtime": 155,
        "side_poster_url": "https://example.com/dune_two_side.jpg",
    },
    {
        "title": "Past Lives",
        "media_type": "movie",
        "genres": ["Drama", "Indie"],
        "country": "US",
        "description": "A tender drama that traces love across time and "
        "distance.",
        "image_url": "https://example.com/past_lives.jpg",
        "age_rating": "R",
        "language": "English",
        "runtime": 135,
        "side_poster_url": "https://example.com/poor_things_side.jpg",
    },
    {
        "title": "The Zone of Interest",
        "media_type": "movie",
        "genres": ["Drama"],
        "country": "UK",
        "description": "A powerful film about history, memory, and "
        "accountability.",
        "image_url": "https://example.com/the_zone_of_interest.jpg",
        "age_rating": "R",
        "language": "English",
        "runtime": 135,
        "side_poster_url": "https://example.com/poor_things_side.jpg",
    },
    {
        "title": "Perfect Days",
        "media_type": "movie",
        "genres": ["Documentary", "Drama"],
        "country": "JP",
        "description": "A quiet, contemplative portrait of ordinary life.",
        "image_url": "https://example.com/perfect_days.jpg",
        "age_rating": "R",
        "language": "English",
        "runtime": 135,
        "side_poster_url": "https://example.com/poor_things_side.jpg",
    },
    {
        "title": "Anora",
        "media_type": "movie",
        "genres": ["Thriller", "Indie"],
        "country": "US",
        "description": "A stylish thriller centered on a high-stakes revenge "
        "plot.",
        "image_url": "https://example.com/anora.jpg",
        "age_rating": "R",
        "language": "English",
        "runtime": 135,
        "side_poster_url": "https://example.com/poor_things_side.jpg",
    },
]


class Command(BaseCommand):
    help = "Seed the media database with example genres and titles for onboard"

    def handle(self, *args, **options):
        for name in GENRES:
            Genre.objects.get_or_create(name=name)

        self.stdout.write
        (self.style.SUCCESS(f"Ensured {len(GENRES)} genres exist."))

        created = 0
        updated = 0
        for item in MEDIA_SEED:
            title = item["title"]
            media_type = item.get("media_type", "movie")
            media, was_created = Media.objects.get_or_create(
                title=title,
                media_type=media_type,
                defaults={
                    "external_source": "manual",
                    "external_id": "",
                    "country": item.get("country", ""),
                    "description": item.get("description", ""),
                    "director": "",
                    "cast": "",
                    "image_url": item.get("image_url", ""),
                    "age_rating": item.get("age_rating", ""),
                    "language": item.get("language", ""),
                    "runtime": item.get("runtime"),
                    "side_poster_url": item.get("side_poster_url", ""),
                },
            )

            if was_created:
                created += 1
            else:
                changed = False
                for field in ("country", "description", "image_url"):
                    val = item.get(field)
                    if val and getattr(media, field) != val:
                        setattr(media, field, val)
                        changed = True
                if changed:
                    media.save()
                    updated += 1

            genre_objs = []
            for gname in item.get("genres", []):
                gobj, _ = Genre.objects.get_or_create(name=gname)
                genre_objs.append(gobj)
            if genre_objs:
                media.genres.set(genre_objs)

        self.stdout.write(self.style.
                          SUCCESS(f"Created {created} media items, updated"
                                  f"{updated} existing items."))
