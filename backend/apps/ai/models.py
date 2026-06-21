from django.db import models
from apps.users.models import User
from pgvector.django import VectorField, HnswIndex
from apps.media.models import Media
import pickle
from apps.ai.constants import EMB_DIM


class UserEmbedding(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    embedding = VectorField(EMB_DIM)
    source_media_count = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)


class MediaEmbedding(models.Model):
    media = models.OneToOneField(Media, on_delete=models.CASCADE,
                                 related_name='embedding')
    embedding = VectorField(dimensions=EMB_DIM)
    source_text = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            # pgvector HNSW index (cosine similarity)
            HnswIndex(
                name='media_embedding_hnsw_idx',
                fields=['embedding'],
                m=16,
                ef_construction=64,
                opclasses=['vector_cosine_ops'],
            ),
        ]


class CFModel(models.Model):
    version = models.CharField(max_length=40, unique=True)
    model_data = models.BinaryField()
    user_count = models.IntegerField()
    item_count = models.IntegerField()
    latent_dim = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        get_latest_by = 'created_at'

    def get_model(self):
        return pickle.loads(bytes(self.model_data))

    def get_item_count(self):
        svd_model = self.get_model()
        return svd_model.n_items

    @classmethod
    def save_model(cls, svd_model, version: str, user_count: int,
                   item_count: int, latent_dim: int) -> 'CFModel':
        return cls.objects.create(
            version=version,
            model_data=pickle.dumps(svd_model),
            user_count=user_count,
            item_count=item_count,
            latent_dim=latent_dim,
        )

    def __str__(self):
        return (
            f"CFModel(v={self.version}, "
            f"users={self.user_count}, "
            f"items={self.item_count})"
        )
