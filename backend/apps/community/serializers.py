from rest_framework import serializers
from .models import Post, Comment, Report


class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Post
        fields = ["id", "title", "content", "media_files", "created_at",
                  "user", "username", "like_count", "report_count", "is_hidden"]
        read_only_fields = ["id", "user", "created_at"]


class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "user",
            "username",
            "parent_comment",
            "content",
            "media_files",
            "like_count",
            "report_count",
            "is_hidden",
            "created_at",
            "replies",
        ]

        read_only_fields = [
            "id",
            "user",
            "post",
            "like_count",
            "report_count",
            "is_hidden",
            "created_at",
        ]

    def get_replies(self, obj):
        replies = obj.replies.filter(is_hidden=False)
        return CommentSerializer(replies, many=True).data


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            "id",
            "report_type",
            "reason",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]
