# from django.urls import path
from .consumers import ChatConsumer
from django.urls import re_path


websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<room_name>\w+)/$", ChatConsumer.as_asgi()),
    # path("ws/chat/", ChatConsumer.as_asgi()),
]
