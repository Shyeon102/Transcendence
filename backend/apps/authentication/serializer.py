from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
import re
# from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def validate_password_strength(password):
    if len(password) < 8:
        raise serializers.ValidationError("Password must be "
                                          "at least 8 characters.")
    if not re.search(r'[A-Z]', password):
        raise serializers.ValidationError("Password must contain at"
                                          "least one uppercase letter.")
    if not re.search(r'[0-9]', password):
        raise serializers.ValidationError("Password must contain"
                                          " at least one number.")
    if not re.search(r'[^a-zA-Z0-9]', password):
        raise serializers.ValidationError("Password must contain at "
                                          "least one special character.")


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if email and password:
            user = authenticate(request=self.context.get("request"),
                                email=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials.")
        else:
            raise serializers.ValidationError
        ("Both email and password are required.")

        if user.is_banned:
            raise serializers.ValidationError("User is banned.")
        data["user"] = user
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    passwordConfirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["email", "username", "password", "passwordConfirm"]

    def validate_password(self, value):
        validate_password_strength(value)
        return value

    def create(self, validated_data):
        validated_data.pop("passwordConfirm", None)
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            auth_provider="local",
        )
        return user
