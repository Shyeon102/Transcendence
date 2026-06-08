from django.http import JsonResponse
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings
from django.contrib.auth import get_user_model
import logging


class CommonErrorResponseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            return JsonResponse({
                "success": False,
                "error": str(e),
            }, status=500)

    def process_exception(self, request, exception):
        return JsonResponse({
            "success": False,
            "error": str(exception),
        }, status=500)


class JWTAuthMiddleware(BaseMiddleware):

    logger = logging.getLogger(__name__)

    async def __call__(self, scope, receive, send):
        scope["user"] = AnonymousUser()

        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)

        token = params.get("token", [None])[0]

        if token:
            User = get_user_model()

            try:
                # Run token validation and DB lookup in a thread to avoid
                # running synchronous ORM calls in async context
                # it was needed cause of the way JWT works,
                # we need to validate the token and get the user from the
                # database, and both operations are synchronous
                # didnt find a better way to do it without blocking event loop
                def validate_and_get_user(tkn):
                    validated = UntypedToken(tkn)

                    user_id_claim = jwt_api_settings.USER_ID_CLAIM
                    user_id_field = jwt_api_settings.USER_ID_FIELD
                    user_id = validated.get(user_id_claim)

                    if user_id is None:
                        raise InvalidToken("Token missing user id")

                    return User.objects.get(**{user_id_field: user_id})

                user = await sync_to_async(validate_and_get_user)(token)

                scope["user"] = user

            except (InvalidToken, TokenError, User.DoesNotExist):
                scope["user"] = AnonymousUser()
            except Exception:
                # Log unexpected exceptions
                try:
                    self.logger.exception("Unexpected error in JWT middleware")
                except Exception:
                    pass
                scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
