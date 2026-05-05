from django.urls import path
from .views import UserView, test_error

urlpatterns = [
    path("", UserView.as_view()),
    path('test-error/', test_error),
]
