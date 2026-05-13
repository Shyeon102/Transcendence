
SEARCH_QUERY = """
query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear:
    Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: $sort) {
      id
      title { romaji english native }
      format
      status
      season
      seasonYear
      episodes
      duration
      genres
      tags { name rank }
      averageScore
      meanScore
      popularity
      trending
      favourites
      studios(isMain: true) { nodes { name } }
      source
      startDate { year month day }
      endDate { year month day }
    }
  }
}
"""
