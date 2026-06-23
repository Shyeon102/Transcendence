import numpy as np
from apps.users.models import User
from apps.ai.models import UserEmbedding, MediaEmbedding
from apps.media.models import Review, MediaInteraction

EMB_DIM = 768
RATING_WEIGHT: dict[int, float] = {1: 0.0, 2: 0.2, 3: 0.5, 4: 0.8, 5: 1.0}
ACTION_WEIGHT: dict[str, float] = {'like': 0.7, 'dislike': 0.0}


def gather_weighted_signals(user: User) -> list[tuple[int, float]]:
    signals: dict[int, list[float]] = {}

    for review in (
        Review.objects.filter(user=user).values('media_id', 'rating')
    ):
        w = RATING_WEIGHT.get(review['rating'], 0.0)
        signals.setdefault(review['media_id'], []).append(w)

    for interaction in (
        MediaInteraction.objects.filter(user=user).values('media_id', 'action')
    ):
        w = ACTION_WEIGHT.get(interaction['action'], 0.0)
        signals.setdefault(interaction['media_id'], []).append(w)

    return [(mid, float(np.mean(ws))) for mid, ws in signals.items()]


def build_user_embedding(user: User) -> UserEmbedding:

    weighted_signals = gather_weighted_signals(user)
    if not weighted_signals:
        raise ValueError(f"User {user.pk} has no ratings or interactions yet.")

    media_ids = [mid for mid, _ in weighted_signals]
    weights = {mid: w for mid, w in weighted_signals}

    # MediaEmbedding이 존재하는 항목만 필터
    embeddings_qs = (
        MediaEmbedding.objects
        .filter(media_id__in=media_ids)
        .values_list('media_id', 'embedding')
    )

    profile_vec = np.zeros(EMB_DIM, dtype=np.float32)
    used_media: list[int] = []

    for media_id, emb in embeddings_qs:
        w = weights[media_id]
        if w > 0:                          # dislike(0.0) 제외
            profile_vec += w * np.array(emb, dtype=np.float32)
            used_media.append(media_id)

    if not used_media:
        raise ValueError(f"User {user.pk}: all interactions have weight 0 or"
                         "no MediaEmbedding found.")

    # L2 정규화 (코사인 유사도를 위해)
    norm = np.linalg.norm(profile_vec)
    if norm > 0:
        profile_vec /= norm

    obj, _ = UserEmbedding.objects.update_or_create(
        user=user,
        defaults={
            'embedding': profile_vec.tolist(),
            'source_media_count': len(used_media),
        },
    )
    return obj
