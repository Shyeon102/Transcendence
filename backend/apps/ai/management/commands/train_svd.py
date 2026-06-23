from django.core.management.base import BaseCommand, CommandError
from apps.ai.service.recommendation.cf.svd_model import train_svd_model
from apps.ai.service.recommendation.cf.cf import cache_cf_scores


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
        self.stdout.write(
            "Gathering ratings data and training the SVD model..."
            )
        try:
            new_model = train_svd_model(latent_dim=latent_dim)

            if new_model is None:
                raise CommandError("Train failed: Not enough data.")

            self.stdout.write(self.style.SUCCESS(
                f"SVD_{new_model.version} training completed successfully!")
            )
            self.stdout.write("Caching CF scores for all users...")
            cache_cf_scores(new_model)
            self.stdout.write(self.style.SUCCESS(
                    "CF scores cached successfully.")
                )

        except CommandError:
            raise
        except Exception as e:
            raise CommandError(f"SVD manual training failed: {e}")
