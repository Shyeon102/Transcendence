from django.db import models
from django.contrib.auth.models import User
from pgvector.django import VectorField


class UserEmbedding(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    embedding = VectorField(768)
    source_media_count = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

class MediaEmbedding(models.Model):
    media = models.OneToOneField(Media, on_delete=models.CASCADE, related_name='embedding')
    embedding = VectorField(dimensions=768)
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
    version = models.CharField(max_length=40, unique=True)           # e.g. git sha or timestamp
    model_data = models.BinaryField()                                 # pickle.dumps(svd_model)
    user_count = models.IntegerField()
    item_count = models.IntegerField()
    latent_dim = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        get_latest_by = 'created_at'

    def get_model(self):
        return pickle.loads(bytes(self.model_data))

    @classmethod
    def save_model(cls, svd_model, version: str, user_count: int, item_count: int, latent_dim: int) -> 'CFModel':
        return cls.objects.create(
            version=version,
            model_data=pickle.dumps(svd_model),
            user_count=user_count,
            item_count=item_count,
            latent_dim=latent_dim,
        )

    def __str__(self):
        return f"CFModel(v={self.version}, users={self.user_count}, items={self.item_count})"


class UserMediaScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    media = models.ForeignKey('media.Media', on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'media')
