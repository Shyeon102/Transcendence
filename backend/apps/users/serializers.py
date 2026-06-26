from rest_framework import serializers
from .models import User
from apps.media.models import Genre


class UserSerializer(serializers.ModelSerializer):
    # Accept favorite_genres as a list of PKs
    followers_count = serializers.IntegerField(source="followers.count",
                                               read_only=True)
    following_count = serializers.IntegerField(source="following.count",
                                               read_only=True)
    favorite_genres = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(),
        many=True,
        required=False,
    )

    # Accept onboarding payload fields from the frontend but don't persist
    favorite_titles = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    onboarding_answers = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "avatar_url",
            "bio",
            "onboarding_completed",
            "is_staff",
            "favorite_genres",
            "favorite_titles",
            "onboarding_answers",
            "is_staff",
            "followers_count",
            "following_count",
        ]
        read_only_fields = ["is_staff"]


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")

    def update(self, instance, validated_data):
        # Remove frontend-only fields before delegating to super()
        validated_data.pop("favorite_titles", None)
        validated_data.pop("onboarding_answers", None)
        return super().update(instance, validated_data)


class PublicUserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "avatar_url",
            "bio",
            "followers_count",
            "following_count",
            "is_following",
            "reviews",
        ]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_is_following(self, obj):
        request = self.context["request"]
        return obj.followers.filter(follower=request.user).exists()

    def get_reviews(self, obj):
        from apps.media.serializers import ReviewSerializer
        return ReviewSerializer(obj.reviews.all(), many=True).data
