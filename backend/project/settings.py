from pathlib import Path
import os
from datetime import timedelta


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "dev-secret-key"
DEBUG = True

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",

    "apps.authentication",
    "apps.users",
    "apps.chat",
    "apps.community",
    "apps.media",
    "corsheaders",
]

#send email, now to console, change later to actual email
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.CursorPagination',
    'PAGE_SIZE': 20,
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated"
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication"
    ],
}

RET_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_HTTPONLY": False,
    "JWT_AUTH_COOKIE": "core-app-auth",
    "JWT_AUTH_REFRESH_COOKIE": "core-refresh-token"
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'ALGORITHM': 'HS256', #signing algorithm, do we need one ?
}

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

ROOT_URLCONF = "project.urls"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB"),
        "USER": os.getenv("POSTGRES_USER"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST", "db"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

AUTH_USER_MODEL = "users.User"
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False #not sure yet
ACCOUNT_UNIQUE_EMAIL = True

STATIC_URL = "/static/"

CORS_ALLOW_ALL_ORIGINS = True

AUTHENTICATION_BACKENDS = {
    'django.contrib.auth.backends.ModelBackend',
}
