import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../index'
import { setCredentials, logout } from '../slices/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// 토큰 만료시 자동 갱신 미들웨어
const baseQueryWithReauth = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    // 401 에러 = 토큰 만료
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    )

    if (refreshResult.data) {
      // 새 토큰 받으면 스토어에 저장
      api.dispatch(setCredentials(refreshResult.data as any))
      // 원래 요청 재시도
      result = await baseQuery(args, api, extraOptions)
    } else {
      // refresh도 실패하면 로그아웃
      api.dispatch(logout())
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Media',
    'Recommendations',
    'Posts',
    'User',
    'Reviews',
    'ChatRooms',
  ],
  endpoints: () => ({}),
})