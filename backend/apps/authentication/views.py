from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .services import login_user
from .serializer import RegisterSerializer
from apps.users.serializers import UserSerializer
from apps.users.models import User
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings


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

# not used by frontend, it uses /token/


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


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get("credential")
        if not credential:
            return Response({"error": "Could not obtain credentials."},
                            status=400)

        try:
            data = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
        except ValueError:
            return Response({"error": "Invalid Google token"},
                            status=400)

        email = data["email"]

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": data.get("name", email.split("@")[0]),
            }
        )

        refresh = RefreshToken.for_user(user)

        return Response({
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
        })


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
