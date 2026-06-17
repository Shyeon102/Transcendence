from pgvector.django import CosineDistance
import pandas as pd
from embedding.models import MediaEmbedding, UserEmbedding


def get_cbf_scores(
    user_id: int,
    exclude_media_ids: list[int] | None = None
) -> pd.Series:
    user_emb = UserEmbedding.objects.filter(user_id=user_id).first()
    if user_emb is None:
        return pd.Series(dtype=float)

    qs = MediaEmbedding.objects.annotate(
        score=1 - CosineDistance("embedding", user_emb.
                                 embedding)).values_list("media_id", "score")

    if exclude_media_ids:
        qs = qs.exclude(media_id__in=exclude_media_ids)

    scores_dict = dict(qs)

    return pd.Series(scores_dict, name="cbf_score")