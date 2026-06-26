# flake8: noqa
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.media.models import Media, Review
import random

User = get_user_model()


class Command(BaseCommand):
    help = "Seed single user ratings for CBF test"

    def handle(self, *args, **kwargs):
        user, created = User.objects.get_or_create(
            username="cbf_user",
            defaults={
                "email": "cbf@test.com",
                "onboarding_completed": True,
            }
        )

        if created:
            user.set_password("test1234")
            user.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f"Created user: id={user.id}, username={user.username}"
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    f"Using existing user: id={user.id}, username={user.username}"
                )
            )

        # 기존 리뷰 삭제
        Review.objects.filter(user=user).delete()

        # 앞의 20개 미디어에 리뷰 생성
        media_list = list(Media.objects.all()[:20])

        for media in media_list:
            Review.objects.create(
                user=user,
                media=media,
                rating=random.choice([3, 4, 5]),
                content="Seed review for recommendation test.",
                images=[],
                visibility="public",
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {len(media_list)} reviews for user {user.id}"
            )
        )