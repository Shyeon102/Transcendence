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
  frontPosterUrl: string;
  sidePosterUrl: string;
  reviews: Review[];
}

export interface Review {
  id: number; // 미디어
  userId: number;
  userName: string;
  content: string; // review text
  rating: number; // (1-5)
  visibility: "public" | "followers" | "private";
  createdAt: string; // 작성일
  updatedAt: string; // 백엔드에서 날짜를 JSON으로 보낼 때 "2024-01-26T10:30:00Z" 이런 문자열로 옴
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
