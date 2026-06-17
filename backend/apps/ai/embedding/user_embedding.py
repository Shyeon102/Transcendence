import numpy as np

from django.contrib.auth import get_user_model
from django.db import transaction

from ai.models import UserEmbedding, MediaEmbedding
from media.models import Review, MediaInteraction

from ai import RATING_WEIGHT, ACTION_WEIGHT


# ??
User = get_user_model()


def _gather_weighted_signals(user: User) -> list[tuple[int, float]]:
    signals: dict[int, list[float]] = {}

    for review in Review.objects.filter(user=user).values('media_id', 'rating'):
        w = RATING_WEIGHT.get(review['rating'], 0.0)
        signals.setdefault(review['media_id'], []).append(w)

    for interaction in MediaInteraction.objects.filter(user=user).values('media_id', 'action'):
        w = ACTION_WEIGHT.get(interaction['action'], 0.0)
        signals.setdefault(interaction['media_id'], []).append(w)

    return [(mid, float(np.mean(ws))) for mid, ws in signals.items()]


def build_user_embedding(user: User) -> UserEmbedding:

    weighted_signals = _gather_weighted_signals(user)
    if not weighted_signals:
        raise ValueError(f"User {user.pk} has no ratings or interactions yet.")

    media_ids = [mid for mid, _ in weighted_signals]
    weights   = {mid: w for mid, w in weighted_signals}

    # MediaEmbedding이 존재하는 항목만 필터
    embeddings_qs = (
        MediaEmbedding.objects
        .filter(media_id__in=media_ids)
        .values_list('media_id', 'embedding')
    )

    profile_vec = np.zeros(1536, dtype=np.float32)
    used_media: list[int] = []

    for media_id, emb in embeddings_qs:
        w = weights[media_id]
        if w > 0:                          # dislike(0.0) 제외
            profile_vec += w * np.array(emb, dtype=np.float32)
            used_media.append(media_id)

    if not used_media:
        raise ValueError(f"User {user.pk}: all interactions have weight 0 or no MediaEmbedding found.")

    # L2 정규화 (코사인 유사도를 위해)
    norm = np.linalg.norm(profile_vec)
    if norm > 0:
        profile_vec /= norm

    with transaction.atomic():
        obj, _ = UserEmbedding.objects.update_or_create(
            user=user,
            defaults={
                'embedding': profile_vec.tolist(),
                'source_media_count': len(used_media),
            },
        )
    return obj
