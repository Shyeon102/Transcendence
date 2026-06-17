from django.urls import path
from .views import user_recommendation_api  # 혹은 DRF 뷰 함수명

urlpatterns = [
    # 예: /api/recommend/42/ 형태로 호출하면 42번 유저의 추천 JSON이 튀어나옵니다.
    path("recommend/<int:user_id>/", user_recommendation_api.as_view()),
]
