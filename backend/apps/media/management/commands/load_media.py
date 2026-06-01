from django.core.management.base import BaseCommand, CommandError

from apps.media.services.anilist.client import AniListClient
from apps.media.services.anilist.parsers import parse_anime
from apps.media.services.ingestion import upsert_media_items
from apps.media.services.tmdb.client import TMDBClient
from apps.media.services.tmdb.parsers import parse_movie, parse_tv_drama


class Command(BaseCommand):
    help = "Load media data from external providers into the local database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--source",
            choices=["tmdb", "anilist", "all"],
            default="all",
        )
        parser.add_argument("--limit", type=int, default=300)

    def handle(self, *args, **options):
        source = options["source"]
        limit = options["limit"]

        if limit < 1:
            raise CommandError("--limit must be greater than 0")

        summary = {}

        if source in {"tmdb", "all"}:
            raw_media = TMDBClient().fetch_movies_and_dramas(limit=limit)
            tmdb_items = [
                parse_movie(item) for item in raw_media["movies"]
            ] + [
                parse_tv_drama(item) for item in raw_media["dramas"]
            ]
            summary["tmdb"] = upsert_media_items(tmdb_items)

        if source in {"anilist", "all"}:
            raw_anime = AniListClient().fetch_anime(limit=limit)
            anilist_items = [parse_anime(item) for item in raw_anime]
            summary["anilist"] = upsert_media_items(anilist_items)

        self.stdout.write(self.style.SUCCESS(str(summary)))
