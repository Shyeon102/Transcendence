from django.urls import path
from apps.authentication.views import (
    ChangePasswordView, LoginView,
    LogoutView, RegisterView, GoogleLoginView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("register/", RegisterView.as_view()),
    path("token/", TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('changePassword/', ChangePasswordView.as_view()),
    path("login/google/", GoogleLoginView.as_view())
    # might not be needed
]
