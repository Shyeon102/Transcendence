from rest_framework.routers import DefaultRouter

from .views import ChatRoomViewSet


router = DefaultRouter()

router.register(
    r"rooms",
    ChatRoomViewSet,
    basename="chat-room"
)

urlpatterns = router.urls
