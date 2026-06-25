import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Media, Genre } from "../../types/media";
import type { RootState } from "../index";
import StarRating from "../../components/StarRating";

export interface BackendMedia {
  id: number;
  title: string;
  director: string;
  country: string;
  genres: Genre[];
  release_date: string | null;
  description: string;
  image_url: string;
  avg_rating: number; // 백엔드 FloatField
  media_type: string;
  cast: string;
  /* TODO) 백엔드 merge 대기 목록 */
  age_rating?: string;
  language?: string;
  runtime?: number; // 백엔드는 런타임을 분 단위 정수로 준다: ex) 154
  side_poster_url?: string;
}
// 백엔드 목록 응답은 영화 여러 개를 media라는 상자에 담아서
// { media((백엔드가 쓰는 키 이름이랑 똑같아야 함): [영화(BackendMedia), 영화, ...] }로 준다
export interface BackendMediaListResponse {
  media: BackendMedia[];
}

export const mediaApi = createApi({
  // Redux store(거대한 전역 struct) 안에서 이 API 데이터가 들어갈 멤버 이름표. store.mediaApi처럼
  reducerPath: "mediaApi",
  // 이 API의 모든 요청이 공유하는 공통 설정. 기본 URL이랑 헤더(토큰) 같은 걸 한 곳에 모아두는 전역 config struct 같은 것
  baseQuery: fetchBaseQuery({
    // baseUrl: 모든 요청 앞에 자동으로 붙는 기본 주소: 추후에 endpoint에서 "/media/"만 써도 -> baseUrl + "/media/"로 합쳐짐
    // import.meta.env.VITE_API_BASE_URL = .env 파일에 적어둔 환경변수 읽기 (Vite가 제공)
    // || "http://..." = 그 환경변수가 없으면(undefined면) 뒤의 기본값 사용
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
    // getState: 현재 Redux store 전체 상태를 돌려주는 함수
    // (getState as () => RootState): 타입 캐스팅 -> TS한테 "이건 RootState를 반환하는 함수야"라고 알려주는 거
    // 전체 요약 -> "store에서 현재 로그인 토큰을 꺼낸다."
    // if로 감싼 이유: 토큰 없으면(로그아웃) 굳이 빈 Authorization 안 붙이기 위해
    prepareHeaders: (headers, { getState }) => {
      const token = (getState as () => RootState)().auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // 실제 API 호출들
  endpoints: (builder) => ({
    getMediaList: builder.query<Media[], void>({
      // TODO) getMediaDetail (단일 mock, 백엔드 detail endpoint 머지되면 query로 교체)
      query: () => "/media/", // 어떤 주소를 부를지: 이게 baseUrl 뒤에 붙어서 http://localhost:8000/api/media/가 됨
      transformResponse: (response: BackendMediaListResponse) => {
        return response.media.map((movie) => {
          const runtimeMinutes = movie.runtime ?? 0;
          const hours = Math.floor(runtimeMinutes / 60); // 몫 (시간)
          const minutes = runtimeMinutes % 60; // 나머지 (분)
          return {
            id: movie.id,
            title: movie.title,
            director: movie.director ?? "", // 빈 값 방어 : ?? "", ?? 0으로 null/undefined 막기
            genre: movie.genres,
            releaseDate: movie.release_date,
            country: movie.country,
            language: movie.language ?? "",
            cast: movie.cast.split(", "),
            story: movie.description,
            ageRating: movie.age_rating ?? "",
            starRating: movie.avg_rating,
            runtime: `${hours}h ${minutes}m`,
            type: movie.media_type,
            frontPosterUrl: movie.image_url,
            sidePosterUrl: movie.side_poster_url ?? "",
            reviews: [],
          };
        });
      },
    }),
  }),
});

// TODO) 훅 export
export const {} = mediaApi;
