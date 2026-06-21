from celery import shared_task
from apps.ai.service.recommendation.cf.svd_model import train_svd_model


@shared_task(name="apps.ai.service.recommendation.cf.tasks.run_svd_training")
def run_svd_training():
    train_svd_model()
