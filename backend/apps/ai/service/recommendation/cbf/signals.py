from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from apps.media.models import Review, MediaInteraction
from .tasks import update_user_embedding_async

# from apps.ai.core.embedding_queue import mark_user_embedding_dirty


@receiver(post_save, sender=Review)
def trigger_user_embedding_by_review(sender, instance, created, **kwargs):
    if created:
        transaction.on_commit(
            lambda: update_user_embedding_async.delay(instance.user.id)
        )
    # update_fields = kwargs.get('update_fields')
    # if update_fields and 'rating' in update_fields:
    #     update_user_embedding_async.delay(instance.user.id)


@receiver(post_save, sender=MediaInteraction)
def trigger_user_embedding_by_interaction(sender, instance, created, **kwargs):
    if created:
        transaction.on_commit(
            lambda: update_user_embedding_async.delay(instance.user.id)
        )


# @receiver(post_save, sender=Review)
# def on_review_created(sender, instance, created, **kwargs):
#     if not created:
#         return
#     transaction.on_commit(
#         lambda uid=instance.user_id: mark_user_embedding_dirty(uid)
#     )


# @receiver(post_save, sender=MediaInteraction)
# def on_interaction_created(sender, instance, created, **kwargs):
#     if not created:
#         return
#     transaction.on_commit(
#         lambda uid=instance.user_id: mark_user_embedding_dirty(uid)
#     )
