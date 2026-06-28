from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import get_user_model
from .services import login_user
from django.conf import settings
from .serializer import RegisterSerializer
from rest_framework import serializers
from apps.users.serializers import UserSerializer
from apps.authentication.serializer import validate_password_strength

User = get_user_model()


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
                status=400
            )

        if not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect."},
                status=400
            )

        try:
            validate_password_strength(new_password)
        except serializers.ValidationError as e:
            return Response({"error": e.detail[0]}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({
            "success": True,
            "message": "Password changed successfully."
        })


def verify_google_token(token):
    if not token:
        raise ValueError("Missing Google ID token")

    google_client = settings.GOOGLE_CLIENT_ID
    return id_token.verify_oauth2_token(
        token,
        requests.Request(),
        audience=google_client
    )


def get_or_create_user_from_google(data):
    email = data["email"]

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": email.split("@")[0],
            "google_id": data["sub"],
            "auth_provider": "google",
        }
        )

    if created:
        user.set_unusable_password()
        user.save()

    return user


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        google_id_token = request.data.get("id_token")

        if not google_id_token:
            return Response(
                {"error": "id_token is required"},
                status=400
            )

        try:
            user_info = verify_google_token(google_id_token)
        except ValueError as e:
            return Response({"error": f"Token verification failed: {e}"},
                            status=400)

        user = get_or_create_user_from_google(user_info)

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })
