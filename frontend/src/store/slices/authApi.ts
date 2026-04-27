import { createApi, fakeBaseQuery, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  AuthErrorResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from '../index';
import { setCredentials } from './authSlice';

const buildMockSession = (email: string, username?: string) => ({
  user: {
    id: Date.now(),
    email: email.trim(),
    username: username?.trim() || email.split('@')[0] || 'user',
  },
  token: 'mock-token',
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      async queryFn(credentials) {
        try {
          const data = buildMockSession(credentials.email);
          return { data };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : 'Login failed.',
            },
          };
        }
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (payload) => ({
        url: '/auth/register/',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApi;
