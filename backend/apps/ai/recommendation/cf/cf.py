from apps.ai.models import CFModel
import pandas as pd
from apps.ai.recommendation.hybrid.score_cache import set_cf_scores


def build_prediction_scores(cf_model: CFModel) -> dict[int, pd.Series]:

    if cf_model is None:
        return {}
    svd_model = cf_model.get_model()
    trainset = svd_model.trainset

    # all_media_ids = [
    #     int(trainset.to_raw_iid(iid))
    #     for iid in trainset.all_items()
    # ]
    # all_users = [
    #     int(trainset.to_raw_uid(uid))
    #     for uid in trainset.all_users()
    # ]

    all_media_ids = list(map(
        int, map(trainset.to_raw_iid, trainset.all_items())
        ))
    all_users = list(map(int, map(trainset.to_raw_uid, trainset.all_users())))

    user_scores_map = {}

    for user_id in all_users:
        user_id = int(user_id)
        scores = {
            int(mid): svd_model.predict(user_id, mid).est
            for mid in all_media_ids
        }
        user_scores_map[user_id] = pd.Series(scores)
    return user_scores_map


def cache_cf_scores(cf_model: CFModel) -> None:
    all_scores = build_prediction_scores(cf_model)
    for user_id, series in all_scores.items():
        if series.empty:
            continue
        set_cf_scores(user_id, series)


"""
def get_cf_scores(
    user_id: int,
    cf_model: CFModel,
) -> pd.Series:

    if cf_model is None:
        return pd.Series(dtype=float)

    svd_model = cf_model.get_model()
    trainset = svd_model.trainset

    try:
        inner_uid = trainset.to_inner_uid(user_id)
    except ValueError:
        return pd.Series(dtype=float, name=f'cf_score_user_{user_id}')

    media_ids = {trainset.to_raw_iid(inner_id) for inner_id
                   in trainset.all_items()}

    scores = {mid: svd_model.predict(user_id, mid).est for mid in media_ids}

    return pd.Series(
            scores,
            name=f'cf_score_user_{user_id}'
    )

def cache_cf_scores(
    user_id: int,
    cf_model: CFModel,
) -> pd.Series:
    scores = get_cf_scores(user_id, cf_model)
    if scores.empty:
        return pd.Series(dtype=float)
    try:
        cf_model = CFModel.objects.latest()
    except CFModel.DoesNotExist:
        return pd.Series(dtype=float)

    set_cf_scores(user_id, scores)
    return scores
"""
