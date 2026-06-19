from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.media.models import Review, MediaInteraction
from .tasks import update_user_embedding_async

@receiver(post_save, sender=Review)
def trigger_embedding_by_review(sender, instance, created, **kwargs):
    if created:
        update_user_embedding_async.delay(instance.user.id)

    # update_fields = kwargs.get('update_fields')
    # if update_fields and 'rating' in update_fields:
    #     update_user_embedding_async.delay(instance.user.id)

@receiver(post_save, sender=MediaInteraction)
def trigger_embedding_by_interaction(sender, instance, created, **kwargs):
    if created:
        update_user_embedding_async.delay(instance.user.id)