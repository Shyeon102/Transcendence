from pgvector.django import CosineDistance
import pandas as pd
from apps.ai.models import MediaEmbedding, UserEmbedding
from apps.ai.recommendation.hybrid.score_cache import set_cbf_scores


def get_cbf_scores(
    user_id: int,
) -> pd.Series:
    user_emb = UserEmbedding.objects.filter(user_id=user_id).first()
    if user_emb is None:
        return pd.Series(dtype=float)

    qs = MediaEmbedding.objects.annotate(
        score=1 - CosineDistance("embedding", user_emb.
                                 embedding)).values_list("media_id", "score")

    return pd.Series(dict(qs), name="cbf_score")


def cache_cbf_scores(user_id: int) -> pd.Series:
    scores = get_cbf_scores(user_id)
    if scores.empty:
        return pd.Series(dtype=float)
    set_cbf_scores(user_id, scores)
    return scores
