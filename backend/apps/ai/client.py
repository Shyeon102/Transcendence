from google import genai
from django.conf import settings

EMBEDDING_MODEL = "text-embedding-004"
client = genai.Client(api_key=settings.GEMINI_API_KEY)
RATING_WEIGHT: dict[int, float] = {1: 0.0, 2: 0.2, 3: 0.6, 4: 0.8, 5: 1.0}
ACTION_WEIGHT: dict[str, float] = {'like': 0.7, 'dislike': 0.0}
