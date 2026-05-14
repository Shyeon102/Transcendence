# GraphQL queries for AniList API

SEARCH_ANIME_QUERY = """
query ($page: Int, $perPage: Int, $search: String) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      description
      genres
      averageScore
      popularity
      coverImage {
        large
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
"""

SEASONAL_ANIME_QUERY = """
query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(type: ANIME, season: $season, seasonYear: $seasonYear,
    sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      description
      genres
      averageScore
      popularity
      coverImage {
        large
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
"""

TRENDING_ANIME_QUERY = """
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(type: ANIME, sort: TRENDING_DESC) {
      id
      title {
        romaji
        english
        native
      }
      description
      genres
      averageScore
      popularity
      trending
      coverImage {
        large
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
"""

ANIME_DETAILS_QUERY = """
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    description
    genres
    averageScore
    popularity
    coverImage {
      large
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    studios(isMain: true) {
      nodes {
        name
      }
    }
  }
}
"""
