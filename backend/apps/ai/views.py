from apps.ai.recommendation.recommendations import get_hybrid_recommendations
from apps.ai.retrieval.retrieval import rag_recommendations
from rest_framework.response import Response
from rest_framework import status
from apps.ai.models import CFModel
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


def get_user_exclude_ids(user_id: int) -> set[int]:
    from media.models import Review, MediaInteraction

    review_ids = Review.objects.filter(user_id=user_id).values_list('media_id', flat=True)
    interaction_ids = MediaInteraction.objects.filter(user_id=user_id).values_list('media_id', flat=True)

    return set(review_ids) | set(interaction_ids)


class HybridRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_id = request.user.id
            exclude_ids = get_user_exclude_ids(user_id)
            cf_model = CFModel.objects.latest()
            hybrid_series = (
                get_hybrid_recommendations(user_id=user_id,
                                           cf_model=cf_model,
                                           exclude_media_ids=exclude_ids)
            )
            if hybrid_series.empty:
                return Response({
                    "message": "Not enough ratings to make recommended list"
                }, status=status.HTTP_404_NOT_FOUND)

            result_data = [
                {
                    "user_id": user_id, 
                    "media_id": int(mid), 
                    "score": round(float(score), 4)
                }
                for mid, score in hybrid_series.items()
            ]
            serializer = HybridRecommendationSerializer(data=result_data)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.
                            HTTP_500_INTERNAL_SERVER_ERROR)


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