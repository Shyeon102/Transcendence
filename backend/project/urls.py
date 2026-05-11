from django.http import JsonResponse
from django.urls import path, include


def home(request):
    return JsonResponse({"message": "API is running 🚀"})


urlpatterns = [
    path("", home),
    path("api/auth/", include("apps.authentication.urls")),
    path("api/users/", include("apps.users.urls")),
    path("api/chat/", include("apps.chat.urls")),
    path("api/community/", include("apps.community.urls")),
    path("api/media/", include("apps.media.urls")),
    path("api/users/", include("apps.users.urls")),
]
