from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .services import login_user
from .serializer import RegisterSerializer
from apps.users.serializers import UserSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({
                "success": True,
                "message": "Logged out successfully"
            })

        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=400)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = login_user(
            request.data.get("username"),
            request.data.get("password")
        )
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })
        return Response(serializer.errors, status=400)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response(
                {"error": "old_password and new_password are required."},
                status=400)

        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect."},
                            status=400)

        user.set_password(new_password)
        user.save()

        return Response({"success": True, "message":
                         "Password changed successfully."})
