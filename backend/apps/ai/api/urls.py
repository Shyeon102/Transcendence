from django.urls import path
from .views import (
    HybridRecommendationView,
    TrendingMediaView,
    RAGRecommendationView
)

urlpatterns = [
    path("recommend/<int:user_id>/", HybridRecommendationView.as_view()),
    path("trending/", TrendingMediaView.as_view()),
    path('rag/', RAGRecommendationView.as_view()),
]
