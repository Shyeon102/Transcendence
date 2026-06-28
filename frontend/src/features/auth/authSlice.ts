import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthSession, AuthUser, RefreshTokenResponse } from '../../types';
import { loadAuthSession, clearAuthSession, saveAuthSession } from './authStorage';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const persistedSession = loadAuthSession();

const initialState: AuthState = persistedSession
  ? {
      user: persistedSession.user,
      accessToken: persistedSession.accessToken,
      refreshToken: persistedSession.refreshToken,
      isAuthenticated: true,
    }
  : {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthSession>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.isAuthenticated = true;
      saveAuthSession({
        user: action.payload.user,
        accessToken: action.payload.token,
        refreshToken: action.payload.refreshToken ?? null,
      });
    },
    updateTokens: (state, action: PayloadAction<RefreshTokenResponse>) => {
      state.accessToken = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = Boolean(state.user && state.accessToken);
      if (state.user) {
        saveAuthSession({
          user: state.user,
          accessToken: action.payload.token,
          refreshToken: action.payload.refreshToken ?? state.refreshToken,
        });
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      clearAuthSession();
    },
    updateProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload };
        state.user = updatedUser;
        if (state.accessToken) {
          saveAuthSession({
            user: updatedUser,
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
          });
        }
      }
    },
  },
});

export const { setCredentials, updateTokens, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
