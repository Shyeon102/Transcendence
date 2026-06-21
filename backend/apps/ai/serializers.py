from rest_framework import serializers


class HybridRecommendationSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    media_id = serializers.IntegerField()
    score = serializers.FloatField()


class RAGRecommendationSerializer(serializers.Serializer):
    media_ids = serializers.ListField(
        child=serializers.IntegerField()
    )
