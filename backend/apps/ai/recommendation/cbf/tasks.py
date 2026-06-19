from celery import shared_task
from django.contrib.auth import get_user_model
from .user_embedding import build_user_embedding

User = get_user_model()

@shared_task(name="apps.ai.recommendation.cbf.tasks.update_user_embedding_async")
def update_user_embedding_async(user_id: int):
    try:
        user = User.objects.get(id=user_id)
        build_user_embedding(user)
    except ValueError as e:
        print(f"User {user_id} has no ratings or interactions yet. Skipping embedding update.")
    except User.DoesNotExist:
        pass