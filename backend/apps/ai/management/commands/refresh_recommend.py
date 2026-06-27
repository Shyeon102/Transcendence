# flake8: noqa
from django.core.management.base import BaseCommand
from apps.ai.recommendation.tasks import (
    refresh_user_embedding_task,
    compute_cbf_score_task,
    train_svd_task,
    compute_cf_scores_all_task,
)
from celery import chain


class Command(BaseCommand):
    help = "Manually trigger embedding/SVD refresh"

    def add_arguments(self, parser):
        parser.add_argument("--user-id", type=int, help="특정 유저 임베딩만 갱신")
        parser.add_argument("--svd", action="store_true", help="SVD 재학습 + CF 스코어 갱신")
        parser.add_argument("--all-users", action="store_true", help="전체 유저 임베딩 갱신")

    def handle(self, *args, **options):
        if options["user_id"]:
            user_id = options["user_id"]
            self.stdout.write(f"[*] user {user_id} 임베딩 갱신 시작...")
            chain(
                refresh_user_embedding_task.si(user_id),
                compute_cbf_score_task.si(user_id),
            ).delay()
            self.stdout.write(self.style.SUCCESS(f"[+] user {user_id} 태스크 enqueue 완료"))

        if options["svd"]:
            self.stdout.write("[*] SVD 재학습 시작...")
            chain(
                train_svd_task.si(),
                compute_cf_scores_all_task.si(),
            ).delay()
            self.stdout.write(self.style.SUCCESS("[+] SVD 태스크 enqueue 완료"))

        if options["all_users"]:
            from apps.users.models import User
            user_ids = User.objects.values_list("id", flat=True)
            for uid in user_ids:
                chain(
                    refresh_user_embedding_task.si(uid),
                    compute_cbf_score_task.si(uid),
                ).delay()
            self.stdout.write(self.style.SUCCESS(f"[+] {len(user_ids)}명 태스크 enqueue 완료"))

        if not any([options["user_id"], options["svd"], options["all_users"]]):
            self.stdout.write(self.style.WARNING("옵션을 지정하세요. --help 참고"))

"""
# 특정 유저 CBF 갱신
python manage.py refresh_recommend --user-id 42

# SVD 재학습
python manage.py refresh_recommend --svd

# 전체 유저 임베딩
python manage.py refresh_recommend --all-users

# 복합 실행도 가능
python manage.py refresh_recommend --user-id 42 --svd
"""