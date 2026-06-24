from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.media.models import Media
from apps.ai.models import MediaEmbedding
from apps.ai.embedding.media_embedding import (
    build_source_text,
    get_embeddings_batch,
)
from apps.ai.service.embedding.user_embedding import build_user_embedding

BATCH_SIZE = 50
User = get_user_model()


class Command(BaseCommand):
    help = "Rebuild media + user embeddings"

    def handle(self, *args, **options):
        self.stdout.write("Starting embedding rebuild...")

        # -----------------------------
        # 1. MEDIA EMBEDDINGS (BATCHED)
        # -----------------------------
        self.stdout.write("Building media embeddings...")

        media_ids = list(Media.objects.values_list("id", flat=True))

        if media_ids:
            total = len(media_ids)

            for i in range(0, total, BATCH_SIZE):
                batch = media_ids[i:i + BATCH_SIZE]

                texts = [
                    build_source_text(Media.objects.get(id=mid))
                    for mid in batch
                ]

                vectors = get_embeddings_batch(texts)

                for media_id, text, vector in zip(batch, texts, vectors):
                    MediaEmbedding.objects.update_or_create(
                        media_id=media_id,
                        defaults={
                            "embedding": vector,
                            "source_text": text,
                        }
                    )

                self.stdout.write(
                    f"✔ Media batch {i}-{i + len(batch)} processed"
                )

            self.stdout.write(f"✔ Media embeddings built: {total}")
        else:
            self.stdout.write("No media found")

        # -----------------------------
        # 2. USER EMBEDDINGS
        # -----------------------------
        self.stdout.write("Building user embeddings...")

        users = User.objects.all()
        self.stdout.write(f"Processing {users.count()} users...")

        success = 0
        failed = 0

        for user in users:
            try:
                build_user_embedding(user)
                success += 1
            except Exception as e:
                failed += 1
                self.stdout.write(f"✘ User {user.id} failed: {e}")

        # -----------------------------
        # SUMMARY
        # -----------------------------
        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Media: {len(media_ids)}, "
                f"Users: {success}, Failed: {failed}"
            )
        )
