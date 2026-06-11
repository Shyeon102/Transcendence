import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; // RTK Query 도구
import type { ChatRoom } from "../../types/chat";
import type { RootState } from "../index";

// mockData
const mockRooms: ChatRoom[] = [
  {
    id: 1,
    title: "movie discussion room",
    description: "Let's recommend some recent movies together.",
    created_by: { id: 1, username: "princess" },
    max_members: 4,
    is_active: true,
    created_at: "2026-06-07T10:00:00Z",
    ended_at: null,
  },
  {
    id: 2,
    title: "drama discussion room",
    description: "Let's recommend some recent dramas together.",
    created_by: { id: 2, username: "princess2" },
    max_members: 4,
    is_active: true,
    created_at: "2026-06-07T10:00:00Z",
    ended_at: null,
  },
  {
    id: 3,
    title: "anime discussion room",
    description: "Let's recommend some recent animes together.",
    created_by: { id: 3, username: "princess3" },
    max_members: 4,
    is_active: true,
    created_at: "2026-06-07T10:00:00Z",
    ended_at: null,
  },
];

export const chatApi = createApi({
  // createApi 호출 : 모듈 조립 시작
  reducerPath: "chatApi", // Redux store 안에서 이 API의 고유 ID
  // fetchBaseQuery: 기본 URL 설정
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api", // 서버 요청 보낼 때 기본 URL: .env 파일에 정의된 URL을 가져오는 부분. 만약 없으면 || 뒤의 기본값(localhost:8000/api) 사용
    prepareHeaders: (headers, { getState }) => {
      const token = (getState as () => RootState)().auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // endpoints: 실제 API 호출들
  // builder라는 도구를 사용하여 endpoint들을 담은 객체를 반환
  endpoints: (builder) => ({
    // query는 ChatRoom (토론방)배열을 반환하고, 인자는 void
    getChatRooms: builder.query<ChatRoom[], void>({
      // TODO: 백엔드 pagination 호환 안 됨 (CursorPagination + 'created' field 문제). 친구 fix 후 query로 교체.
      // query: () => "/chat/rooms/",
      queryFn() {
        return { data: mockRooms };
      },
    }),
    // 추후 추가: createChatRoom, getChatMessages 등
    createChatRoom: builder.mutation<
      ChatRoom,
      { title: string; description: string; max_members: number }
    >({
      query: (body) => ({
        url: "/chat/rooms/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetChatRoomsQuery, useCreateChatRoomMutation } = chatApi; // 훅 노출: 이 훅을 컴포넌트에서 호출하면 데이터/로딩/에러 다 받아짐
