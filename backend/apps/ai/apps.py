from django.apps import AppConfig


class AiConfig(AppConfig):
    name = "apps.ai"

    def ready(self):
        import apps.ai.recommendation.signals  # noqa: F401
