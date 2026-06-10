import pandas as pd
from openai import OpenAI
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from backend.apps.media.services.dataset import get_media_dataframe

client = OpenAI()

def build_source_text(row):
    return f"""
Title: {row['title']}
Type: {row['media_type']}
Genres: {row['genres_text']}
Director: {row['director']}
Cast: {row['cast']}
Country: {row['country']}
Release Date: {row['release_date']}
Rating: {row['avg_rating']} ({row['rating_count']} votes)
Description:
{row['description']}
"""

def get_embedding(text: str):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding


def embedding_to_dataframe() -> pd.DataFrame:
    df = get_media_dataframe()
    df["source_text"] = df.apply(build_source_text, axis=1)
    df["embedding"] = df["source_text"].apply(get_embedding)
    return df


def get_embeddings_batch(texts):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )
    return [item.embedding for item in response.data]

def embeddings_to_dataframe_batch(batch_size=100):
    df = get_media_dataframe()
    df["source_text"] = df.apply(build_source_text, axis=1)
    embeddings = []
    for i in range(0, len(df), batch_size):
        batch_texts = df["source_text"].iloc[i:i+batch_size].tolist()
        batch_embeddings = get_embeddings_batch(batch_texts)
        embeddings.extend(batch_embeddings)
    df["embedding"] = embeddings
    return df

# embedding to db
"""
this part need to be checked by backend team
"""
from .models import MediaEmbedding
from django.db import transaction

def save_embeddings_to_db(df: pd.DataFrame):
    with transaction.atomic():
        for _, row in df.iterrows():
            MediaEmbedding.objects.update_or_create(
                media_id=row["media_id"],
                defaults={
                    "embedding": row["embedding"],
                    "source_text": row["source_text"],
                }
            )