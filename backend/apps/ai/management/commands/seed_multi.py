# flake8: noqa
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.media.models import Media, Review
import random

User = get_user_model()


class Command(BaseCommand):
    help = "Seed 10 users with 10 reviews each (CF test)"

    def handle(self, *args, **kwargs):
        media_list = list(Media.objects.all())

        if len(media_list) < 10:
            self.stdout.write(
                self.style.ERROR("Media가 10개 이상 있어야 합니다.")
            )
            return

        total_reviews = 0

        for i in range(10):
            user, created = User.objects.get_or_create(
                username=f"cf_user_{i+1}",
                defaults={
                    "email": f"cf_user_{i+1}@test.com",
                    "onboarding_completed": True,
                },
            )

            if created:
                user.set_password("test1234")
                user.save()

            # 기존 리뷰 삭제
            Review.objects.filter(user=user).delete()

            # 중복 없이 10개 선택
            sampled_media = random.sample(media_list, 10)

            for media in sampled_media:
                Review.objects.create(
                    user=user,
                    media=media,
                    rating=random.randint(1, 5),
                    content="CF seed review",
                    images=[],
                    visibility="public",
                )
                total_reviews += 1

            self.stdout.write(
                f"User {user.id} ({user.username}) -> {len(sampled_media)} reviews created"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nCompleted!\n"
                f"Users: 10\n"
                f"Reviews: {total_reviews}"
            )
        )