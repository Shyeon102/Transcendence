from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .services import login_user
from .serializer import RegisterSerializer, LoginSerializer
from apps.users.serializers import UserSerializer


class LoginView(APIView):
    def post(self, request):
        user = login_user(
            request.data.get("username"),
            request.data.get("password")
        )
        return Response({"success": bool(user)})
    
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
