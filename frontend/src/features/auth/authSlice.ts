import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthSession, AuthUser, RefreshTokenResponse } from '../../types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
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
    },
    updateTokens: (state, action: PayloadAction<RefreshTokenResponse>) => {
      state.accessToken = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = Boolean(state.user && state.accessToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
  },
});

export const { setCredentials, updateTokens, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
