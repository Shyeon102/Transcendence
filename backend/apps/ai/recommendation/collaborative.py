from surprise import SVD, Dataset, Reader
import pandas as pd


def build_matrix_factorization_scores(
    user_ratings_db,
    df_movie,
    latent_dim=12
) -> pd.DataFrame:
    records = [
        (uid, int(mid), float(score))
        for uid, ratings in user_ratings_db.items()
        for mid, score in ratings.items()
    ]
    df_records = pd.DataFrame(records, columns=["uid", "iid", "rating"])

    all_scores = df_records["rating"].tolist()
    reader = Reader(rating_scale=(min(all_scores), max(all_scores)))
    data = Dataset.load_from_df(df_records, reader)

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

    movie_ids = df_movie.index.astype(int).tolist()
    user_ids = list(user_ratings_db.keys())

    predictions = [
        [model.predict(uid, mid).est for mid in movie_ids]
        for uid in user_ids
    ]

    return pd.DataFrame(predictions, index=user_ids, columns=movie_ids)
