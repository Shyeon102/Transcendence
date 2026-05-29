import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { mockLogin, mockSignup, mockUpdateProfile } from '../../features/auth/mockAuth';
import { logout, setCredentials, updateTokens } from '../../features/auth/authSlice';
import type { RootState } from '../index';
import type {
  AuthErrorResponse,
  AuthSession,
  AuthUser,
  LoginRequest,
  LoginResponse,
  OnboardingAnswers,
  RefreshTokenResponse,
  SignupRequest,
  SignupResponse,
} from '../../types';

type RawAuthUser = {
  id?: number;
  email?: string;
  username?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  avatarUrl?: string;
  avatar_url?: string;
  bio?: string;
  favoriteGenres?: number[];
  favorite_genres?: number[];
  favoriteTitles?: string[];
  favorite_titles?: string[];
  onboardingAnswers?: OnboardingAnswers;
  onboarding_answers?: OnboardingAnswers;
  favoriteCountries?: string[];
  favorite_countries?: string[];
  isStaff?: boolean;
  is_staff?: boolean;
};

type RawAuthResponse = {
  user?: RawAuthUser;
  data?: {
    user?: RawAuthUser;
    token?: string;
    access?: string;
    access_token?: string;
    refresh?: string;
    refresh_token?: string;
  };
  token?: string;
  access?: string;
  access_token?: string;
  refresh?: string;
  refresh_token?: string;
};

type RawUserPayload = RawAuthUser | RawAuthResponse;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '');
const SHOULD_FALLBACK_TO_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const toMessage = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    const nested = value.map(toMessage).find(Boolean);
    return nested;
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    const preferredKeys = ['detail', 'message', 'error', 'non_field_errors'];

    for (const key of preferredKeys) {
      const nested = toMessage(objectValue[key]);
      if (nested) {
        return nested;
      }
    }

    for (const nestedValue of Object.values(objectValue)) {
      const nested = toMessage(nestedValue);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
};

const toFieldErrors = (value: unknown): Record<string, string[]> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const entries: Array<[string, string[]]> = [];

  for (const [key, fieldValue] of Object.entries(value as Record<string, unknown>)) {
    if (['detail', 'message', 'error'].includes(key)) {
      continue;
    }

    if (Array.isArray(fieldValue)) {
      entries.push([key, fieldValue.map((item) => String(item))]);
      continue;
    }

    if (typeof fieldValue === 'string') {
      entries.push([key, [fieldValue]]);
    }
  }

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

const normalizeUser = (user: RawAuthUser): AuthUser => ({
  id: user.id ?? 0,
  email: user.email ?? '',
  username: user.username ?? '',
  firstName: user.firstName ?? user.first_name,
  lastName: user.lastName ?? user.last_name,
  avatarUrl: user.avatarUrl ?? user.avatar_url,
  bio: user.bio,
  favoriteGenres: user.favoriteGenres ?? user.favorite_genres,
  favoriteTitles: user.favoriteTitles ?? user.favorite_titles,
  onboardingAnswers: user.onboardingAnswers ?? user.onboarding_answers,
  favoriteCountries: user.favoriteCountries ?? user.favorite_countries,
  isStaff: user.isStaff ?? user.is_staff,
});

const normalizeUserPayload = (payload: RawUserPayload): AuthUser => {
  const candidate = (() => {
    if ('id' in payload || 'email' in payload || 'username' in payload) {
      return payload;
    }

    const responsePayload = payload as RawAuthResponse;
    return responsePayload.user ?? responsePayload.data?.user;
  })();

  if (!candidate) {
    throw new Error('User response is missing required fields.');
  }

  return normalizeUser(candidate);
};

const normalizeSession = (payload: RawAuthResponse): AuthSession => {
  const user = payload.user ?? payload.data?.user;
  const token = payload.token ?? payload.access ?? payload.access_token ?? payload.data?.token ?? payload.data?.access ?? payload.data?.access_token;
  const refreshToken = payload.refresh ?? payload.refresh_token ?? payload.data?.refresh ?? payload.data?.refresh_token;

  if (!user || !token) {
    throw new Error('Authentication response is missing required fields.');
  }

  return {
    user: normalizeUser(user),
    token,
    refreshToken,
  };
};

