from django.db import models
from django.conf import settings


class Post(models.Model):
    """Free board post"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    media_files = models.JSONField(default=list)  # Images, GIF, video

    like_count = models.IntegerField(default=0)
    report_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    is_hidden = models.BooleanField(default=False)  # Admin hide flag

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['-like_count']),
            models.Index(fields=['is_hidden', '-created_at']),
        ]


class Comment(models.Model):
    """Board comments (supports replies)"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE,
                             related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='comments')
    parent_comment = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )

    content = models.TextField()
    media_files = models.JSONField(default=list)

    like_count = models.IntegerField(default=0)
    report_count = models.IntegerField(default=0)
    is_hidden = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['post', 'created_at']),
            models.Index(fields=['parent_comment', 'created_at']),
        ]


class PostLike(models.Model):
    """Post likes (separate model)"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE,
                             related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')  # One like per user per post


class CommentLike(models.Model):
    """Comment likes (separate model)"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE,
                                related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'comment')  # One like per user per comment


class Report(models.Model):
    """Reports"""
    TYPES = (
        ('spam', 'Spam'),
        ('abuse', 'Abuse/Profanity'),
        ('nsfw', 'Inappropriate content'),
        ('copyright', 'Copyright infringement'),
    )
    STATUS = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=20, choices=TYPES)
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS, default='pending')

    # Simple separation instead of ContentType
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True,
                             blank=True, related_name='reports')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True,
                                blank=True, related_name='reports')

    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                                     on_delete=models.SET_NULL, null=True,
                                     blank=True,
                                     related_name='processed_reports')
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', '-created_at']),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(post__isnull=False, comment__isnull=True) |
                    models.Q(post__isnull=True, comment__isnull=False)
                ),
                name='report_target_exactly_one'
            )
        ]


class Follow(models.Model):
    """Follow"""
    follower = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 on_delete=models.CASCADE,
                                 related_name='following')
    following = models.ForeignKey(settings.AUTH_USER_MODEL,
                                  on_delete=models.CASCADE,
                                  related_name='followers')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        indexes = [
            models.Index(fields=['follower']),
            models.Index(fields=['following']),
        ]
        constraints = [
            models.CheckConstraint(
                check=~models.Q(follower=models.F('following')),
                name='cannot_follow_self'
            )
        ]


class TrendingPost(models.Model):
    """Recent trending posts (cache, 3h intervals)"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    score = models.FloatField()
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['-score']),
            models.Index(fields=['-calculated_at']),
        ]
