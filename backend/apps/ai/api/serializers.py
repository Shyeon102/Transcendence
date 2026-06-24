from rest_framework import serializers
from apps.media.models import Media
from apps.media.serializers import GenreSerializer


class MediaRecommendationSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True)
    score = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = ["id", "title", "image_url", "genres", "score"]

    def get_score(self, obj):
        return getattr(obj, "score", 0.0)
