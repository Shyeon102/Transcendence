from apps.ai.service.recommendation.recommendations import (
    get_hybrid_scores, get_popular_series
)
# from apps.ai.service.retrieval.retrieval import rag_recommendations
from rest_framework.response import Response
from rest_framework import status
from apps.ai.models import CFModel
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


class HybridRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_id = request.user.id
            cf_model = CFModel.objects.latest()
            hybrid_series = (
                get_hybrid_scores(user_id=user_id, cf_model=cf_model)
            )
            if hybrid_series.empty:
                result_score = get_popular_series()
            else:
                result_score = hybrid_series
            result_data = [
                {
                    "user_id": user_id,
                    "media_id": int(mid),
                    "score": round(float(score), 4)
                }
                for mid, score in result_score.items()
            ]
            return Response(result_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.
                            HTTP_500_INTERNAL_SERVER_ERROR)


"""
class RAGRecommendationView(APIView):
    def get(self, request):
        query = request.GET.get('query')
        media_type = request.GET.get('media_type')
        if not query:
            return Response({"error": "Query parameter is required"},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            media_ids = rag_recommendations(query, media_type)
            serializer = RAGRecommendationSerializer({"media_ids": media_ids})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.
                            HTTP_500_INTERNAL_SERVER_ERROR)
"""
