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
    media_image_url = serializers.CharField(
        source="media.image_url",
        read_only=True,
    )
    content = serializers.CharField(required=False,
                                    allow_blank=True, default='')

    class Meta:
        model = Review
        fields = (
            "id",
            "user",
            "media",
            "media_title",
            "media_image_url",
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
            "media_image_url",
            "images",
            "created_at",
            "updated_at"
        )


class MediaInteractionSerializer(serializers.ModelSerializer):

    class Meta:
        model = MediaInteraction
        fields = ("id", "action", "created_at")
        read_only_fields = ("id", "media", "created_at")
