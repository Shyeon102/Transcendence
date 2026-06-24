from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import CursorPagination
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import BasePermission

from .models import ChatRoom, ChatMessage, ChatRoomMember
from .serializers import (
    ChatRoomSerializer,
    ChatMessageSerializer,
    ChatRoomMemberSerializer,
)

from django.contrib.auth import get_user_model

User = get_user_model()


class IsRoomMember(BasePermission):
    def has_object_permission(self, request, obj):
        return ChatRoomMember.objects.filter(room=obj,
                                             user=request.user).exists()


class ChatRoomCursorPagination(CursorPagination):
    ordering = "-created_at"


class ChatRoomViewSet(viewsets.ModelViewSet):

    permission_classes = [IsRoomMember]
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    pagination_class = ChatRoomCursorPagination

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @staticmethod
    def is_member(room, user):
        return ChatRoomMember.objects.filter(room=room, user=user).exists()

    # GET /api/chat/rooms/{id}/messages/
    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):

        room = self.get_object()

        if not self.is_member(room, request.user):
            return Response({"error": "Not a member"}, status=403)

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

        if self.is_member(room, request.user):
            return Response({"error": "Already a member"}, status=400)

        current_members = ChatRoomMember.objects.filter(room=room).count()

        if current_members >= room.max_members:
            return Response(
                {"error": "Room is full"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        member, created = ChatRoomMember.objects.get_or_create(
            room=room,
            user=user
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
