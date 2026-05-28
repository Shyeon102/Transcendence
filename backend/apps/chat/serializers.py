from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    ChatRoom,
    ChatRoomMember,
    ChatMessage
)

User = get_user_model()


class SimpleUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username", "created_by"]


class ChatRoomSerializer(serializers.ModelSerializer):

    created_by = SimpleUserSerializer(read_only=True)

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "title",
            "description",
            "created_by",
            "max_members",
            "is_active",
            "created_at",
            "ended_at",
        ]


class ChatRoomMemberSerializer(serializers.ModelSerializer):

    user = SimpleUserSerializer(read_only=True)
    created_by = SimpleUserSerializer(read_only=True)

    class Meta:
        model = ChatRoomMember
        fields = [
            "id",
            "user",
            "joined_at",
        ]


class ChatMessageSerializer(serializers.ModelSerializer):

    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "user",
            "content",
            "message_type",
            "created_at",
        ]
