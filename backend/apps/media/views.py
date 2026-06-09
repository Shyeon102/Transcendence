from rest_framework.views import APIView
from rest_framework.response import Response

from apps.media.models import Media
from apps.media.serializers import MediaSerializer


class MediaView(APIView):
    def get(self, request):
        queryset = Media.objects.prefetch_related('genres').all()
        serializer = MediaSerializer(queryset, many=True)
        return Response({'media': serializer.data})
