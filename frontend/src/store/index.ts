import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import { authApi } from "./api/authApi";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import { chatApi } from "./api/chatApi";
import { mediaApi } from "./api/mediaApi";
import chatReducer from "./slices/chatSlice";
import { clearAuthSession, saveAuthSession } from "../features/auth/authStorage";
import type {
  AuthErrorResponse,
  AuthSession,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  SignupRequest,
  SignupResponse,
  StoredUser,
} from '../types';

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
    [mediaApi.reducerPath]: mediaApi.reducer,
  },
  // 상태 변경 액션이 reducer에 도달하기 전 거치는 중간 처리기
  // concat: 배열에 새 요소 붙이는 메서드: C 비유: 배열 끝에 append
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, authApi.middleware, chatApi.middleware, mediaApi.middleware),
});

let previousAuthSession = "";

store.subscribe(() => {
  const { user, accessToken, refreshToken, isAuthenticated } = store.getState().auth;
  const serializedSession = JSON.stringify({ user, accessToken, refreshToken, isAuthenticated });

  if (serializedSession === previousAuthSession) {
    return;
  }

  previousAuthSession = serializedSession;

  if (isAuthenticated && user && accessToken) {
    saveAuthSession({ user, accessToken, refreshToken });
    return;
  }

  clearAuthSession();
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type {
  AuthErrorResponse,
  AuthSession,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  SignupRequest,
  SignupResponse,
  StoredUser,
};
