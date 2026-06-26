from apps.media.models import Review
from apps.community.models import Follow
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken
)
from .serializers import UserSerializer, PublicUserProfileSerializer
from apps.media.serializers import ReviewSerializer
from django.shortcuts import get_object_or_404
from apps.users.models import User
from django.utils import timezone


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({"users": serializer.data})

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "user": serializer.data})
        return Response(serializer.errors, status=400)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)

        serializer = PublicUserProfileSerializer(
            user,
            context={"request": request}
        )

        return Response(serializer.data)


class AvatarUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        request.user.avatar_url = request.data.get("avatar_url")
        request.user.save()
        return Response({"avatar_url": request.user.avatar_url})


def test_error(request):
    raise Exception("middleware test")


class OnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save(onboarding_completed=True)

            return Response({
                "success": True,
                "user": serializer.data
            })

        return Response(serializer.errors, status=400)


def serialize_activity(user):
    reviews = user.reviews.select_related("media").order_by("-created_at")[:10]
    interactions = user.interactions.select_related("media").all()

    watchlist = [
        interaction.media.title
        for interaction in interactions
        if interaction.action == "watchlist"
    ]
    activities = [
        f"{interaction.action.title()} {interaction.media.title}"
        for interaction in interactions[:10]
    ]

    return {
        "reviews": [
            {
                "id": review.id,
                "title": review.media.title,
                "note": review.content,
                "when": review.created_at.isoformat(),
                "rating": review.rating,
            }
            for review in reviews
        ],
        "watchlist": watchlist,
        "activities": activities,
    }


class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(serialize_activity(request.user))


class PublicUserActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        return Response(serialize_activity(user))
