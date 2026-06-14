
import numpy as np
from django.db.models import Prefetch

ACTION_WEIGHT = {
    "like": 1.0,
    "watchlist": 0.6,
    "dislike": 0.0,
}

def rating_to_weight(rating: int) -> float:
    mapping = {
        1: 0.0,
        2: 0.2,
        3: 0.5,
        4: 0.8,
        5: 1.0,
    }
    return mapping.get(rating, 0.5)

def build_user_embedding(user):
    vectors = []
    weights = []
    # 1. Review (explicit feedback)
    reviews = Review.objects.filter(user=user).select_related("media__embedding")
    for r in reviews:
        if not hasattr(r.media, "embedding"):
            continue
        emb_obj = r.media.embedding
        if not emb_obj:
            continue
        vectors.append(emb_obj.embedding)
        weights.append(rating_to_weight(r.rating))

    # 2. MediaInteraction (implicit feedback)
    interactions = MediaInteraction.objects.filter(user=user).select_related("media__embedding")

    for i in interactions:
        if not hasattr(i.media, "embedding"):
            continue

        emb_obj = i.media.embedding
        if not emb_obj:
            continue

        vectors.append(emb_obj.embedding)
        weights.append(ACTION_WEIGHT.get(i.action, 0))

    if not vectors:
        return None

    user_vector = np.average(vectors, axis=0, weights=weights~)

    return user_vector.tolist()


"""
save to db : need to be checked by backend team
"""
def save_user_embedding(user):
    vector = build_user_embedding(user)

    if vector is None:
        return None

    UserEmbedding.objects.update_or_create(
        user=user,
        defaults={"embedding": vector}
    )

    return vector

from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=Review)
@receiver(post_save, sender=MediaInteraction)
def update_user_embedding(sender, instance, **kwargs):
    save_user_embedding(instance.user)
