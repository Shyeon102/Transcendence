from django.core.management.base import BaseCommand
from apps.media.models import Media
from apps.ai.models import MediaEmbedding
from apps.ai.embedding.media_embedding import process_embedding_batch


class Command(BaseCommand):
    help = "Embedding media from DB."

    def add_arguments(self, parser):
        parser.add_argument(
            "--batch-size",
            type=int,
            default=50,
            help="Number of media items to process at a time (default: 50)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print target count without performing actual processing",
        )

    def handle(self, *args, **options):
        batch_size: int = options["batch_size"]
        dry_run: bool = options["dry_run"]

        existing_ids = (
            MediaEmbedding
            .objects
            .values_list("media_id", flat=True)
        )
        media_ids = list(
            Media.objects
            .exclude(id__in=existing_ids)
            .values_list("id", flat=True)
            .iterator()
        )

        total = len(media_ids)
        if total == 0:
            self.stdout.write(
                self.style.SUCCESS("All media items already embedded.")
            )
            return

        batches = [
            media_ids[i:i + batch_size]
            for i in range(0, total, batch_size)
        ]
        self.stdout.write(
            f"Embedding target: {total} items / "
            f"Batch size: {batch_size} / "
            f"Total batches: {len(batches)}"
        )

        if dry_run:
            self.stdout.write(
                self.style.WARNING("[dry-run] Processing not performed.")
            )
            return
        all_success = True
        for idx, batch in enumerate(batches, start=1):
            self.stdout.write(
                f"Batch {idx}/{len(batches)} processing... "
                f"({len(batch)} items)"
            )
            success = process_embedding_batch(batch)
            if success:
                self.stdout.write(
                    self.style.SUCCESS(f"  Batch {idx} completed")
                )
            else:
                all_success = False
                self.stdout.write(
                    self.style.ERROR(f"  Batch {idx} failed")
                )
                continue
        if all_success:
            self.stdout.write(
                self.style.SUCCESS(f"Total {total} items embedded.")
            )
        else:
            self.stdout.write(
                self.style.ERROR(
                    "Embedding finished with errors. Total may be incomplete."
                )
            )
