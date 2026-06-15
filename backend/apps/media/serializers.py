from rest_framework import serializers

from apps.users.serializers import SimpleUserSerializer
from .models import Genre, Media, Review


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

    class Meta:
        model = Review
        fields = ("id", "user", "media", "rating", "comment", "created_at")
        read_only_fields = ("user", "media", "created_at")


class MediaInteractionSerializer(serializers.Serializer):
    media_id = serializers.IntegerField()
    interaction_type = serializers.ChoiceField(
        choices=['like', 'dislike', 'watchlist', 'watched'])
