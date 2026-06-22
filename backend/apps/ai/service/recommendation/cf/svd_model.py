from surprise import SVD, Dataset, Reader
from django.utils import timezone
import pandas as pd
from apps.ai.models import CFModel
from apps.ai.constants import RATING_WEIGHT, ACTION_WEIGHT
import hashlib

MIN_RATINGS_FOR_TRAINING = 50


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


def train_svd_model(latent_dim=12):
    last_model = CFModel.objects.order_by('-created_at').first()

    ratings_df = build_ratings_df()
    current_ratings_count = len(ratings_df)

    if last_model:
        last_model_ratings_count = last_model.get_item_count()
        if current_ratings_count <= last_model_ratings_count:
            print("No new ratings since last model. Skipping training.")
            return None

    if current_ratings_count < MIN_RATINGS_FOR_TRAINING:
        print("Not enough ratings to train SVD model")
        return None

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
        latent_dim=latent_dim,
    )
