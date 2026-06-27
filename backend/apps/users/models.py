from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Extended Django User.
    Fields provided by AbstractUser: username, email, password,
    first_name, last_name, is_active, is_staff, date_joined, etc.
    """
    # Profile extension
    avatar_url = models.URLField(blank=True)
    email = models.EmailField(unique=True)
    google_id = models.CharField(max_length=255, null=True,
                                 blank=True, unique=True)
    bio = models.TextField(blank=True, max_length=500)
    onboarding_completed = models.BooleanField(default=False)

    is_banned = models.BooleanField(default=False)
    banned_at = models.DateTimeField(null=True, blank=True)
    ban_reason = models.TextField(blank=True)

    auth_provider = models.CharField(
        max_length=20,
        choices=[("local", "Local"), ("google", "Google")],
        default="local"
    )

    # Preference info
    favorite_genres = models.ManyToManyField('media.Genre', blank=True,
                                             related_name='interested_users')
    favorite_countries = models.JSONField(default=list)

    updated_at = models.DateTimeField(auto_now=True)


class UserActivity(models.Model):
    """User activity status"""
    user = models.OneToOneField(User, on_delete=models.CASCADE,
                                related_name='activity')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    current_chat_room = models.ForeignKey(
        'chat.ChatRoom', null=True, blank=True, on_delete=models.SET_NULL)
