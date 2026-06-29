from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import CursorPagination
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import BasePermission
from django.db import models

from .models import ChatRoom, ChatMessage, ChatRoomMember, ChatRoomInvite
from .serializers import (
    ChatRoomSerializer,
    ChatMessageSerializer,
    ChatRoomMemberSerializer,
)

from django.contrib.auth import get_user_model

User = get_user_model()


class IsRoomMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.is_private:
            return ChatRoomMember.objects.filter(room=obj,
                                                 user=request.user).exists()
        return True


class ChatRoomCursorPagination(CursorPagination):
    ordering = "-created_at"


class ChatRoomViewSet(viewsets.ModelViewSet):

    permission_classes = [IsRoomMember]
    serializer_class = ChatRoomSerializer
    pagination_class = ChatRoomCursorPagination

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            models.Q(is_private=False) |  # all public rooms
            models.Q(is_private=True, members__user=user)
        ).distinct()

    def perform_create(self, serializer):
        is_private = self.request.data.get('is_private', False)
        max_members = 2 if is_private else serializer.validated_data.get(
            'max_members', 4)
        room = serializer.save(
            created_by=self.request.user,
            is_private=is_private,
            max_members=max_members
        )
        ChatRoomMember.objects.create(room=room, user=self.request.user,
                                      role="owner")

    @action(detail=True, methods=["post"], url_path="invite")
    def invite(self, request, pk=None):
        room = self.get_object()

        if not room.is_private:
            return Response({"error": "Room is not private"}, status=400)

        if room.created_by != request.user:
            return Response({"error": "Only the owner can invite"}, status=403)

        invited_user_id = request.data.get("user_id")
        if not invited_user_id:
            return Response({"error": "user_id is required"}, status=400)

        try:
            invited_user = User.objects.get(id=invited_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=200)

        current_members = ChatRoomMember.objects.filter(room=room).count()
        if current_members >= room.max_members:
            return Response({"error": "Room is full"}, status=200)

        ChatRoomInvite.objects.get_or_create(
            room=room,
            invited_user=invited_user,
            defaults={"invited_by": request.user}
        )

        ChatRoomMember.objects.get_or_create(room=room, user=invited_user)

        return Response({"success": True})

    @staticmethod
    def is_member(room, user):
        return ChatRoomMember.objects.filter(room=room, user=user).exists()

    # GET /api/chat/rooms/{id}/messages/
    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):

        room = self.get_object()

        messages = ChatMessage.objects.filter(room=room)

        serializer = ChatMessageSerializer(messages, many=True)

        return Response(serializer.data)

    # GET /api/chat/rooms/{id}/members/
    @action(detail=True, methods=["get"])
    def members(self, request, pk=None):

        room = self.get_object()

        if not self.is_member(room, request.user):
            return Response({"error": "Not a member"}, status=403)

        members = ChatRoomMember.objects.filter(room=room)

        serializer = ChatRoomMemberSerializer(members, many=True)

        return Response(serializer.data)

    # POST /api/chat/rooms/{id}/members/
    @members.mapping.post
    def add_member(self, request, pk=None):

        room = self.get_object()

        current_members = ChatRoomMember.objects.filter(room=room).count()

        if current_members >= room.max_members:
            return Response(
                {"error": "Room is full"},
                status=status.HTTP_200_OK
            )

        user = request.user

        member, created = ChatRoomMember.objects.get_or_create(
            room=room,
            user=user,
        )

        serializer = ChatRoomMemberSerializer(member)
        status_code = (
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        )

        return Response(serializer.data, status=status_code)

    # DELETE /api/chat/rooms/{id}/members/{uid}/
    @action(
        detail=True,
        methods=["delete"],
        url_path=r"members/(?P<uid>[^/.]+)"
    )
    def remove_member(self, request, pk=None, uid=None):

        room = self.get_object()

        membership = get_object_or_404(
            ChatRoomMember,
            room=room,
            user_id=uid
        )

        if request.user != membership.user and room.created_by != request.user:
            return Response({"error": "Forbidden"}, status=403)

        membership.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    def destroy(self, request, *args, **kwargs):
        room = self.get_object()

        is_owner = room.created_by == request.user
        is_staff = request.user.is_staff

        if not (is_owner or is_staff):
            return Response({"error": "Forbidden"}, status=403)

        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    # super().destroy(request, *args, **kwargs)
