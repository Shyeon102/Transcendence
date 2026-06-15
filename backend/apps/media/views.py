from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.media.models import Media
from apps.media.serializers import (
    MediaInteractionSerializer, MediaSerializer, ReviewSerializer
)


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
        return Response({'media': serializer.data}, status=status.HTTP_200_OK)


class MediaSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {'error': 'Query parameter "q" is required.'}, status=status.
                HTTP_400_BAD_REQUEST)

        queryset = Media.objects.filter(
            title__icontains=query).prefetch_related('genres')
        serializer = MediaSerializer(queryset, many=True)
        return Response({'media': serializer.data}, status=status.HTTP_200_OK)


class ReviewCreateView(APIView):
    def get(self, request, media_id):
        media = get_object_or_404(Media, pk=media_id)
        reviews = media.reviews.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response({'reviews': serializer.data},
                        status=status.HTTP_200_OK)

    def put(self, request, media_id, review_id):
        return self.patch(request, media_id, review_id)

    def post(self, request, media_id):
        media = get_object_or_404(Media, pk=media_id)
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, media=media)
            return Response({'review': serializer.data},
                            status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, media_id, review_id):
        media = get_object_or_404(Media, pk=media_id)
        review = get_object_or_404(media.reviews, user=request.user,
                                   pk=review_id)
        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'review': serializer.data},
                            status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, media_id, review_id):
        media = get_object_or_404(Media, pk=media_id)
        review = get_object_or_404(media.reviews, user=request.user,
                                   pk=review_id)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MediaInteractionView(APIView):
    def post(self, request, media_id):
        serializer = MediaInteractionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, media_id=media_id)
            return Response({'interaction': serializer.data},
                            status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        user = request.user
        interactions = user.interactions.select_related('media').all()
        data = [
            {
                'media_id': interaction.media.id,
                'action': interaction.action,
                'media_title': interaction.media.title,
            }
            for interaction in interactions
        ]
        return Response({'interactions': data}, status=status.HTTP_200_OK)

    def delete(self, request, media_id):
        action = request.data.get('action')
        if not action:
            return Response(
                {'error': 'action is required.'},
                status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        interaction = user.interactions.filter(
            media_id=media_id, action=action).first()
        if interaction:
            interaction.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {'error': 'Interaction not found.'}, status=status.
            HTTP_404_NOT_FOUND)
