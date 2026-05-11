from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer


class UserView(APIView):
    def get(self, request):
        return Response({"users": []})


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