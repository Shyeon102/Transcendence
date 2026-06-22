from django.urls import path
from .views import HybridRecommendationView

urlpatterns = [
    path("recommend/<int:user_id>/", HybridRecommendationView.as_view()),
    # path('rag-recommendations/', RAGRecommendationView.as_view()),
]
