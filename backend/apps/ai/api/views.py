import logging

from apps.ai.recommendation.hybrid.hybrid import (
    get_hybrid_scores
)
from apps.ai.service.retrieval.retrieval import rag_recommendations
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from apps.media.models import Media
from apps.media.serializers import MediaSerializer

logger = logging.getLogger(__name__)


class HybridRecommendationView(APIView):
    permission_classes = [IsAuthenticated]
    # from rest_framework.permissions import AllowAny
    # permission_classes = [AllowAny]

    # def get(self, request):
    def get(self, request, user_id):
        try:
            # user_id = request.user.id
            hybrid_series = (
                get_hybrid_scores(user_id=user_id)
            )
            if not hybrid_series.empty:
                score_dict = hybrid_series.to_dict()
                medias = list(
                    Media.objects
                    .filter(id__in=score_dict.keys())
                    .prefetch_related("genres")
                )
                medias.sort(key=lambda m: score_dict[m.id], reverse=True)
                serializer = MediaSerializer(medias, many=True)
                return Response(
                    {"media": serializer.data},
                    status=status.HTTP_200_OK
                )
            else:
                queryset = (
                    Media.objects
                    .prefetch_related("genres")
                    .order_by("-avg_rating")
                )
            serializer = MediaSerializer(queryset, many=True)
            return Response(
                {"media": serializer.data},
                status=status.HTTP_200_OK
            )
        except Exception:
            logger.exception("Recommendation error: user=%s", user_id)
            return Response(
                {"error": "Internal server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RAGRecommendationView(APIView):
    # only for test
    # from rest_framework.permissions import AllowAny
    # permission_classes = [AllowAny]

    def get(self, request):

        try:
            query = request.query_params.get('q', '').strip()
            if not query:
                return Response({"error": "Query parameter is required"},
                                status=status.HTTP_400_BAD_REQUEST)
            rag_series = rag_recommendations(query)
            if rag_series.empty:
                return Response({"error": "No recommendations found"},
                                status=status.HTTP_404_NOT_FOUND)
            score_dict = rag_series.to_dict()
            medias = list(
                    Media.objects
                    .filter(id__in=score_dict.keys())
                    .prefetch_related("genres")
                )
            medias.sort(key=lambda m: score_dict[m.id], reverse=True)
            serializer = MediaSerializer(medias, many=True)
            return Response(
                    {"media": serializer.data},
                    status=status.HTTP_200_OK
                )

        except Exception:
            logger.exception("RAGRecommendationView error: query=%s", query)
            return Response(
                {"error": "Error occurred while searching."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
