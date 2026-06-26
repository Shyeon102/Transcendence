from django.core.management.base import BaseCommand
from apps.media.models import Review
from apps.ai.models import User
from apps.ai.models import UserEmbedding, CFModel
from apps.ai.recommendation.hybrid.score_cache import delete_user_scores
from django.core.cache import cache


class Command(BaseCommand):
    help = "Full reset CF experiment environment"

    def handle(self, *args, **kwargs):

        # 1) 대상 seed users 먼저 "메모리로 고정"
        seed_users = list(
            User.objects.filter(username__startswith="cf_user_")
        )
        user_ids = [u.id for u in seed_users]

        self.stdout.write(f"Found users: {len(user_ids)}")

        if not user_ids:
            self.stdout.write(self.style.WARNING("No CF seed users found."))
            return

        # 2) CACHE / REDIS 제거 (user scores 등)
        self.stdout.write("Clearing cache / redis scores...")

        for user_id in user_ids:
            delete_user_scores(user_id)

        # 전체 캐시 flush (CF 실험이면 안전)
        cache.clear()

        # 3) Review 삭제
        deleted_reviews, _ = Review.objects.filter(
            user_id__in=user_ids
        ).delete()

        # 4) Embedding 삭제
        deleted_embeddings, _ = UserEmbedding.objects.filter(
            user_id__in=user_ids
        ).delete()

        # 5) CF 모델 삭제
        deleted_models, _ = CFModel.objects.all().delete()

        # 6) User 삭제
        deleted_users, _ = User.objects.filter(
            id__in=user_ids
        ).delete()

        self.stdout.write(
            self.style.SUCCESS(
                "\n=== CF RESET DONE ===\n"
                f"Users deleted: {deleted_users}\n"
                f"Reviews deleted: {deleted_reviews}\n"
                f"Embeddings deleted: {deleted_embeddings}\n"
                f"CF Models deleted: {deleted_models}\n"
            )
        )
