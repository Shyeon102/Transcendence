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
from django.db.models import Count


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

    def delete(self, request):
        request.user.delete()
        return Response(status=204)


class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.annotate(
            followers_count=Count("followers"),
            following_count=Count("following"),
            reviews_count=Count("reviews"),
        ).order_by("-date_joined")

        data = [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "avatar_url": u.avatar_url,
                "is_staff": u.is_staff,
                "is_banned": u.is_banned,
                "ban_reason": u.ban_reason,
                "banned_at": u.banned_at,
                "onboarding_completed": u.onboarding_completed,
                "date_joined": u.date_joined,
                "followers_count": u.followers_count,
                "following_count": u.following_count,
                "reviews_count": u.reviews_count,
            }
            for u in users
        ]

        return Response({"users": data, "total": len(data)})


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


class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        interactions = user.interactions.select_related("media").all()
        reviews = user.reviews.select_related("media").all()
        activity = getattr(user, "activity", None)

        data = {
            "current_chat_room": (
                {
                    "id": activity.current_chat_room.id,
                    "title": activity.current_chat_room.title,
                }
                if activity and activity.current_chat_room
                else None
            ),
            "interactions": {
                "like": [],
                "dislike": [],
                "watchlist": [],
                "watched": [],
            },
            "reviews": ReviewSerializer(reviews, many=True).data
        }

        for i in interactions:
            data["interactions"][i.action].append({
                "media_id": i.media.id,
                "media_title": i.media.title,
            })

        return Response(data)


class UserReviewView(APIView):
    def get(self, request, user_id):
        reviews = Review.objects.filter(user_id=user_id)

        return Response({
            "reviews": ReviewSerializer(reviews, many=True).data
        })


class PublicUserActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)

        reviews = user.reviews.select_related("media")

        return Response({
            "user": UserSerializer(user).data,
            "reviews": ReviewSerializer(reviews, many=True).data
        })


class UserFollowersView(APIView):
    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)

        followers = user.followers.select_related("follower")

        data = [
            {
                "id": f.follower.id,
                "username": f.follower.username,
                "avatar_url": f.follower.avatar_url,
            }
            for f in followers
        ]

        return Response({"followers": data})


class UserFollowingView(APIView):
    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)

        following = user.following.select_related("following")

        data = [
            {
                "id": f.following.id,
                "username": f.following.username,
                "avatar_url": f.following.avatar_url,
            }
            for f in following
        ]

        return Response({"following": data})


class FollowAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        target_user = get_object_or_404(User, pk=user_id)

        if request.user == target_user:
            return Response({"error": "You cannot follow yourself."},
                            status=400)

        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=target_user
        )

        if not created:
            return Response({"error": "Already following"}, status=400)

        return Response({"success": True})

    def delete(self, request, user_id):
        target_user = get_object_or_404(User, pk=user_id)

        follow = Follow.objects.filter(
            follower=request.user,
            following=target_user
        ).first()

        if not follow:
            return Response(
                {"error": "You are not following this user."},
                status=400
            )

        follow.delete()
        return Response({"success": f"You have unfollowed"
                         f"{target_user.username}."})


class UserBanView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)

        user.is_banned = True
        user.banned_at = timezone.now()
        user.ban_reason = request.data.get("reason", "")
        user.save()

        tokens = OutstandingToken.objects.filter(user=user)

        BlacklistedToken.objects.bulk_create([
            BlacklistedToken(token=t)
            for t in tokens
        ], ignore_conflicts=True)

        return Response({"status": "banned"})

    def delete(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)

        user.is_banned = False
        user.banned_at = None
        user.ban_reason = ""
        user.save()

        return Response({"status": "unbanned"})
