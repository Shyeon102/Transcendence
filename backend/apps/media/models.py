from django.db import models
from django.conf import settings


class Genre(models.Model):
    """Genre (M2M with Media)"""
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Media(models.Model):
    """Movie/Anime/Drama"""
    TYPES = (('movie', 'Movie'), ('anime', 'Anime'), ('drama', 'Drama'))

    external_source = models.CharField(max_length=20, default='manual')
    external_id = models.CharField(max_length=100, blank=True, default='')

    title = models.CharField(max_length=200)
    media_type = models.CharField(max_length=10, choices=TYPES)
    genres = models.ManyToManyField(Genre, related_name='media_items')
    country = models.CharField(max_length=50)
    description = models.TextField()
    director = models.CharField(max_length=100, blank=True)
    cast = models.TextField(blank=True)
    release_date = models.DateField(blank=True, null=True)
    image_url = models.URLField()
    side_poster_url = models.URLField(blank=True, default="")

    age_rating = models.CharField(max_length=20, blank=True, default="")
    language = models.CharField(max_length=20, blank=True, default="")
    runtime = models.PositiveIntegerField(blank=True, null=True)

    avg_rating = models.FloatField(default=0)
    rating_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['external_source', 'external_id'],
                condition=models.Q(external_id__gt=''),
                name='unique_media_external_source_id',
            ),
        ]
        indexes = [
            models.Index(fields=['external_source', 'external_id']),
            models.Index(fields=['media_type', '-avg_rating']),
            models.Index(fields=['country', 'media_type']),
            models.Index(fields=['-created_at']),
        ]


class Review(models.Model):
    """Media review (My Space)"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='reviews')
    media = models.ForeignKey(Media, on_delete=models.CASCADE,
                              related_name='reviews')

    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    content = models.TextField()
    images = models.JSONField(default=list)

    VISIBILITY = (
        ('public', 'Public'),
        ('followers', 'Followers only'),
        ('private', 'Private'),
    )
    visibility = models.CharField(max_length=10,
                                  choices=VISIBILITY, default='public')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'media')
        indexes = [
            models.Index(fields=['media', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]


class MediaInteraction(models.Model):
    """User interactions with media (for the recommendation system)"""
    ACTIONS = (
        ('like', 'Likes'),
        ('dislike', 'Dislike'),
        ('watchlist', 'Watchlist'),
        ('watched', 'Watched'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name='interactions')
    media = models.ForeignKey(Media, on_delete=models.CASCADE,
                              related_name='interactions')

    media_recomm_score = models.ForeignKey(UserMediaScore, on_delete=models.CASCADE, default=0.0)

    action = models.CharField(max_length=20, choices=ACTIONS)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'media', 'action')
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['media', 'action']),
        ]
