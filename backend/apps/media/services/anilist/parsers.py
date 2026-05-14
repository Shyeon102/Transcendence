from typing import Dict, List
from datetime import date


def parse_anime_data(anime: Dict) -> Dict:
    """
    Parse AniList anime data and extract fields for Media model

    Args:
        anime: Raw anime data from AniList API

    Returns:
        Dict with keys matching Media model fields
    """

    # Extract title (prefer English, fallback to romaji, then native)
    title = (
        anime.get('title', {}).get('english') or
        anime.get('title', {}).get('romaji') or
        anime.get('title', {}).get('native') or
        'Unknown'
    )

    # Extract release date
    release_date = None
    start_date = anime.get('startDate', {})
    if start_date and start_date.get('year'):
        try:
            release_date = date(
                start_date.get('year'),
                start_date.get('month', 1),
                start_date.get('day', 1)
            )
        except (ValueError, TypeError):
            pass

    # Extract genres (AniList provides them as a list)
    genres = anime.get('genres', [])

    # Extract studios (directors in anime context)
    director = ''
    studios = anime.get('studios', {}).get('nodes', [])
    if studios:
        director = ', '.join([s.get('name', '') for s in studios
                              if s.get('name')])

    # Extract description
    description = anime.get('description', '')
    # Clean up HTML tags if present
    import re
    description = re.sub(r'<[^>]+>', '', description) if description else ''

    # Extract cover image
    image_url = anime.get('coverImage', {}).get('large', '')

    # Extract rating
    avg_rating = anime.get('averageScore', 0)
    if avg_rating:
        avg_rating = avg_rating / 10.0
        # AniList uses 0-100 scale, convert to 0-10

    # Get rating count (popularity as proxy)
    rating_count = anime.get('popularity', 0)

    return {
        'title': title,
        'media_type': 'anime',
        'genres': genres,
        'country': '',  # AniList doesn't provide country for anime
        'description': description,
        'director': director,
        'cast': '',  # AniList doesn't provide cast info in basic query
        'release_date': release_date,
        'image_url': image_url,
        'avg_rating': avg_rating,
        'rating_count': rating_count,
    }


def parse_anime_list(page_data: Dict) -> tuple[List[Dict], Dict]:
    """
    Parse a page of anime results from AniList

    Args:
        page_data: Page data from AniList API

    Returns:
        Tuple of (list of parsed anime dicts, pagination info)
    """

    media_list = page_data.get('media', [])
    parsed_anime = [parse_anime_data(anime) for anime in media_list]

    pagination = page_data.get('pageInfo', {})

    return parsed_anime, pagination


def extract_genres(anime_list: List[Dict]) -> set[str]:
    """
    Extract all unique genres from a list of parsed anime

    Args:
        anime_list: List of parsed anime dicts

    Returns:
        Set of unique genre names
    """
    genres = set()
    for anime in anime_list:
        genres.update(anime.get('genres', []))
    return genres
