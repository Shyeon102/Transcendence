import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import chatReducer from './slices/chatSlice';
import { authApi } from './slices/authApi';
import type {
  AuthErrorResponse,
  AuthSession,
  AuthUser,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  StoredUser,
} from '../types';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    chat: chatReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type {
  AuthErrorResponse,
  AuthSession,
  AuthUser,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  StoredUser,
};
