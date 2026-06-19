import pandas as pd
from apps.ai.models import CFModel
from apps.ai.recommendation.cbf.cbf import get_cbf_scores
from apps.ai.recommendation.cf.cf import get_cf_scores
import math


def calculate_hybrid_weights(
    user_rating_count: int,
    total_ratings_count: int,
    k_user: float = 10.0,
    k_total: float = 100.0,
) -> tuple[float, float]:

    system_confidence = 1 - math.exp(-total_ratings_count / k_total)
    user_confidence = 1 - math.exp(-user_rating_count / k_user)

    cf_weight = user_confidence * system_confidence
    cf_weight = max(0.0, min(cf_weight, 0.85))

    return cf_weight, 1 - cf_weight


def min_max_scale(series: pd.Series) -> pd.Series:
    if series.empty:
        return series

    min_val = series.min()
    max_val = series.max()

    if max_val == min_val:
        return pd.Series(0.5, index=series.index, name=series.name)

    return (series - min_val) / (max_val - min_val)


def get_hybrid_recommendations(
    user_id: int,
    cf_model: CFModel,
    exclude_media_ids: list[int] | None = None,
    cf_weight: float = 0.6,
    cbf_weight: float = 0.4,
    top_k: int = 50
) -> pd.Series:

    if exclude_media_ids is None:
        return pd.Series(dtype=float)

    cf_series, user_rating_count = get_cf_scores(user_id=user_id, cf_model=cf_model,
                              exclude_media_ids=exclude_media_ids)
    cbf_series = get_cbf_scores(user_id=user_id,
                                exclude_media_ids=exclude_media_ids)
    if cf_series.empty:
        return cbf_series.sort_values(ascending=False).head(top_k)
    if cbf_series.empty:
        return cf_series.sort_values(ascending=False).head(top_k)

    cf_weight, cbf_weight = calculate_hybrid_weights(
        user_rating_count=user_rating_count,
        total_ratings_count=cf_model.get_item_count()
    )

    cf_scaled = min_max_scale(cf_series)
    cbf_scaled = min_max_scale(cbf_series)

    final_scores = (cf_scaled * cf_weight).add(
        cbf_scaled * cbf_weight,
        fill_value=0.0
    )

    final_scores.name = f"hybrid_score_user_{user_id}"
    return final_scores.sort_values(ascending=False).head(top_k)
