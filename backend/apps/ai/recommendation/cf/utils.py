import numpy as np


def calculate_sigmoid_weights(rating_count, center=50, k=0.1):
    cf_weight = 1 / (1 + np.exp(-k * (rating_count - center)))

    cb_weight = 1 - cf_weight

    return cf_weight, cb_weight


def get_watched_ids(user_id: int) -> set[int]:
    from media.models import Review, MediaInteraction

    review_ids = Review.objects.filter(user_id=user_id).values_list('media_id', flat=True)
    interaction_ids = MediaInteraction.objects.filter(user_id=user_id).values_list('media_id', flat=True)

    return set(review_ids) | set(interaction_ids)