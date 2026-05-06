import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../types/user'

// 저장할 데이터 타입 정의
// src/types/user.ts 로 옮기고 import로 가져와서 진행
/*interface User {
  id: number
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  bio?: string
  favoriteGenres?: number[]
  favoriteCountries?: string[]
  isStaff?: boolean
}*/

interface AuthState {
  user: User | null        // 로그인한 유저 정보
  accessToken: string | null  // JWT 토큰
  isAuthenticated: boolean    // 로그인 여부
}

// 초기값 (앱 처음 시작할 때)
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 로그인 성공했을 때
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.token
      state.isAuthenticated = true
    },
    // 로그아웃했을 때
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
  },
})

export const { setCredentials, logout, updateProfile } = authSlice.actions
export default authSlice.reducer