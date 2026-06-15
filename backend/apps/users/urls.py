from django.urls import path
from .views import AvatarUpdateView, OnboardingView, UserView, test_error

urlpatterns = [
    path('test-error/', test_error),
    path("onboarding/", OnboardingView.as_view()),
    path("profile/", UserView.as_view()),
    path("profile/avatar/", AvatarUpdateView.as_view())
]
