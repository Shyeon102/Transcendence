from django.urls import path
from .views import ChatView

urlpatterns = [
    path("", ChatView.index, name="index"),
    path("", ChatView.as_view()),
    path("<str:room_name>/", ChatView.room, name="room"),
]

# from django.urls import path
# from . import views

# urlpatterns = [
#     path("", views.index, name="index"),
#     path("<str:room_name>/", views.room, name="room"),
# ]
