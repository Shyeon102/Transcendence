from pgvector.django import CosineDistance
import pandas as pd
from embedding.models import MediaEmbedding, UserEmbedding


def get_user_profile(user_id: int):
    try:
        return UserEmbedding.objects.get(user_id=user_id).embedding
    except UserEmbedding.DoesNotExist:
        return None


def get_cb_scores(user_id: int):
    user_profile = get_user_profile(user_id)
    if user_profile is None:
        return None

    results = MediaEmbedding.objects.annotate(
        score=1 - CosineDistance("embedding", user_profile)
    ).values("media_id", "score")

    df = pd.DataFrame(list(results)).set_index("media_id")
    return df["score"]
