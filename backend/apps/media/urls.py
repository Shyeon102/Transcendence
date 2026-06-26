from django.urls import path
from .views import (
    MediaInteractionView, MediaView, MediaDetailView,
    MediaSearchView, ReviewCreateView, RandomMediaView,
    TrendingMediaView
)

urlpatterns = [
    path("", MediaView.as_view()),
    path("<int:pk>/", MediaDetailView.as_view()),
    path("search/", MediaSearchView.as_view()),
    path("<int:media_id>/reviews/", ReviewCreateView.as_view()),
    path("<int:media_id>/reviews/<int:review_id>/",
         ReviewCreateView.as_view()),
    path("<int:media_id>/interactions/",
         MediaInteractionView.as_view()),
    path("random/", RandomMediaView.as_view()),
    path("trending/", TrendingMediaView.as_view()),
]
