from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

import json
# from urllib.parse import parse_qs

# from django.contrib.auth.models import AnonymousUser
# from rest_framework_simplejwt.tokens import UntypedToken
# from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
# from jwt import decode as jwt_decode

# from django.conf import settings

from .models import ChatRoom, ChatRoomMember, ChatMessage
from django.contrib.auth import get_user_model
from django.core.cache import cache

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """
        Called when websocket connects.
        """

        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"

        # Authenticate user from JWT
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Check room permission
        has_access = await self.can_join_room()

        if not has_access:
            await self.close(code=4003)
            return

        await self.set_online()

        await self.accept()

        if await self.is_connected():
            await self.close(code=4008)
            return
        await self.register_connection()

        if not await self.can_reconnect():
            await self.close(code=4009)
            return

        # Join Redis group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Notify room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_joined",
                "username": self.user.username,
            }
        )

    async def disconnect(self, close_code):
        """
        Called when websocket disconnects.
        """

        await self.set_offline()

        if hasattr(self, "room_group_name"):

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

            if hasattr(self, "user"):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "user_left",
                        "username": self.user.username,
                    }
                )

    async def receive(self, text_data):
        """
        Receive message from websocket.
        """

        try:
            data = json.loads(text_data)

        except json.JSONDecodeError:
            return

        message = data.get("message")

        if not message:
            return

        # Save to DB
        saved_message = await self.save_message(message)

        # Broadcast to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": saved_message.content,
                "username": self.user.username,
                "message_id": saved_message.id,
                "created_at": str(saved_message.created_at),
            }
        )

    async def chat_message(self, event):
        """
        Receive message from room group.
        """

        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "username": event["username"],
            "message_id": event["message_id"],
            "created_at": event["created_at"],
        }))

    async def user_joined(self, event):

        await self.send(text_data=json.dumps({
            "type": "user_joined",
            "username": event["username"],
        }))

    async def user_left(self, event):

        await self.send(text_data=json.dumps({
            "type": "user_left",
            "username": event["username"],
        }))

    # -------------------------
    # Database helpers
    # -------------------------

    @database_sync_to_async
    def can_join_room(self):

        room = ChatRoom.objects.get(id=self.room_id)

        return ChatRoomMember.objects.filter(
            room=room,
            user=self.user
        ).exists()

    @database_sync_to_async
    def save_message(self, content):

        room = ChatRoom.objects.get(id=self.room_id)

        return ChatMessage.objects.create(
            room=room,
            user=self.user,
            content=content,
        )

    @database_sync_to_async
    def register_connection(self):

        key = f"chat:{self.room_id}:users"

        users = cache.get(key, set())

        users.add(self.user.id)

        cache.set(key, users, timeout=None)

    @database_sync_to_async
    def is_connected(self):

        key = f"chat:{self.room_id}:users"

        users = cache.get(key, set())

        return self.user_id in users

    @database_sync_to_async
    def set_online(self):

        cache.set(
            f"chat:{self.room_id}:online:{self.user.id}",
            True,
            timeout=60,
        )

    @database_sync_to_async
    def set_offline(self):
        cache.delete(f"chat:{self.room_id}:online:{self.user.id}")

    @database_sync_to_async
    def can_reconnect(self):

        key = f"chat:{self.room_id}:reconnect:{self.user.id}"

        if cache.get(key):
            return False

        cache.set(key, True, timeout=3)
        return True
