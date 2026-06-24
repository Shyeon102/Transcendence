from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.media.models import Review, MediaInteraction
from apps.ai.recommendation.tasks import (
    maybe_refresh_user_embedding_task, maybe_retrain_svd_task
)


@receiver(post_save, sender=Review)
@receiver(post_save, sender=MediaInteraction)
def on_activity_saved(sender, instance, created, **kwargs):
    if not created:
        return
    maybe_refresh_user_embedding_task.delay(instance.user_id)
    maybe_retrain_svd_task.delay()
