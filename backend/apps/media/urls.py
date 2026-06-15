from django.urls import path
from .views import MediaView, MediaDetailView

urlpatterns = [
    path("", MediaView.as_view()),
    path("<int:pk>/", MediaDetailView.as_view()),
]
