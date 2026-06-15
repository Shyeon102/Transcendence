from django.urls import path
from .views import (
    MediaInteractionView, MediaView, MediaDetailView,
    MediaSearchView, ReviewCreateView
)

urlpatterns = [
    path("", MediaView.as_view()),
    path("<int:pk>/", MediaDetailView.as_view()),
    path("search/", MediaSearchView.as_view()),
    path("media/<int:media_id>/reviews/", ReviewCreateView.as_view()),
    path("media/<int:media_id>/reviews/<int:review_id>/",
         ReviewCreateView.as_view()),
    path("media/<int:media_id>/interactions/", MediaInteractionView.as_view()),
]
