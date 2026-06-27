import pandas as pd
import math
from apps.ai.recommendation.hybrid.score_cache import (
    get_cbf_scores_cached, get_cf_scores_cached
)
from apps.media.models import Review, MediaInteraction
import logging

logger = logging.getLogger(__name__)

USER_EMBEDDING_THRESHOLD = 3


def get_user_exclude_ids(user_id: int) -> set[int]:
    review_ids = (
        Review.objects
        .filter(user_id=user_id)
        .values_list('media_id', flat=True)
    )
    interaction_ids = (
        MediaInteraction.objects
        .filter(user_id=user_id)
        .values_list('media_id', flat=True)
    )
    return set(review_ids) | set(interaction_ids)


def get_activity_count(since=None, user_id=None) -> int:
    review_qs = Review.objects.values_list("user_id", "media_id")
    interaction_qs = (
        MediaInteraction.objects
        .exclude(action="watched")
        .values_list("user_id", "media_id")
    )
    if since is not None:
        review_qs = review_qs.filter(created_at__gt=since)
        interaction_qs = interaction_qs.filter(created_at__gt=since)

    if user_id is not None:
        review_qs = review_qs.filter(user_id=user_id)
        interaction_qs = interaction_qs.filter(user_id=user_id)

    media_items = set(review_qs) | set(interaction_qs)

    return len(media_items)


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


def get_hybrid_scores(
    user_id: int,
) -> pd.Series:

    exclude_media_ids = get_user_exclude_ids(user_id)
    if exclude_media_ids is None:
        return pd.Series(dtype=float)

    user_rating_count = get_activity_count(user_id=user_id)
    if user_rating_count < USER_EMBEDDING_THRESHOLD:
        return pd.Series(dtype=float)

    cbf_series = get_cbf_scores_cached(user_id)
    cf_series = get_cf_scores_cached(user_id)

    if cbf_series.empty and cf_series.empty:
        return pd.Series(dtype=float)

    if cf_series.empty or cbf_series.empty:
        final_scores = cbf_series if cf_series.empty else cf_series
        if exclude_media_ids:
            final_scores = final_scores.drop(
                    exclude_media_ids, errors="ignore"
                )
        return final_scores

    cf_weight, cbf_weight = calculate_hybrid_weights(
        user_rating_count=user_rating_count,
        total_ratings_count=get_activity_count(since=None, user_id=None)
    )

    cf_scaled = min_max_scale(cf_series)
    cbf_scaled = min_max_scale(cbf_series)

    final_scores = (cf_scaled * cf_weight).add(
        cbf_scaled * cbf_weight,
        fill_value=0.0
    )
    if exclude_media_ids:
        final_scores = final_scores.drop(exclude_media_ids, errors="ignore")

    return final_scores.sort_values(ascending=False)
