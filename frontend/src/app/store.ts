import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import { authApi } from '../store/api/authApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,   // 로그인 유저, access token (메모리)
    ui: uiReducer,       // 모달, 사이드바, 테마, 언어
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
