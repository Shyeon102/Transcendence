import sys
from django.core.management.base import BaseCommand
from apps.ai.service.recommendation.cf.svd_model import train_svd_model


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

        self.stdout.write(self.style.WARNING(
            f"Preparing training with latent dimension {latent_dim}..")
            )
        self.stdout.write(self.style.NOTICE(
            "Gathering ratings data and training the SVD model...")
            )

        try:
            new_model = train_svd_model(latent_dim=latent_dim)

            if new_model is None:
                self.stdout.write(
                    self.style.ERROR("Train failed: Not enough data.")
                )
                sys.exit(1)

            self.stdout.write(self.style.SUCCESS(
                f"SVD_{new_model.version} training completed successfully!")
            )

        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f"SVD manual training failed: {str(e)}")
            )
            sys.exit(1)
