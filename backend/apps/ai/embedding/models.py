from django.db import models
from django.contrib.auth.models import User
from pgvector.django import VectorField


class UserEmbedding(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    embedding = VectorField(1536)
    updated_at = models.DateTimeField(auto_now=True)
