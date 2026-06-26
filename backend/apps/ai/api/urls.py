from django.urls import path
from .views import HybridRecommendationView, RAGRecommendationView

urlpatterns = [
    path("recommend/<int:user_id>/", HybridRecommendationView.as_view()),
    path('rag/', RAGRecommendationView.as_view()),
]
