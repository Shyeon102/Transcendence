from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, ReviewSerializer


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

    def get (self, request):
        user = request.user
        interactions = user.interactions.select_related("media").all()
        reviews = user.review.select_related("media").all()

        data = {
            "interactions": {
                "like": [],
                "dislike": [],
                "watchlist": [],
                "watched": [],
            }
            "reviews": ReviewSerializer(reviews, many=True).data
        }

