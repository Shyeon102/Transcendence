import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../index'
import { setCredentials, updateTokens, logout } from '../slices/authSlice'

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
    const refreshToken = (api.getState() as RootState).auth.refreshToken

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/token/refresh/',
          method: 'POST',
          body: { refresh: refreshToken }
        },
        api,
        extraOptions
      )

      if (refreshResult.data) {
        // 새 토큰 받으면 스토어에 저장
        const { access, refresh } = refreshResult.data as any
        api.dispatch(updateTokens({ access, refresh }))
        // 원래 요청 재시도
        result = await baseQuery(args, api, extraOptions)
      } else {
        // refresh도 실패하면 로그아웃
        api.dispatch(logout())
      }
    } else {
      // refresh 토큰 없으면 로그아웃
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
  endpoints: (builder) => ({
    // 로그인 엔드포인트
    login: builder.mutation({
      query: (credentials: { username: string; password: string }) => ({
        url: '/auth/token/',
        method: 'POST',
        body: credentials,
      }),
    }),
    // 토큰 갱신 엔드포인트
    refreshToken: builder.mutation({
      query: (refreshToken: string) => ({
        url: '/auth/token/refresh/',
        method: 'POST',
        body: { refresh: refreshToken },
      }),
    }),
  }),
})

export const { useLoginMutation, useRefreshTokenMutation } = apiSlice