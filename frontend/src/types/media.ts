export interface Media {
  id: number;
  title: string;
  director: string;
  genre: Genre[]; // ex) [Crime] [Thriller]
  releaseDate: string; // ex) "1994-10-26"
  country: string;
  language: string;
  cast: string[];
  story: string;
  ageRating: string; // ex) "PG-15", "R", "18+"
  starRating: number;
  runtime: string;
  type: string; // (Movie/Series/Animation)
  posterUrl: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MediaInteraction {
  userId: number;
  mediaId: number;
  watch: boolean;
  like: boolean;
  dislike: boolean;
  wishlist: boolean;
}
