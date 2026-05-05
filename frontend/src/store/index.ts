import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './api/apiSlice'
import { authApi } from './slices/authApi'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, authApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

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
