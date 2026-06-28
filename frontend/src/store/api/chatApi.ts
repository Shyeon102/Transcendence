import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; // RTK Query 도구
import type { ChatRoom, ChatMessage } from "../../types/chat";
import type { RootState } from "../index";

export const chatApi = createApi({
  // createApi 호출 : 모듈 조립 시작
  reducerPath: "chatApi", // Redux store 안에서 이 API의 고유 ID
  tagTypes: ["ChatRoom"],
  // fetchBaseQuery: 기본 URL 설정
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "https://localhost:8443/api", // 서버 요청 보낼 때 기본 URL: .env 파일에 정의된 URL을 가져오는 부분. 만약 없으면 || 뒤의 기본값(localhost:8443/api) 사용
    prepareHeaders: (headers, { getState }) => {
      const state = (getState as () => RootState)();
      const token = state.auth.accessToken;
      headers.set("Accept-Language", state.ui.language);
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
      query: () => "/chat/rooms/",
      transformResponse: (response: { results: ChatRoom[] }) =>
        response.results,
      providesTags: ["ChatRoom"],
    }),
    createChatRoom: builder.mutation<
      ChatRoom,
      { title: string; description: string; max_members: number }
    >({
      query: (body) => ({
        url: "/chat/rooms/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ChatRoom"],
    }),
    deleteChatRoom: builder.mutation<void, number>({
      query: (roomId) => ({
        url: `/chat/rooms/${roomId}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatRoom"],
    }),
    joinChatRoom: builder.mutation<void, number>({
      query: (roomId) => ({
        url: `/chat/rooms/${roomId}/members/`,
        method: "POST",
      }),
    }),
    getChatMessages: builder.query<ChatMessage[], number>({
      query: (roomId) => `/chat/rooms/${roomId}/messages/`,
      transformResponse: (
        response: {
          id: number;
          user: { id: number; username: string };
          content: string;
          message_type: string;
          created_at: string;
        }[],
      ) =>
        response.map((m) => ({
          id: m.id,
          userId: m.user.id,
          username: m.user.username,
          content: m.content,
          messageType: "message" as const,
          createdAt: m.created_at,
        })),
    }),
  }),
});

export const {
  useGetChatRoomsQuery,
  useCreateChatRoomMutation,
  useDeleteChatRoomMutation,
  useGetChatMessagesQuery,
  useJoinChatRoomMutation,
} = chatApi; // 훅 노출: 이 훅을 컴포넌트에서 호출하면 데이터/로딩/에러 다 받아짐
