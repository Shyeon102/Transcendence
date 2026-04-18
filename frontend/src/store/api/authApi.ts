import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../../features/auth/authSlice';
import { mockLogin, mockSignup } from '../../features/auth/mockAuth';
import type {
  AuthErrorResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from '../../types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery<AuthErrorResponse>(),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      async queryFn(credentials) {
        try {
          const data = await mockLogin(credentials);
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
      async queryFn(payload) {
        try {
          const data = await mockSignup(payload);
          return { data };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : 'Signup failed.',
            },
          };
        }
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApi;
