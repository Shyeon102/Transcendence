from django.urls import path
from .views import (
     AvatarUpdateView, OnboardingView,
     UserView, test_error, UserActivityView,
     PublicUserActivityView
)

urlpatterns = [
    path('test-error/', test_error),
    path("onboarding/", OnboardingView.as_view()),
    path("profile/", UserView.as_view()),
    path("profile/avatar/", AvatarUpdateView.as_view()),
    path("me/activity/", UserActivityView.as_view()),
    path("<int:user_id>/activity/", PublicUserActivityView.as_view())
]
