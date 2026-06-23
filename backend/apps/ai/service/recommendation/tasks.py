import logging
from celery import shared_task, chain
from django.contrib.auth import get_user_model
from apps.ai.models import CFModel
from apps.ai.service.recommendation.recommendations import get_activity_count
from apps.ai.service.recommendation.cbf.user_embedding import (
    build_user_embedding
)

logger = logging.getLogger(__name__)
User = get_user_model()

USER_EMBEDDING_THRESHOLD = 5
SVD_RETRAIN_THRESHOLD = 50


@shared_task
def maybe_refresh_user_embedding_task(user_id: int):

    activity_count = get_activity_count(user_id=user_id)
    if activity_count > 0 and activity_count % USER_EMBEDDING_THRESHOLD == 0:
        chain(
            refresh_user_embedding_task.s(user_id),
            compute_cbf_score_task.s(),
        ).delay()


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def refresh_user_embedding_task(self, user_id: int) -> int:
    try:
        build_user_embedding(user_id)
        logger.info("User profile embedding completed: user=%s", user_id)
        return user_id
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def compute_cbf_score_task(self, user_id: int):
    from apps.ai.service.recommendation.cbf.cbf import cache_cbf_scores
    try:
        cache_cbf_scores(user_id)
        logger.info("CBF scores cache updated: user=%s", user_id)
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task
def maybe_retrain_svd_task():
    activity_count = get_activity_count(since=None, user_id=None)

    if activity_count < SVD_RETRAIN_THRESHOLD:
        return
    if activity_count % SVD_RETRAIN_THRESHOLD != 0:
        return

    try:
        last_model = CFModel.objects.latest()
        new_ratings = get_activity_count(
            since=last_model.created_at, user_id=None
            )
        if new_ratings < SVD_RETRAIN_THRESHOLD:
            return
    except CFModel.DoesNotExist:
        pass  # 1st model training

    chain(
        train_svd_task.s(),
        compute_cf_scores_all_task.s(),
    ).delay()


@shared_task(bind=True, max_retries=2, default_retry_delay=120)
def train_svd_task(self) -> int:
    from apps.ai.service.recommendation.cf.svd_model import train_svd_model
    try:
        cf_model = train_svd_model()
        logger.info("SVD training completed: version=%s", cf_model.version)
        return cf_model.pk
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=2, default_retry_delay=60)
def compute_cf_scores_all_task(self, cf_model_pk: int):
    from apps.ai.service.recommendation.cf.cf import cache_cf_scores
    try:
        cf_model = CFModel.objects.get(pk=cf_model_pk)
        cache_cf_scores(cf_model)
        logger.info("CF scores cache updated: cf_model=%s", cf_model_pk)
    except Exception as exc:
        raise self.retry(exc=exc)
