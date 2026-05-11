from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "avatar_url",
            "bio",
            "onboarding_completed",
            "favorite_genres",
        ]




