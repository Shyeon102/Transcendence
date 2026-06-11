import pandas as pd

from apps.media.models import Media


def get_media_dataframe() -> pd.DataFrame:
    rows = []
    queryset = Media.objects.prefetch_related("genres").all()

    for media in queryset:
        genres = [genre.name for genre in media.genres.all()]
        rows.append({
            "media_id": media.id,
            "external_source": media.external_source,
            "external_id": media.external_id,
            "title": media.title,
            "media_type": media.media_type,
            "genres": genres,
            "genres_text": "|".join(genres),
            "country": media.country,
            "description": media.description,
            "director": media.director,
            "cast": media.cast,
            "release_date": media.release_date,
            "image_url": media.image_url,
            "age_rating": media.age_rating,
            "avg_rating": media.avg_rating,
            "rating_count": media.rating_count,
            "created_at": media.created_at,
        })

    return pd.DataFrame(rows)


def get_genre_multihot_dataframe() -> pd.DataFrame:
    df = get_media_dataframe()
    if df.empty:
        return df

    encoded = df["genres"].str.join("|").str.get_dummies(sep="|")
    encoded = encoded.add_prefix("genre_")
    return pd.concat([df.drop(columns=["genres"]), encoded], axis=1)