const normalizeRefreshTokens = (payload: RawAuthResponse): RefreshTokenResponse => {
  const token = payload.token ?? payload.access ?? payload.access_token ?? payload.data?.token ?? payload.data?.access ?? payload.data?.access_token;
  const refreshToken = payload.refresh ?? payload.refresh_token ?? payload.data?.refresh ?? payload.data?.refresh_token;

  if (!token) {
    throw new Error('Refresh response is missing an access token.');
  }

  return {
    token,
    refreshToken,
  };
};

const getRequestUrl = (args: string | FetchArgs) => (typeof args === 'string' ? args : args.url);

const isRefreshEligibleRequest = (args: string | FetchArgs) => {
  const url = getRequestUrl(args);
  return !['/auth/login', '/auth/register', '/auth/refresh'].includes(url);
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, AuthErrorResponse> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error &&
    result.error.status === 401 &&
    isRefreshEligibleRequest(args)
  ) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (!refreshToken) {
      api.dispatch(logout());
    } else {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        try {
          const tokens = normalizeRefreshTokens(refreshResult.data as RawAuthResponse);
          api.dispatch(updateTokens(tokens));
          result = await rawBaseQuery(args, api, extraOptions);
        } catch {
          api.dispatch(logout());
        }
      } else {
        api.dispatch(logout());
      }
    }
  }

  if (result.error) {
    const error = result.error as FetchBaseQueryError;
    const data = 'data' in error ? error.data : undefined;
    return {
      error: {
        message: toMessage(data) ?? 'Request failed.',
        fields: toFieldErrors(data),
      },
    };
  }

  return { data: result.data };
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      async queryFn(credentials, api) {
        const result = await rawBaseQuery(
          {
            url: '/auth/login',
            method: 'POST',
            body: credentials,
          },
          api,
          {}
        );

        if (result.data) {
          return { data: normalizeSession(result.data as RawAuthResponse) };
        }

        if (SHOULD_FALLBACK_TO_MOCK) {
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
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Request failed.',
            fields: toFieldErrors(data),
          },
        };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    signup: builder.mutation<SignupResponse, SignupRequest>({
      async queryFn({ passwordConfirm, firstName, lastName, ...payload }, api) {
        const result = await rawBaseQuery(
          {
            url: '/auth/register',
            method: 'POST',
            body: {
              ...payload,
              first_name: firstName,
              last_name: lastName,
              password_confirm: passwordConfirm,
            },
          },
          api,
          {}
        );

        if (result.data) {
          return { data: normalizeSession(result.data as RawAuthResponse) };
        }

        if (SHOULD_FALLBACK_TO_MOCK) {
          try {
            const data = await mockSignup({
              ...payload,
              firstName,
              lastName,
              passwordConfirm,
            });
            return { data };
          } catch (error) {
            return {
              error: {
                message: error instanceof Error ? error.message : 'Signup failed.',
              },
            };
          }
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Request failed.',
            fields: toFieldErrors(data),
          },
        };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    updateMe: builder.mutation<AuthUser, Partial<AuthUser>>({
      async queryFn(payload, api) {
        const result = await baseQuery(
          {
            url: '/users/me',
            method: 'PUT',
            body: {
              username: payload.username,
              first_name: payload.firstName,
              last_name: payload.lastName,
              bio: payload.bio,
              favorite_genres: payload.favoriteGenres,
              favorite_titles: payload.favoriteTitles,
              onboarding_answers: payload.onboardingAnswers,
            },
          },
          api,
          {}
        );

        if (result.data) {
          return { data: normalizeUserPayload(result.data as RawUserPayload) };
        }

        if (SHOULD_FALLBACK_TO_MOCK) {
          try {
            const currentUser = (api.getState() as RootState).auth.user;
            if (!currentUser) {
              throw new Error('사용자 세션이 없습니다.');
            }
            const data = await mockUpdateProfile(currentUser.id, payload);
            return { data };
          } catch (error) {
            return {
              error: {
                message: error instanceof Error ? error.message : 'Profile update failed.',
              },
            };
          }
        }

        return {
          error: result.error ?? { message: 'Request failed.' },
        };
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useUpdateMeMutation } = authApi;
