from django.urls import path
from .views import (
     AvatarUpdateView, FollowAPIView, OnboardingView, UserBanView,
     UserProfileView, UserReviewView,
     UserView, test_error, UserActivityView,
     PublicUserActivityView, UserFollowersView, UserFollowingView
)

urlpatterns = [
    path('test-error/', test_error),
    path("onboarding/", OnboardingView.as_view()),
    path("profile/", UserView.as_view()),
    path("profile/<int:user_id>/", UserProfileView.as_view()),
    path("profile/avatar/", AvatarUpdateView.as_view()),
    path("me/activity/", UserActivityView.as_view()),
    path("<int:user_id>/activity/", PublicUserActivityView.as_view()),
    path("<int:user_id>/follow/", FollowAPIView.as_view()),
    path("<int:user_id>/followers/", UserFollowersView.as_view()),
    path("<int:user_id>/following/", UserFollowingView.as_view()),
    path("<int:user_id>/reviews/", UserReviewView.as_view()),
    path("<int:user_id>/ban/", UserBanView.as_view()),
]
