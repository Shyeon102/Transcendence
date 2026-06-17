from ai.models import CFModel
import pandas as pd


def get_cf_scores(
    user_id: int,
    cf_model: CFModel,
    exclude_media_ids: list[int] | None = None
) -> pd.Series:

    if cf_model is None:
        return pd.Series(dtype=float)

    svd_model = cf_model.get_model()

    all_mid_set = {svd_model.trainset.to_raw_iid(inner_id) for inner_id
                   in svd_model.trainset.all_items()}
    if exclude_media_ids:
        target_ids = all_mid_set - set(exclude_media_ids)
    else:
        target_ids = all_mid_set

    scores = {mid: svd_model.predict(user_id, mid).est for mid in target_ids}

    return pd.Series(scores, name=f'cf_score_user_{user_id}')
