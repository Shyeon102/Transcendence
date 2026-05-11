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

    title = models.CharField(max_length=200)
    media_type = models.CharField(max_length=10, choices=TYPES)
    genres = models.ManyToManyField(Genre, related_name='media_items')
    country = models.CharField(max_length=50)
    description = models.TextField()
    director = models.CharField(max_length=100, blank=True)
    cast = models.TextField(blank=True)
    release_date = models.DateField(blank=True, null=True)
    image_url = models.URLField()

    avg_rating = models.FloatField(default=0)
    rating_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)


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
        unique_together = ('user', 'media')  # One review / user / media item


class MediaInteraction(models.Model):
    """User interactions with media (for the recommendation system)"""
    ACTIONS = (
        ('like', 'Likes'),
        ('dislike', 'Dislike'),
        ('watchlist', 'Watchlist'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name='interactions')
    media = models.ForeignKey(Media, on_delete=models.CASCADE,
                              related_name='interactions')
    action = models.CharField(max_length=20, choices=ACTIONS)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'media')  # One status per user per media
