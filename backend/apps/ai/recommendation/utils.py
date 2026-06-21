from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import numpy as np


def calculate_sigmoid_weights(rating_count, center=5, k=0.3):
    cf_weight = 1 / (1 + np.exp(-k * (rating_count - center)))
    cb_weight = 1 - cf_weight

    return cf_weight, cb_weight


def normalize_scores(scores_series: pd.Series) -> pd.Series:

    if scores_series.empty or (scores_series.max() == scores_series.min()):
        return pd.Series(0.0, index=scores_series.index)

    values_2d = scores_series.values.reshape(-1, 1)

    scaler = MinMaxScaler()
    normalized_values = scaler.fit_transform(values_2d).flatten()

    return pd.Series(normalized_values, index=scores_series.index)
