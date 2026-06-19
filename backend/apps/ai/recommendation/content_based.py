from sklearn.preprocessing import normalize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np


def build_tfidf_matrix(df):

    df["soup"] = (
        (df["genres"] + " ") * 3
        + (df["director"] + " ") * 2
        # + (df["keywords"] + " ") * 2
        + df["description"]
    )

    tfidf = TfidfVectorizer(
        analyzer="word",
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True,
    )
    matrix = tfidf.fit_transform(df["soup"].fillna(""))
    return matrix


def build_user_profile(
    user_ratings: dict[int, float],
    df: pd.DataFrame,
    movie_matrix: np.ndarray
) -> np.ndarray:

    if not user_ratings:
        return None

    rated_ids = [mid for mid in user_ratings if mid in df.index]
    if not rated_ids:
        return None

    ratings = np.array([user_ratings[mid] for mid in rated_ids], dtype=float)
    weights = ratings - ratings.mean()
    if np.all(weights == 0):
        weights = np.ones_like(weights)

    indices = df.index.get_indexer(rated_ids)
    movie_vecs = movie_matrix[indices]

    profile = np.asarray(weights @ movie_vecs)  # sparse → dense
    if profile.ndim == 1:
        profile = profile.reshape(1, -1)

    return normalize(profile)


def get_cb_scores(
    user_ratings: dict[int, float],
    df: pd.DataFrame,
    movie_matrix: np.ndarray
) -> pd.Series:

    user_profile = build_user_profile(user_ratings, df, movie_matrix)
    if user_profile is None:
        return None

    similarities = cosine_similarity(user_profile, movie_matrix).flatten()

    return pd.Series(data=similarities, index=df.index)
