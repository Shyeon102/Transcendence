from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.media.models import Media
from apps.media.serializers import MediaSerializer


class MediaView(APIView):
    def get(self, request):
        queryset = Media.objects.prefetch_related('genres').all()
        serializer = MediaSerializer(queryset, many=True)
        return Response({'media': serializer.data})


class MediaDetailView(APIView):
    def get(self, request, pk):
        media = get_object_or_404(
            Media.objects.prefetch_related('genres'),
            pk=pk,
        )
        serializer = MediaSerializer(media)
        return Response(serializer.data, status=status.HTTP_200_OK)
