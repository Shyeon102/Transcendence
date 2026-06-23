from pathlib import Path
import os
from datetime import timedelta
from celery.schedules import crontab


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "dev-secret-key"
DEBUG = True

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "daphne",
    "channels",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'rest_framework_simplejwt.token_blacklist',

    "rest_framework",

    "apps.authentication",
    "apps.users",
    "apps.chat",
    "apps.community",
    "apps.media",
    "apps.ai.apps.AiConfig",
    "corsheaders",
]

# Normalize REDIS_URL environment variable. Accept formats like:
# - redis (host)
# - host:port/db
# - redis://host:port/db
# and produce a proper redis URL for other settings below.
# need to check further if really needed, but it was useful
# for development and testing with docker compose,
# where we can just set REDIS_URL to "redis" and it will work
# without needing to specify the full URL with port and db index
_redis_env = os.getenv('REDIS_URL', 'redis')
if _redis_env.startswith('redis://'):
    _redis_url = _redis_env
elif ':' in _redis_env or '/' in _redis_env:
    _redis_url = f"redis://{_redis_env}"
else:
    _redis_url = f"redis://{_redis_env}:6379/0"

# Ensure a DB index for the cache (use DB 1 by default)
if '/' in _redis_url.split('://', 1)[1]:
    _cache_location = _redis_url
else:
    _cache_location = _redis_url.rstrip('/') + '/1'

CACHES = {
    "default": {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': _cache_location,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", _redis_url)
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", _redis_url)

CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "Europe/Paris"
CELERY_ENABLE_UTC = True

CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60

CELERY_BEAT_SCHEDULE = {
    "run-svd-training-every-midnight": {
        "task": "apps.ai.service.recommendation.cf.tasks.run_svd_training",
        "schedule": crontab(hour=3, minute=0),
        # "schedule": crontab(minute=0),
    },
}

# send email, now to console, change later to actual email
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
    'ALGORITHM': 'HS256',  # signing algorithm, do we need one ?
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
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    'apps.core.middleware.CommonErrorResponseMiddleware',
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
ACCOUNT_USERNAME_REQUIRED = False  # not sure yet
ACCOUNT_UNIQUE_EMAIL = True

STATIC_URL = "/static/"

CORS_ALLOW_ALL_ORIGINS = True

AUTHENTICATION_BACKENDS = {
    'django.contrib.auth.backends.ModelBackend',
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            # channels_redis accepts full redis URL strings in the hosts list.
            # Reuse normalized URL from above.
            'hosts': [_redis_url],
        },
    },
}

ASGI_APPLICATION = 'project.asgi.application'
