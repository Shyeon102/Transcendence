import sys
from django.core.management.base import BaseCommand
from apps.ai.recommendation.cf.tasks import train_svd_model

class Command(BaseCommand):
    help = "Train svd model manually."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dim',
            type=int,
            default=12,
            help='SVD Latent Dimension (default: 12)',
        )

    def handle(self, *args, **options):
        latent_dim = options['dim']

        self.stdout.write(self.style.WARNING(f"Preparing training with latent dimension {latent_dim}.."))
        self.stdout.write(self.style.NOTICE("Gathering ratings data and training the SVD model..."))

        try:
            new_model = train_svd_model(latent_dim=latent_dim)
            
            if new_model is None:
                self.stdout.write(
                    self.style.ERROR("Train failed: Not enough ratings data to train a new SVD model.")
                )
                sys.exit(1)

            self.stdout.write(self.style.SUCCESS("=" * 60))
            self.stdout.write(self.style.SUCCESS(f"SVD training completed successfully!"))
            self.stdout.write(self.style.SUCCESS(f"   - version: {new_model.version}"))
            self.stdout.write(self.style.SUCCESS(f"   - user count: {new_model.user_count}"))
            self.stdout.write(self.style.SUCCESS(f"   - item count: {new_model.item_count}"))
            self.stdout.write(self.style.SUCCESS(f"   - latent dimension: {new_model.latent_dim}"))
            self.stdout.write(self.style.SUCCESS("=" * 60))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"SVD manual training failed: {str(e)}"))
            sys.exit(1)