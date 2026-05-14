"""
AniList integration module

This module provides functions to fetch anime data from AniList GraphQL API
and parse it into a format suitable for the Media model.

All operations are self-contained within this module.
"""

from .client import AniListClient, get_anilist_client
from .parsers import parse_anime_data, parse_anime_list, extract_genres
from .queries import (
    SEARCH_ANIME_QUERY,
    SEASONAL_ANIME_QUERY,
    TRENDING_ANIME_QUERY,
    ANIME_DETAILS_QUERY,
)


def search_anime(query: str, page: int = 1, per_page: int = 10):
    """
    Search for anime on AniList

    Args:
        query: Search query string
        page: Page number (default: 1)
        per_page: Results per page (default: 10)

    Returns:
        Tuple of (list of parsed anime dicts, pagination info)
    """
    client = get_anilist_client()
    try:
        variables = {
            'search': query,
            'page': page,
            'perPage': per_page,
        }
        response = client.query(SEARCH_ANIME_QUERY, variables)
        page_data = response.get('Page', {})
        return parse_anime_list(page_data)
    finally:
        client.close()


def get_seasonal_anime(season: str, year: int, page: int = 1,
                       per_page: int = 10):
    """
    Get anime from a specific season and year

    Args:
        season: Season (WINTER, SPRING, SUMMER, FALL)
        year: Year
        page: Page number (default: 1)
        per_page: Results per page (default: 10)

    Returns:
        Tuple of (list of parsed anime dicts, pagination info)
    """
    client = get_anilist_client()
    try:
        variables = {
            'season': season.upper(),
            'seasonYear': year,
            'page': page,
            'perPage': per_page,
        }
        response = client.query(SEASONAL_ANIME_QUERY, variables)
        page_data = response.get('Page', {})
        return parse_anime_list(page_data)
    finally:
        client.close()


def get_trending_anime(page: int = 1, per_page: int = 10):
    """
    Get trending anime

    Args:
        page: Page number (default: 1)
        per_page: Results per page (default: 10)

    Returns:
        Tuple of (list of parsed anime dicts, pagination info)
    """
    client = get_anilist_client()
    try:
        variables = {
            'page': page,
            'perPage': per_page,
        }
        response = client.query(TRENDING_ANIME_QUERY, variables)
        page_data = response.get('Page', {})
        return parse_anime_list(page_data)
    finally:
        client.close()


def get_anime_details(anime_id: int):
    """
    Get details for a specific anime by ID

    Args:
        anime_id: AniList anime ID

    Returns:
        Parsed anime dict or None if not found
    """
    client = get_anilist_client()
    try:
        variables = {'id': anime_id}
        response = client.query(ANIME_DETAILS_QUERY, variables)
        anime_data = response.get('Media')
        if anime_data:
            return parse_anime_data(anime_data)
        return None
    finally:
        client.close()


def save_anime_to_db(anime_data):
    """
    Convert AniList parsed data to Media model and save to database

    Args:
        anime_data: Dictionary from parse_anime_data, list of dicts, or
        tuple returned by
            search/get functions like (parsed_list, pagination)

    Returns:
        Media instance, list of Media instances, or None when input is invalid
    """
    from apps.media.models import Media, Genre

    # Accept the tuple form returned by get_* functions: (results, pagination)
    if isinstance(anime_data, tuple) and len(anime_data) > 0:
        anime_data = anime_data[0]

    if isinstance(anime_data, list):
        saved_items = [save_anime_to_db(item) for item in anime_data]
        return saved_items

    if not isinstance(anime_data, dict):
        raise TypeError(
            'save_anime_to_db expects a parsed anime dict, a list of dicts, '
            'or a tuple returned by get_* functions.'
        )

    # Extract genres separately (M2M field)
    genre_names = anime_data.pop('genres', [])

    # Create/get Media object with other fields
    media, created = Media.objects.get_or_create(
        title=anime_data['title'],
        defaults=anime_data
    )

    # Add genres
    for genre_name in genre_names:
        genre, _ = Genre.objects.get_or_create(name=genre_name)
        media.genres.add(genre)

    return media


__all__ = [
    'search_anime',
    'get_seasonal_anime',
    'get_trending_anime',
    'get_anime_details',
    'save_anime_to_db',
    'extract_genres',
    'parse_anime_data',
    'parse_anime_list',
    'AniListClient',
    'get_anilist_client',
]
