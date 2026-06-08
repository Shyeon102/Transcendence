import pandas as pd
from content_based import build_tfidf_matrix, get_cb_scores
from collaborative import build_matrix_factorization_scores
from utils import calculate_sigmoid_weights, normalize_scores


def get_hybrid_recommendations(user_id, user_ratings_db, movie_df):

    movie_matrix = build_tfidf_matrix(movie_df)
    user_ratings = user_ratings_db.get(user_id, {})

    if not user_ratings:
        return pd.Series(dtype=float)

    watched_movies = set(user_ratings.keys())

    if len(user_ratings_db) < 5:
        cf_weight = 0.0
        cb_weight = 1.0
    else:
        cf_weight, cb_weight = calculate_sigmoid_weights(len(user_ratings))

    cb_scores = get_cb_scores(user_ratings, movie_df, movie_matrix)
    if cf_weight == 0:
        return (
            cb_scores
            .drop(index=watched_movies, errors='ignore')
            .sort_values(ascending=False)
        )

    ml_predictions = build_matrix_factorization_scores(
        user_ratings_db, movie_df, latent_dim=12
    )
    cf_scores = ml_predictions.loc[user_id]

    cb_candidates = cb_scores.drop(index=watched_movies, errors='ignore')
    cf_candidates = cf_scores.drop(index=watched_movies, errors='ignore')

    cf_scores_norm = normalize_scores(cf_candidates)
    cb_scores_norm = normalize_scores(cb_candidates)

    hybrid_scores = (cb_weight * cb_scores_norm) + (cf_weight * cf_scores_norm)

    return hybrid_scores.sort_values(ascending=False)
