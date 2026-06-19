from celery import shared_task
from apps.ai.recommendation.cf.svd.svd import train_svd_model


@shared_task(name="apps.ai.recommendation.cf.tasks.run_svd_training")
def run_svd_training():
    train_svd_model()