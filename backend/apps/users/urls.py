from django.urls import path
from .views import OnboardingView, UserView, test_error

urlpatterns = [
    path("", UserView.as_view()),
    path('test-error/', test_error),
    path("onboarding/", OnboardingView.as_view()),

]
