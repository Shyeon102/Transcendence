from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django_redis import get_redis_connection

import json
# from urllib.parse import parse_qs

# from django.contrib.auth.models import AnonymousUser
# from rest_framework_simplejwt.tokens import UntypedToken
# from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
# from jwt import decode as jwt_decode

# from django.conf import settings

from .models import ChatRoom, ChatRoomMember, ChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """
        Called when websocket connects.
        """

        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"

        # Authenticate user from JWT, our authentication system
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close(code=4001)
            return

        has_access = await self.is_room_member()

        if not has_access:
            member = await self.add_room_member()
            if not member:
                await self.close(code=4003)
                return

        ok = await self.get_socket_lock()

        if not ok:
            await self.close(code=4007)
            return

        await self.set_online()

        if not await self.can_reconnect():
            await self.close(code=4009)
            return

        # Join Redis group, redis handle the cache
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        await self.register_connection()

        # Notify room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "user_id": self.user.id,
                "type": "user_joined",
                "username": self.user.username,
            }
        )

    async def disconnect(self, close_code):
        """
        Called when websocket disconnects.
        """
        await self.set_offline()
        await self.unregister_connection()
        await self.release_socket_lock()

        if hasattr(self, "room_group_name") and await self.is_connected():

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

            # Notify room
            if hasattr(self, "user"):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "user_id": self.user.id,
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

        # Save to DB, needed to handle later with django admin !!
        saved_message = await self.save_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "user_id": saved_message.user_id,
                "type": "chat_message",
                "message": saved_message.content,
                "username": saved_message.user.username,
                "message_id": saved_message.id,
                "created_at": str(saved_message.created_at),
            }
        )

    async def chat_message(self, event):
        """
        Receive message from room group.
        """

        await self.send(text_data=json.dumps({
            "user_id": event["user_id"],
            "type": "chat_message",
            "message": event["message"],
            "username": event["username"],
            "message_id": event["message_id"],
            "created_at": event["created_at"],
        }))

    async def user_joined(self, event):

        await self.send(text_data=json.dumps({
            "user_id": event["user_id"],
            "type": "user_joined",
            "username": event["username"],
        }))

    async def user_left(self, event):

        await self.send(text_data=json.dumps({
            "user_id": event["user_id"],
            "type": "user_left",
            "username": event["username"],
        }))

    # -------------------------
    # Database helpers
    # -------------------------

    @database_sync_to_async
    def is_room_member(self):

        room = ChatRoom.objects.get(id=self.room_id)

        return ChatRoomMember.objects.filter(
            room=room,
            user=self.user
        ).exists()

    @database_sync_to_async
    def add_room_member(self):

        room = ChatRoom.objects.get(id=self.room_id)
        current_members = ChatRoomMember.objects.filter(room=room).count()

        if current_members >= room.max_members:
            return None

        member, created = ChatRoomMember.objects.get_or_create(
            room=room,
            user=self.user
        )

        return member

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

        redis = get_redis_connection("default")

        key = f"chat:{self.room_id}:users"

        if not hasattr(self, "user") or not getattr(self.user, "id", None):
            return

        redis.sadd(key, self.user.id)

    @database_sync_to_async
    def unregister_connection(self):

        redis = get_redis_connection("default")

        key = f"chat:{self.room_id}:users"

        if not hasattr(self, "user") or not getattr(self.user, "id", None):
            return

        redis.srem(key, self.user.id)

    @database_sync_to_async
    def is_connected(self):

        redis = get_redis_connection("default")

        key = f"chat:{self.room_id}:users"

        if not hasattr(self, "user") or not getattr(self.user, "id", None):
            return False

        return redis.sismember(key, self.user.id)

    @database_sync_to_async
    def set_online(self):

        redis = get_redis_connection("default")

        key = f"chat:{self.room_id}:online"

        if not hasattr(self, "user") or not getattr(self.user, "id", None):
            return

        redis.sadd(key, self.user.id)

    @database_sync_to_async
    def set_offline(self):

        redis = get_redis_connection("default")

        key = f"chat:{self.room_id}:online"

        if not hasattr(self, "user") or not getattr(self.user, "id", None):
            return

        redis.srem(key, self.user.id)

    @database_sync_to_async
    def can_reconnect(self):

        redis = get_redis_connection("default")

        key = f"chat:{self.room_id}:reconnect:{self.user.id}"

        was_set = redis.set(key, "1", nx=True, ex=3)

        return bool(was_set)

    @database_sync_to_async
    def get_socket_lock(self):

        redis = get_redis_connection("default")

        key = f"chat:{self.room_id}:socket_lock:{self.user.id}"

        return redis.set(key, self.channel_name, nx=True, ex=30)

    @database_sync_to_async
    def release_socket_lock(self):

        redis = get_redis_connection("default")

        key = f"chat:{self.room_id}:socket_lock:{self.user.id}"

        redis.delete(key)
