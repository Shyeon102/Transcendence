from google import genai

EMBEDDING_MODEL = "text-embedding-004"
client = genai.Client()
RATING_WEIGHT: dict[int, float] = {1: 0.0, 2: 0.2, 3: 0.6, 4: 0.8, 5: 1.0}
ACTION_WEIGHT: dict[str, float] = {'like': 0.7, 'dislike': 0.0}
