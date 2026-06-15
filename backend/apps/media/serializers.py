from rest_framework import serializers

from apps.users.serializers import SimpleUserSerializer
from .models import Genre, Media, Review, MediaInteraction


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ("id", "name")


class MediaSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True)

    class Meta:
        model = Media
        fields = "__all__"


class ReviewSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    media_title = serializers.CharField(source="media.title", read_only=True)

    class Meta:
        model = Review
        fields = (
            "id",
            "user",
            "media",
            "media_title",
            "rating",
            "content",
            "images",
            "visibility",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "user",
            "media",
            "media_title",
            "images",
            "created_at",
            "updated_at"
        )


class MediaInteractionSerializer(serializers.ModelSerializer):
    action = serializers.ChoiceField(
        choices = ["like", "dislike", "watchlist", "watched"]
    )
    class Meta:
        model = MediaInteraction
        fields = ("id", "media", "action", "created_at")
        read_only_fields = ("id", "media", "created_at")