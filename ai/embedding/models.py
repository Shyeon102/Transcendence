class UserEmbedding(models.Model):
    user = OneToOneField(User)
    embedding = VectorField(1536)
    updated_at