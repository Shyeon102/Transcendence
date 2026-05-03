from django.db import models
from django.conf import settings


class ChatRoom(models.Model):
    """Real-time discussion room (maximum 10 system-wide)"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                                   on_delete=models.CASCADE,
                                   related_name='created_rooms')
    
    max_members = models.IntegerField(default=4)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)


class ChatRoomMember(models.Model):
    """Discussion room member"""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE,
                             related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name='chat_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('room', 'user')


class ChatMessage(models.Model):
    """Discussion chat message (stored one row per message)"""
    MESSAGE_TYPES = (
        ('message', 'Message'),
        ('join', 'Join notification'),
        ('leave', 'Leave notification'),
    )
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE,
                             related_name='messages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name='chat_messages')
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES,
                                    default='message')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
        ]
