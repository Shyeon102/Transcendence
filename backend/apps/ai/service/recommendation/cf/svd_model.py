from surprise import SVD, Dataset, Reader
from django.utils import timezone
import pandas as pd
from apps.ai.models import CFModel
from apps.ai.constants import RATING_WEIGHT, ACTION_WEIGHT
import hashlib
import logging

MIN_RATINGS_FOR_TRAINING = 50
logger = logging.getLogger(__name__)


def build_ratings_df() -> pd.DataFrame:
    from apps.media.models import Review, MediaInteraction

    review_qs = (
        Review.objects
        .values_list('user_id', 'media_id', 'rating')
        .iterator()
    )

    interaction_qs = (
        MediaInteraction.objects
        .values_list('user_id', 'media_id', 'action')
        .iterator()
    )

    if not review_qs and not interaction_qs:
        return pd.DataFrame(columns=['uid', 'iid', 'rating'])

    frames = []

    if review_qs:
        df_rev = pd.DataFrame(review_qs, columns=['uid', 'iid', 'rating_raw'])
        df_rev['weight'] = df_rev['rating_raw'].map(RATING_WEIGHT)
        frames.append(df_rev[['uid', 'iid', 'weight']])

    if interaction_qs:
        df_int = pd.DataFrame(
            interaction_qs,
            columns=['uid', 'iid', 'action_raw']
        )
        df_int['weight'] = df_int['action_raw'].map(ACTION_WEIGHT).fillna(0.0)
        frames.append(df_int[['uid', 'iid', 'weight']])

    total_df = pd.concat(frames, ignore_index=True)
    final_df = (
        total_df
        .groupby(['uid', 'iid'], as_index=False)['weight']
        .mean()
    )
    final_df.rename(columns={'weight': 'rating'}, inplace=True)

    return final_df


def train_svd_model(latent_dim: int = 12) -> CFModel | None:
    ratings_df = build_ratings_df()
    current_ratings_count = len(ratings_df)

    # if current_ratings_count < MIN_RATINGS_FOR_TRAINING:
    #     logger.info("Not enough ratings to train (%d < %d)",
    #                 current_ratings_count, MIN_RATINGS_FOR_TRAINING)
    #     return None

    # last_model = CFModel.objects.order_by('-created_at').first()
    # if last_model and current_ratings_count <= last_model.rating_count:
    #     logger.info("No new ratings since last model. Skipping.")
    #     return None

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
        f"{timezone.now().isoformat()}-{current_ratings_count}".encode()
    ).hexdigest()[:12]

    return CFModel.save_model(
        svd_model=model,
        version=version,
        user_count=ratings_df['uid'].nunique(),
        item_count=ratings_df['iid'].nunique(),
        rating_count=current_ratings_count,
        latent_dim=latent_dim,
    )
