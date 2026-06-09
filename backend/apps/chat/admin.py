from django.contrib import admin

# Model necessiting admin interface, can add more later
from .models import ChatRoom, ChatRoomMember, ChatMessage


class ChatRoomAdmin(admin.AdminSite):

    def has_permission(self, request):
        return request.user.is_active and request.user.is_staff

    site_header = "Chat Room Administration"
    list_display = ("id", "name", "created_at")
    search_fields = ("name")


chat_admin_site = ChatRoomAdmin(name="chat_admin")
chat_admin_site.register(ChatRoom)
chat_admin_site.register(ChatRoomMember)
chat_admin_site.register(ChatMessage)
