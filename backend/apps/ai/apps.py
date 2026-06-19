from django.apps import AppConfig
import threading

class AIConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ai'

    def ready(self):
        import apps.ai.recommendation.cbf.signals

    try:
        from apps.ai.models import CFModel
        if not CFModel.objects.exists():
            print("No CFModel found. Training SVD model in a separate thread...")
            from apps.ai.recommendation.cf.tasks import run_svd_training
            threading.Thread(target=run_svd_training).start()
    except Exception as e:
        pass