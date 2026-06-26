import json
import logging
import pandas as pd
from django.core.cache import cache

logger = logging.getLogger(__name__)

CBF_KEY = "rec:cbf:{user_id}"
CF_KEY = "rec:cf:{user_id}"


def set_cbf_scores(user_id: int, scores: pd.Series) -> None:
    key = CBF_KEY.format(user_id=user_id)
    data = {str(k): round(float(v), 6) for k, v in scores.items()}
    cache.set(key, json.dumps(data), timeout=3600)


def set_cf_scores(user_id: int, scores: pd.Series) -> None:
    key = CF_KEY.format(user_id=user_id)
    data = {str(k): round(float(v), 6) for k, v in scores.items()}
    cache.set(key, json.dumps(data), timeout=3600)


def get_cbf_scores_cached(user_id: int) -> pd.Series:
    raw = cache.get(CBF_KEY.format(user_id=user_id))
    if not raw:
        return pd.Series(dtype=float)
    return pd.Series(json.loads(raw), dtype=float)


def get_cf_scores_cached(user_id: int) -> pd.Series:
    cached = cache.get(CF_KEY.format(user_id=user_id))
    if not cached:
        return pd.Series(dtype=float)
    data = json.loads(cached)
    s = pd.Series(data, dtype=float)
    s.index = s.index.astype(int)  # str → int
    return s


def delete_user_scores(user_id: int) -> None:
    cache.delete_many([
        CBF_KEY.format(user_id=user_id),
        CF_KEY.format(user_id=user_id),
    ])
