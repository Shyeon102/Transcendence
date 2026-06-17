from surprise import SVD, Dataset, Reader
from surprise.dump import dump, load
import pandas as pd
from ai.models import CFModel
from ai import RATING_WEIGHT, ACTION_WEIGHT



def build_ratings_df() -> pd.DataFrame:
    from media.models import Review, MediaInteraction

    records: dict[tuple, list[float]] = {}

    for r in Review.objects.values('user_id', 'media_id', 'rating'):
        key = (r['user_id'], r['media_id'])
        records.setdefault(key, []).append(RATING_WEIGHT[r['rating']])

    for i in MediaInteraction.objects.values('user_id', 'media_id', 'action'):
        w = ACTION_WEIGHT.get(i['action'], 0.0)
        key = (i['user_id'], i['media_id'])
        records.setdefault(key, []).append(w)

    rows = [
        {'uid': uid, 'iid': mid, 'rating': float(np.mean(ws))}
        for (uid, mid), ws in records.items()
    ]
    return pd.DataFrame(rows)


def train_svd_model(ratings_df, latent_dim=12):

    reader = Reader(rating_scale=(0.0, 1.0))
    data = Dataset.load_from_df(ratings_df, reader)

    model = SVD(
        n_factors=latent_dim,
        n_epochs=50,
        lr_all=0.005,
        reg_all=0.02,
        random_state=42,
        biased=True,
    )
    trainset = data.build_full_trainset()
    model.fit(trainset)

    return model

def train_svd_model(latent_dim=12):
    ratings_df = build_ratings_df()

    reader = Reader(rating_scale=(0.0, 1.0))
    data = Dataset.load_from_df(ratings_df[['uid', 'iid', 'rating']], reader)

    model = SVD(
        n_factors=latent_dim,
        n_epochs=50,
        lr_all=0.005,
        reg_all=0.02,
        random_state=42,
        biased=True,
    )
    model.fit(data.build_full_trainset())

    version = hashlib.sha1(
        f"{datetime.utcnow().isoformat()}-{len(df)}".encode()
    ).hexdigest()[:12]

    return CFModel.save_model(
        svd_model=svd,
        version=version,
        user_count=df['uid'].nunique(),
        item_count=df['iid'].nunique(),
        latent_dim=latent_dim,
    )

