import logging
from celery import shared_task, chain
from django.contrib.auth import get_user_model
from apps.ai.models import CFModel, UserEmbedding
from apps.ai.recommendation.hybrid.hybrid import get_activity_count
from apps.ai.recommendation.cbf.user_embedding import (
    build_user_embedding
)

logger = logging.getLogger(__name__)

USER_EMBEDDING_THRESHOLD = 3
SVD_RETRAIN_THRESHOLD = 30


@shared_task
def refresh_user_embedding_all_users_task():
    User = get_user_model()
    for user_id in User.objects.values_list("id", flat=True):
        maybe_refresh_user_embedding_task.delay(user_id)


@shared_task
def maybe_refresh_user_embedding_task(user_id: int):

    activity_count = get_activity_count(user_id=user_id)
    last_embedding = UserEmbedding.objects.filter(user_id=user_id).first()
    last_count = last_embedding.source_media_count if last_embedding else 0
    new_activity_delta = activity_count - last_count
    if new_activity_delta >= USER_EMBEDDING_THRESHOLD:
        chain(
            refresh_user_embedding_task.si(user_id),
            compute_cbf_score_task.si(user_id),
        ).delay()


@shared_task(bind=True)
def refresh_user_embedding_task(self, user_id: int) -> int:
    User = get_user_model()
    user = User.objects.get(id=user_id)
    result = build_user_embedding(user=user)
    if result is None:
        logger.info("Skip embedding: user=%s (no data)", user_id)
        return
    logger.info("User profile embedding completed: user=%s", user_id)
    return


@shared_task(bind=True)
def compute_cbf_score_task(self, user_id: int):
    from apps.ai.recommendation.cbf.cbf import cache_cbf_scores
    try:
        cache_cbf_scores(user_id=user_id)
        logger.info("CBF scores cache updated: user=%s", user_id)
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task
def maybe_retrain_svd_task():
    try:
        activity_count = get_activity_count(since=None, user_id=None)
        last_model = CFModel.objects.order_by('-created_at').first()
        last_count = getattr(
            last_model, 'rating_count', 0) if last_model else 0
        rating_delta = activity_count - last_count
        if rating_delta >= SVD_RETRAIN_THRESHOLD:
            chain(
                train_svd_task.s(),
                compute_cf_scores_all_task.s(),
            ).delay()
    except Exception as exc:
        logger.error("Error checking for SVD retraining: %s", exc)


@shared_task(bind=True, max_retries=2, default_retry_delay=120)
def train_svd_task(self) -> int:
    from apps.ai.recommendation.cf.svd_model import train_svd_model
    try:
        cf_model = train_svd_model()
        logger.info("SVD training completed: version=%s", cf_model.version)
        return cf_model.pk
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=2, default_retry_delay=60)
def compute_cf_scores_all_task(self, cf_model_pk: int):
    from apps.ai.recommendation.cf.cf import cache_cf_scores
    try:
        cf_model = CFModel.objects.get(pk=cf_model_pk)
        cache_cf_scores(cf_model)
        logger.info("CF scores cache updated: cf_model=%s", cf_model_pk)
    except Exception as exc:
        raise self.retry(exc=exc)
