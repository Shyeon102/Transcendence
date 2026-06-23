from rest_framework import serializers


class RAGRecommendationSerializer(serializers.Serializer):
    media_ids = serializers.ListField(
        child=serializers.IntegerField()
    )
