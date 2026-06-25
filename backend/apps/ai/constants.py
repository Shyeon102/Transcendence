EMB_DIM = 768
RATING_WEIGHT: dict[int, float] = {1: 0.0, 2: 0.2, 3: 0.5, 4: 0.8, 5: 1.0}
ACTION_WEIGHT: dict[str, float] = {'like': 0.7, 'dislike': 0.0}
