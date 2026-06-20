import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import models

from apps.media.management.commands.seed_media import MEDIA_SEED
from apps.media.models import Media, Review

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
    help = "Seed demo users and sample media reviews."

    def add_arguments(self, parser):
        parser.add_argument(
            "--users",
            type=int,
            default=50,
            help="Number of demo users to create.",
        )
        parser.add_argument(
            "--reviews",
            type=int,
            default=120,
            help="Number of reviews to generate.",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="password123",
            help="Password for generated demo users.",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=42,
            help="Random seed for deterministic demo data.",
        )
        parser.add_argument(
            "--seeded-media",
            action="store_true",
            help="Create reviews only for the seeded media list.",
        )

    def handle(self, *args, **options):
        user_count = options["users"]
        review_count = options["reviews"]
        password = options["password"]
        seed = options["seed"]
        use_seeded_media = options["seeded_media"]

        User = get_user_model()
        random.seed(seed)

        users = []
        for i in range(1, user_count + 1):
            username = f"reviewer{i}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@example.com",
                    "is_active": True,
                },
            )
            if created:
                user.set_password(password)
                user.save(update_fields=["password"])
            users.append(user)

        if use_seeded_media:
            media_titles = [item["title"] for item in MEDIA_SEED]
            media_items = list(Media.objects.filter(title__in=media_titles))
        else:
            media_items = list(Media.objects.all())

        if not media_items:
            self.stdout.write(self.style.ERROR(
                "No media items available. Run `manage.py seed_media` or create media first."
            ))
            return

        max_pairs = len(users) * len(media_items)
        if review_count > max_pairs:
            self.stdout.write(self.style.WARNING(
                f"Requested {review_count} reviews, but only {max_pairs} unique user/media pairs are possible."
            ))
            review_count = max_pairs

        existing_pairs = set(
            Review.objects.filter(user__in=users, media__in=media_items)
            .values_list("user_id", "media_id")
        )
        used_pairs = set(existing_pairs)
        created = 0
        updated = 0
        attempts = 0
        max_attempts = review_count * 10

        while created + updated < review_count and attempts < max_attempts:
            attempts += 1
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

        if created + updated < review_count:
            self.stdout.write(self.style.WARNING(
                "Could not create the requested number of unique reviews."
            ))

        for media in media_items:
            summary = media.reviews.aggregate(
                avg=models.Avg("rating"),
                count=models.Count("id"),
            )
            media.avg_rating = summary["avg"] or 0
            media.rating_count = summary["count"]
            media.save(update_fields=["avg_rating", "rating_count"])

        self.stdout.write(self.style.SUCCESS(
            f"Created or updated {created + updated} reviews for {len(users)} users across {len(media_items)} media items."
        ))
        self.stdout.write(self.style.SUCCESS(
            f"New users created: {sum(1 for u in users if u.date_joined and u.username.startswith('reviewer'))}."
        ))
