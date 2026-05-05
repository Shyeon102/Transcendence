import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// 저장할 데이터 타입 정의
interface User {
  id: number
  username: string
  email: string
}

interface AuthState {
  user: User | null        // 로그인한 유저 정보
  accessToken: string | null  // JWT 액세스 토큰
  refreshToken: string | null // JWT 리프레시 토큰
  isAuthenticated: boolean    // 로그인 여부
}

// 초기값 (앱 처음 시작할 때)
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 로그인 성공했을 때
    setCredentials: (state, action: PayloadAction<{
      user: User;
      access: string;
      refresh: string;
    }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.access
      state.refreshToken = action.payload.refresh
      state.isAuthenticated = true
    },
    // 토큰 갱신했을 때
    updateTokens: (state, action: PayloadAction<{
      access: string;
      refresh?: string;
    }>) => {
      state.accessToken = action.payload.access
      if (action.payload.refresh) {
        state.refreshToken = action.payload.refresh
      }
    },
    // 로그아웃했을 때
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, updateTokens, logout } = authSlice.actions
export default authSlice.reducer