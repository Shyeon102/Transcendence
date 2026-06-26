import logging
import pandas as pd
from apps.ai.api.serializers import MediaRecommendationSerializer
from apps.ai.recommendation.hybrid.hybrid import (
    get_hybrid_scores, get_popular_series
)
from apps.ai.retrieval.rag import rag_recommendations
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from apps.media.models import Media
from apps.media.serializers import MediaSerializer

logger = logging.getLogger(__name__)


def get_media_with_scores(score: pd.Series):
    if score.empty:
        return Media.objects.none()
    score = score.copy()
    score.index = score.index.map(int)

    score_dict = score.to_dict()
    media_ids = list(score_dict.keys())
    queryset = Media.objects.prefetch_related("genres").filter(
        id__in=media_ids
    )
    objs = list(queryset)
    objs.sort(key=lambda x: score_dict.get(x.id, 0), reverse=True)

    for obj in objs:
        obj.score = float(score_dict.get(obj.id, 0))
    return objs


class TrendingMediaView(APIView):
    from rest_framework.permissions import AllowAny
    permission_classes = [AllowAny]

    def get(self, request):
        result_score = get_popular_series()
        queryset = get_media_with_scores(result_score)
        serializer = MediaRecommendationSerializer(queryset, many=True)

        return Response(serializer.data)


class HybridRecommendationView(APIView):
    # only for test
    from rest_framework.permissions import AllowAny
    permission_classes = [AllowAny]

    #permission_classes = [IsAuthenticated]
    def get(self, request, user_id):
    # def get(self, request):
        try:
            #user_id = request.user.id  # rm for test
            hybrid_series = (
                get_hybrid_scores(user_id=user_id)
            )
            if hybrid_series.empty:
                result_score = get_popular_series()
            else:
                result_score = hybrid_series
            queryset = get_media_with_scores(result_score)
            serializer = MediaRecommendationSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception:
            logger.exception("Recommendation error: user=%s", user_id)
            return Response(
                {"error": "Internal server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RAGRecommendationView(APIView):
    # only for test
    from rest_framework.permissions import AllowAny
    permission_classes = [AllowAny]

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
