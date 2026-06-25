import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import models

from apps.media.management.commands.seed_media import MEDIA_SEED
from apps.media.models import Media, Review

REVIEWER_COUNT = 6
REVIEW_TEXTS = [
    "A powerful story with unforgettable characters.",
    "Beautiful visuals and a really strong emotional core.",
    "The pacing was great and the acting felt very natural.",
    "I loved how this film blended genre elements together.",
    "Not perfect, but still a very rewarding watch.",
    "The soundtrack was incredible and really elevated the scenes.",
    "Some parts felt slow, but the ending made it worth it.",
    "A thoughtful movie with a lot of heart and sincerity.",
    "The world-building was excellent and immersive.",
    "One of the most interesting stories I've seen in a long time.",
    "This one has a strong voice and a memorable visual style.",
    "It kept me engaged from beginning to end.",
    "A creative take on a familiar concept, executed well.",
    "The performances were top-notch and very believable.",
    "A nice mix of tension, humor, and emotion.",
    "The dialogue felt sharp and the themes resonated strongly.",
    "Well-directed and beautifully shot.",
    "A refreshingly original story with great characters.",
    "I would definitely watch this again.",
    "An impressive film that stayed with me after it ended.",
]
VISIBILITIES = ["public", "followers", "private"]


class Command(BaseCommand):
    help = "Seed sample reviews for seeded media and users."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=20,
            help="Number of reviews to create.",
        )
        parser.add_argument(
            "--users",
            type=int,
            default=REVIEWER_COUNT,
            help="Number of reviewer users to create.",
        )

    def handle(self, *args, **options):
        review_count = options["count"]
        user_count = options["users"]
        User = get_user_model()

        users = []
        for i in range(1, user_count + 1):
            username = f"reviewer{i}"
            user = User.objects.filter(username=username).first()
            if not user:
                user = User.objects.create_user(
                    username=username,
                    email=f"{username}@example.com",
                    password="password123",
                )
            users.append(user)

        media_items = []
        for item in MEDIA_SEED:
            media = Media.objects.filter(
                title=item["title"], media_type=item.get("media_type", "movie")
            ).first()
            if media:
                media_items.append(media)

        if not media_items:
            self.stdout.write(self.style.ERROR(
                "No seeded media found. Run `manage.py seed_media` first."
            ))
            return

        random.seed(42)
        created = 0
        updated = 0
        used_pairs = set()

        while created + updated < review_count:
            user = random.choice(users)
            media = random.choice(media_items)
            pair = (user.id, media.id)
            if pair in used_pairs:
                continue
            used_pairs.add(pair)

            rating = random.randint(1, 5)
            content = random.choice(REVIEW_TEXTS)
            visibility = random.choices(VISIBILITIES, weights=[70, 20, 10])[0]

            review, was_created = Review.objects.update_or_create(
                user=user,
                media=media,
                defaults={
                    "rating": rating,
                    "content": content,
                    "visibility": visibility,
                    "images": [],
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        for media in media_items:
            reviews = media.reviews.all()
            if reviews.exists():
                summary = reviews.aggregate(
                    avg=models.Avg("rating"), count=models.Count("id")
                )
                media.avg_rating = summary["avg"] or 0
                media.rating_count = summary["count"]
                media.save(update_fields=["avg_rating", "rating_count"])

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {created} new reviews and updated {updated} existing."
        ))
