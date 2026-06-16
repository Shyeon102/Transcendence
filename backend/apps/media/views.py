from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from apps.media.models import Media, MediaInteraction
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

        if media.reviews.filter(user=request.user).exists():
            return Response(
                {"error": "Review already exists for this media."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(user=request.user, media=media)
            except IntegrityError:
                return Response(
                    {'error': 'Review already exists for this media.'},
                    status=status.HTTP_409_CONFLICT,
                )
            return Response(
                {'review': serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

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
        if not serializer.is_valid():
            return Response({'errors': serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)

        media = get_object_or_404(Media, pk=media_id)
        action = serializer.validated_data['action']

        if action == "like":
            MediaInteraction.objects.filter(
                user=request.user,
                media=media,
                action="dislike"
            ).delete()

            MediaInteraction.objects.get_or_create(
                user=request.user,
                media=media,
                action="like"
            )

            MediaInteraction.objects.get_or_create(
                user=request.user,
                media=media,
                action="watched"
            )

        if action == "dislike":
            MediaInteraction.objects.filter(
                user=request.user,
                media=media,
                action="like"
            ).delete()

            MediaInteraction.objects.get_or_create(
                user=request.user,
                media=media,
                action="dislike"
            )

            MediaInteraction.objects.get_or_create(
                user=request.user,
                media=media,
                action="watched"
            )

        interaction, created = MediaInteraction.objects.get_or_create(
            user=request.user,
            media=media,
            action=action,
        )
        response_status = (
            status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

        return Response(
            {
                'interaction': {
                    'id': interaction.id,
                    'media': interaction.media_id,
                    'action': interaction.action,
                    'created_at': interaction.created_at,
                },
                'created': created,
            },
            status=response_status,
        )

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

    def delete(self, request, media_id, action):
        user = request.user

        interaction = user.interactions.filter(
            media_id=media_id,
            action=action
        ).first()

        if interaction:
            interaction.delete()
            return Response(status=204)

        return Response(
            {"error": "Interaction not found"},
            status=404
        )
