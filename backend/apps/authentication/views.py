from rest_framework.views import APIView
from rest_framework.response import Response
from .services import login_user


class LoginView(APIView):
    def post(self, request):
        user = login_user(
            request.data.get("username"),
            request.data.get("password")
        )
        return Response({"success": bool(user)})
