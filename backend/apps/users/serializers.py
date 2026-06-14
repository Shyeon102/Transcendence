from rest_framework import serializers
from .models import User
from apps.media.models import Genre


class UserSerializer(serializers.ModelSerializer):
    # Accept favorite_genres as a list of PKs
    favorite_genres = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(),
        many=True,
        required=False,
    )

    # Accept onboarding payload fields from the frontend but don't persist
    favorite_titles = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    onboarding_answers = serializers.JSONField(write_only=True, required=False)

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
            "favorite_titles",
            "onboarding_answers",
        ]

    def update(self, instance, validated_data):
        # Remove frontend-only fields before delegating to super()
        validated_data.pop("favorite_titles", None)
        validated_data.pop("onboarding_answers", None)
        return super().update(instance, validated_data)
