import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { mockLogin, mockUpdateProfile } from '../../features/auth/mockAuth';
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
  onboardingCompleted?: boolean;
  onboarding_completed?: boolean;
  favoriteCountries?: string[];
  favorite_countries?: string[];
  isStaff?: boolean;
  is_staff?: boolean;
};

type RawAuthResponse = {
  user?: RawAuthUser;
  users?: RawAuthUser;
  data?: {
    user?: RawAuthUser;
    users?: RawAuthUser;
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
type RawTokenResponse = {
  access?: string;
  refresh?: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '');
const SHOULD_FALLBACK_TO_MOCK = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';
const isDemoLogin = (credentials: LoginRequest) =>
  credentials.username === 'demo' || credentials.username === 'demo@demo.demo';

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
  onboardingCompleted: user.onboardingCompleted ?? user.onboarding_completed,
  favoriteCountries: user.favoriteCountries ?? user.favorite_countries,
  isStaff: user.isStaff ?? user.is_staff,
});

const normalizeUserPayload = (payload: RawUserPayload): AuthUser => {
  const candidate = (() => {
    if ('id' in payload || 'email' in payload || 'username' in payload) {
      return payload;
    }

    const responsePayload = payload as RawAuthResponse;
    return responsePayload.user ?? responsePayload.users ?? responsePayload.data?.user ?? responsePayload.data?.users;
  })();

  if (!candidate) {
    throw new Error('User response is missing required fields.');
  }

  return normalizeUser(candidate);
};

const normalizeSession = (payload: RawAuthResponse): AuthSession => {
  const user = payload.user ?? payload.users ?? payload.data?.user ?? payload.data?.users;
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
  return !['/auth/token/', '/auth/register/', '/auth/token/refresh/'].includes(url);
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
            url: '/auth/token/refresh/',
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
        const tokenResult = await rawBaseQuery(
          {
            url: '/auth/token/',
            method: 'POST',
            body: credentials,
          },
          api,
          {}
        );

        if (tokenResult.data) {
          const tokenPayload = tokenResult.data as RawTokenResponse;
          if (!tokenPayload.access) {
            return {
              error: {
                message: 'Login response is missing an access token.',
              },
            };
          }

          const userResult = await rawBaseQuery(
            {
              url: '/users/',
              headers: {
                Authorization: `Bearer ${tokenPayload.access}`,
              },
            },
            api,
            {}
          );

          if (userResult.data) {
            return {
              data: normalizeSession({
                ...(userResult.data as RawAuthResponse),
                access: tokenPayload.access,
                refresh: tokenPayload.refresh,
              }),
            };
          }
        }

        if (SHOULD_FALLBACK_TO_MOCK && isDemoLogin(credentials)) {
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

        const error = (tokenResult.error ?? {}) as FetchBaseQueryError;
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
      async queryFn({ passwordConfirm, firstName: _firstName, lastName: _lastName, ...payload }, api) {
        void _firstName;
        void _lastName;
        const result = await rawBaseQuery(
          {
            url: '/auth/register/',
            method: 'POST',
            body: {
              ...payload,
              passwordConfirm,
            },
          },
          api,
          {}
        );

        if (result.data) {
          return { data: normalizeSession(result.data as RawAuthResponse) };
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
    }),
    updateMe: builder.mutation<AuthUser, Partial<AuthUser>>({
      async queryFn(payload, api) {
        const isOnboardingUpdate = Boolean(payload.favoriteGenres);
        const result = await rawBaseQuery(
          {
            url: isOnboardingUpdate ? '/users/onboarding/' : '/users/profile/update/',
            method: 'PATCH',
            body: {
              username: payload.username,
              email: payload.email,
              avatar_url: payload.avatarUrl,
              bio: payload.bio,
              favorite_genres: payload.favoriteGenres,
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
            if (!currentUser || currentUser.username !== 'demo') {
              throw new Error('Profile update failed.');
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

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Request failed.',
            fields: toFieldErrors(data),
          },
        };
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useUpdateMeMutation } = authApi;
