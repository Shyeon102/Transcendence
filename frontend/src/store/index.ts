import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import { authApi } from "./api/authApi";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import { chatApi } from "./api/chatApi";
import chatReducer from "./slices/chatSlice";

export const store = configureStore({
  // 각 도메인 상태를 어떻게 관리할지
  reducer: {
    // 단순 slice
    auth: authReducer,
    ui: uiReducer,
    chat: chatReducer,
    // RTK Query API
    [apiSlice.reducerPath]: apiSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  // 상태 변경 액션이 reducer에 도달하기 전 거치는 중간 처리기
  // concat: 배열에 새 요소 붙이는 메서드: C 비유: 배열 끝에 append
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, authApi.middleware, chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  favoriteGenres?: number[];
  favoriteCountries?: string[];
  isStaff?: boolean;
}

export interface StoredUser extends AuthUser {
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  passwordConfirm: string;
  favoriteGenres?: number[];
}

export interface SignupResponse {
  user: AuthUser;
  token: string;
}

export interface AuthErrorResponse {
  message: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}
