from django.urls import path
from .views import MediaView

urlpatterns = [
    path("", MediaView.as_view()),
]
