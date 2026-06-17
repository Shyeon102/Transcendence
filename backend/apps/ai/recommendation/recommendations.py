import pandas as pd
from ai.models import CFModel

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

    # cf_weight, cbf_weight = calculate_sigmoid_weights(rating_count=cf_model.user_count)
    
    cf_series = get_cf_scores(user_id=user_id, exclude_media_ids=exclude_media_ids)
    cbf_series = get_cbf_scores(user_id=user_id, exclude_media_ids=exclude_media_ids)

    if cf_series.empty: return cbf_series.sort_values(ascending=False).head(top_k)
    if cbf_series.empty: return cf_series.sort_values(ascending=False).head(top_k)

    cf_scaled = min_max_scale(cf_series)
    cbf_scaled = min_max_scale(cbf_series)

    final_scores = (cf_scaled * cf_weight).add(
        cbf_scaled * cbf_weight, 
        fill_value=0.0
    )
    
    final_scores.name = f"hybrid_score_user_{user_id}"
    return final_scores.sort_values(ascending=False).head(top_k)