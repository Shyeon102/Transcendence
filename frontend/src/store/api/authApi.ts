import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { logout, setCredentials, updateProfile, updateTokens } from '../../features/auth/authSlice';
import type { RootState } from '../index';
import type {
  AuthErrorResponse,
  AuthSession,
  AdminReport,
  AdminReportStatus,
  AdminReportTargetType,
  AdminReportType,
  AuthUser,
  DashboardReview,
  LoginRequest,
  LoginResponse,
  MediaReview,
  MediaReviewRequest,
  MediaInteraction,
  MyPageDashboardData,
  PasswordChangeRequest,
  PublicUserProfile,
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
  onboarding_completed?: boolean;
  favoriteCountries?: string[];
  favorite_countries?: string[];
  isStaff?: boolean;
  is_staff?: boolean;
  followersCount?: number;
  followers_count?: number;
  followingCount?: number;
  following_count?: number;
  dateJoined?: string;
  date_joined?: string;
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

type GoogleLoginRequest = {
  id_token: string;
};

type RawActivityReview = {
  id: number;
  media?: number;
  title?: string;
  note?: string;
  when?: string;
  media_title?: string;
  content?: string;
  created_at?: string;
  rating: number;
  visibility?: 'public' | 'followers' | 'private';
};

type RawDashboardInteraction = {
  media_id?: number;
  media_title?: string;
};

type RawDashboard = {
  interactions?: {
    like?: RawDashboardInteraction[];
    dislike?: RawDashboardInteraction[];
    watchlist?: RawDashboardInteraction[];
    watched?: RawDashboardInteraction[];
  };
  reviews?: RawActivityReview[];
  // demo/legacy 응답 호환
  watchlist?: string[];
  activities?: string[];
  activity?: string[];
  recent_activity?: string[];
};

type RawReview = {
  id: number;
  user?: RawAuthUser;
  user_id?: number;
  username?: string;
  media_id?: number;
  media_title?: string;
  rating: number;
  comment?: string;
  content?: string;
  visibility?: 'public' | 'followers' | 'private';
  created_at?: string;
  updated_at?: string;
};

type RawReviewPayload = RawReview | {
  review?: RawReview;
  reviews?: RawReview[];
};

type RawPublicUserProfile = RawAuthUser & {
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
  reviews?: RawReview[];
};

type RawAdminReportTarget = {
  id?: number;
  title?: string;
  content?: string;
  body?: string;
};

type RawAdminReport = {
  id: number;
  report_type?: AdminReportType;
  type?: AdminReportType;
  reason?: string;
  status?: AdminReportStatus;
  post?: number | RawAdminReportTarget | null;
  comment?: number | RawAdminReportTarget | null;
  post_id?: number;
  comment_id?: number;
  target_type?: AdminReportTargetType;
  target_id?: number;
  target_title?: string;
  target_preview?: string;
  user?: number | RawAuthUser;
  user_id?: number;
  reporter?: number | RawAuthUser;
  reporter_id?: number;
  username?: string;
  reporter_username?: string;
  processed_by?: RawAuthUser | string | null;
  processed_at?: string | null;
  created_at?: string;
};

type RawAdminReportsPayload = RawAdminReport[] | {
  reports?: RawAdminReport[];
  results?: RawAdminReport[];
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://localhost/api').replace(/\/+$/, '');
const GOOGLE_AUTH_ENDPOINT = import.meta.env.VITE_GOOGLE_AUTH_ENDPOINT ?? '/auth/login/google/';

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
  favoriteCountries: user.favoriteCountries ?? user.favorite_countries,
  isStaff: user.isStaff ?? user.is_staff,
  followersCount: user.followersCount ?? user.followers_count,
  followingCount: user.followingCount ?? user.following_count,
  dateJoined: user.dateJoined ?? user.date_joined,
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

const normalizeDashboardReview = (review: RawActivityReview): DashboardReview => ({
  id: review.id,
  mediaId: review.media ?? 0,
  title: review.title ?? review.media_title ?? `Review #${review.id}`,
  note: review.note ?? review.content ?? '',
  text: review.note ?? review.content ?? '',
  when: review.when ?? review.created_at ?? '',
  date: review.when ?? review.created_at ?? '',
  rating: review.rating,
  visibility: review.visibility,
});

const normalizeDashboard = (payload: RawDashboard): MyPageDashboardData => ({
  reviews: (payload.reviews ?? []).map(normalizeDashboardReview),
  watchlist:
    payload.watchlist ??
    payload.interactions?.watchlist?.map((item) => item.media_title ?? `Media #${item.media_id ?? '-'}`) ??
    [],
  activities: payload.activities ?? payload.activity ?? payload.recent_activity ?? [],
});

const normalizeReview = (review: RawReview): MediaReview => ({
  id: review.id,
  userId: review.user_id ?? review.user?.id ?? 0,
  username: review.username ?? review.user?.username ?? '',
  mediaId: review.media_id ?? 0,
  mediaTitle: review.media_title ?? '',
  rating: review.rating,
  content: review.content ?? review.comment ?? '',
  visibility: review.visibility ?? 'public',
  createdAt: review.created_at ?? '',
  updatedAt: review.updated_at ?? '',
});

const normalizeReviewPayload = (payload: RawReviewPayload): MediaReview => {
  if ('id' in payload) {
    return normalizeReview(payload);
  }
  if (payload.review) {
    return normalizeReview(payload.review);
  }
  throw new Error('Review response is missing required fields.');
};

const normalizeReviewList = (payload: RawReviewPayload): MediaReview[] => {
  if ('reviews' in payload && Array.isArray(payload.reviews)) {
    return payload.reviews.map(normalizeReview);
  }
  return [];
};

const normalizePublicUserProfile = (profile: RawPublicUserProfile): PublicUserProfile => ({
  id: profile.id ?? 0,
  username: profile.username ?? '',
  avatarUrl: profile.avatarUrl ?? profile.avatar_url,
  bio: profile.bio,
  followersCount: profile.followers_count ?? 0,
  followingCount: profile.following_count ?? 0,
  isFollowing: profile.is_following ?? false,
  reviews: (profile.reviews ?? []).map(normalizeReview),
});

const toReviewRequestBody = (review: MediaReviewRequest) => ({
  rating: review.rating,
  content: review.content,
  visibility: review.visibility,
});

const getTargetData = (target: number | RawAdminReportTarget | null | undefined) => {
  if (!target || typeof target === 'number') {
    return {
      id: typeof target === 'number' ? target : 0,
      title: undefined,
      preview: undefined,
    };
  }

  return {
    id: target.id ?? 0,
    title: target.title,
    preview: target.content ?? target.body,
  };
};

const normalizeAdminReport = (report: RawAdminReport): AdminReport => {
  const targetType = report.target_type ?? (report.post || report.post_id ? 'post' : 'comment');
  const target = targetType === 'post'
    ? getTargetData(report.post ?? report.post_id)
    : getTargetData(report.comment ?? report.comment_id);
  const reporter = typeof report.reporter === 'object'
    ? report.reporter
    : typeof report.user === 'object'
      ? report.user
      : undefined;

  return {
    id: report.id,
    type: report.report_type ?? report.type ?? 'spam',
    reason: report.reason ?? '',
    status: report.status ?? 'pending',
    targetType,
    targetId: report.target_id ?? target.id,
    targetTitle: report.target_title ?? target.title,
    targetPreview: report.target_preview ?? target.preview,
    reporterId: report.reporter_id ?? report.user_id ?? reporter?.id ?? 0,
    reporterUsername: report.reporter_username ?? report.username ?? reporter?.username ?? '',
    processedBy: typeof report.processed_by === 'string' ? report.processed_by : report.processed_by?.username,
    processedAt: report.processed_at ?? undefined,
    createdAt: report.created_at ?? '',
  };
};

const normalizeAdminReports = (payload: RawAdminReportsPayload): AdminReport[] => {
  const reports = Array.isArray(payload) ? payload : payload.results ?? payload.reports ?? [];
  return reports.map(normalizeAdminReport);
};

const getRequestUrl = (args: string | FetchArgs) => (typeof args === 'string' ? args : args.url);

const isRefreshEligibleRequest = (args: string | FetchArgs) => {
  const url = getRequestUrl(args);
  return !['/auth/token/', '/auth/register/', '/auth/token/refresh/', '/auth/logout/'].includes(url);
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    headers.set('Accept-Language', state.ui.language);
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
        } catch {
          api.dispatch(logout());
        }
      } else {
        api.dispatch(logout());
      }

      // refresh 후 재시도
      result = await rawBaseQuery(args, api, extraOptions);
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
  tagTypes: ['AdminReports', 'AdminUsers', 'MediaReviews', 'MediaInteractions', 'Me', 'UserProfile'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      async queryFn(credentials, api) {
        const tokenResult = await rawBaseQuery(
          {
            url: '/auth/login/',
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
              url: '/users/profile/',
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

        const error = (tokenResult.error ?? {}) as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Request failed.',
            fields: toFieldErrors(data),
            status: typeof error.status === 'number' ? error.status : undefined,
          },
        };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    googleLogin: builder.mutation<LoginResponse, GoogleLoginRequest>({
      async queryFn(payload, api) {
        const result = await rawBaseQuery(
          {
            url: GOOGLE_AUTH_ENDPOINT,
            method: 'POST',
            body: { id_token: payload.id_token },
          },
          api,
          {}
        );

        if (result.data) {
          const rawData = result.data as RawAuthResponse;
          const accessToken = rawData.access ?? rawData.access_token ?? rawData.token;

          const userResult = await rawBaseQuery(
            {
              url: '/users/profile/',
              headers: { Authorization: `Bearer ${accessToken}` },
            },
            api,
            {}
          );

          if (userResult.data) {
            return {
              data: normalizeSession({
                ...(userResult.data as RawAuthResponse),
                access: accessToken,
                refresh: rawData.refresh ?? rawData.refresh_token,
              }),
            };
          }
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Google authentication failed.',
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
      const result = await baseQuery(
        {
          url: '/auth/register/',
          method: 'POST',
          body: {
            ...payload,
            first_name: firstName,
            last_name: lastName,
            passwordConfirm,
          },
        },
        api,
        {}
      );

      if (result.error) {
        return { error: result.error };
      }

      const data = result.data as RawAuthResponse;

      // 200 with error fields means validation failed
      if (!data?.user || !data?.access) {
        return {
          error: {
            message: toMessage(data) ?? 'Request failed.',
            fields: toFieldErrors(data),
          },
        };
      }

      return { data: normalizeSession(data) };
    },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch{
          // mutation errors are handled by the caller
        } 
      },
    }),
    logout: builder.mutation<{ success: boolean }, string | null | undefined>({
      query: (refreshToken) => ({
        url: '/auth/logout/',
        method: 'POST',
        body: { refresh: refreshToken },
      }),
    }),
    getMe: builder.query<AuthUser, void>({
      async queryFn(_arg, api) {
        const result = await rawBaseQuery('/users/profile/', api, {});

        if (result.data) {
          return { data: normalizeUserPayload(result.data as RawUserPayload) };
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Failed to load user.',
            fields: toFieldErrors(data),
          },
        };
      },
      providesTags: ['Me'],
    }),
    updateMe: builder.mutation<AuthUser, Partial<AuthUser>>({
      async queryFn(payload, api) {
        const result = await rawBaseQuery(
          {
            url: '/users/profile/',
            method: 'PATCH',
            body: {
              username: payload.username,
              email: payload.email,
              first_name: payload.firstName,
              last_name: payload.lastName,
              avatar_url: payload.avatarUrl,
              bio: payload.bio,
            },
          },
          api,
          {}
        );

        if (result.data) {
          const data = normalizeUserPayload(result.data as RawUserPayload);
          api.dispatch(updateProfile(data));
          return { data };
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
      invalidatesTags: ['Me'],
    }),
    updateAvatar: builder.mutation<AuthUser, string>({
      async queryFn(avatarUrl, api) {
        const result = await rawBaseQuery(
          {
            url: '/users/profile/avatar/',
            method: 'PATCH',
            body: { avatar_url: avatarUrl },
          },
          api,
          {}
        );

        if (result.data) {
          return { data: normalizeUserPayload(result.data as RawUserPayload) };
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Avatar update failed.',
            fields: toFieldErrors(data),
          },
        };
      },
    }),
    deleteAccount: builder.mutation<void, void>({
      query: () => ({
        url: '/users/profile/',
        method: 'DELETE',
      }),
    }),
    changePassword: builder.mutation<{ success: boolean }, PasswordChangeRequest>({
      query: ({ currentPassword, newPassword }) => ({
        url: '/auth/changePassword/',
        method: 'POST',
        body: {
          old_password: currentPassword,
          new_password: newPassword,
        },
      }),
    }),
    getMyPageDashboard: builder.query<MyPageDashboardData, void>({
      async queryFn(_arg, api) {
        const result = await rawBaseQuery('/users/me/activity/', api, {});

        if (result.data) {
          return { data: normalizeDashboard(result.data as RawDashboard) };
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Dashboard request failed.',
            fields: toFieldErrors(data),
          },
        };
      },
    }),
    getUserActivity: builder.query<MyPageDashboardData, number>({
      async queryFn(userId, api) {
        const result = await rawBaseQuery(`/users/${userId}/activity/`, api, {});

        if (result.data) {
          return { data: normalizeDashboard(result.data as RawDashboard) };
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'User activity request failed.',
            fields: toFieldErrors(data),
          },
        };
      },
    }),
    getPublicProfile: builder.query<PublicUserProfile, number>({
      async queryFn(userId, api) {
        const result = await rawBaseQuery(`/users/profile/${userId}/`, api, {});

        if (result.data) {
          return { data: normalizePublicUserProfile(result.data as RawPublicUserProfile) };
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Profile request failed.',
            fields: toFieldErrors(data),
          },
        };
      },
      providesTags: (_result, _error, userId) => [{ type: 'UserProfile', id: userId }],
    }),
    followUser: builder.mutation<void, number>({
      async queryFn(userId, api) {
        const result = await rawBaseQuery(
          { url: `/users/${userId}/follow/`, method: 'POST' },
          api,
          {}
        );

        if (result.error) {
          const error = result.error as FetchBaseQueryError;
          const data = 'data' in error ? error.data : undefined;
          return {
            error: {
              message: toMessage(data) ?? 'Follow request failed.',
              fields: toFieldErrors(data),
            },
          };
        }

        return { data: undefined };
      },
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          authApi.util.updateQueryData('getPublicProfile', userId, (draft) => {
            if (!draft.isFollowing) {
              draft.isFollowing = true;
              draft.followersCount += 1;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, _error, userId) => [{ type: 'UserProfile', id: userId }],
    }),
    unfollowUser: builder.mutation<void, number>({
      async queryFn(userId, api) {
        const result = await rawBaseQuery(
          { url: `/users/${userId}/follow/`, method: 'DELETE' },
          api,
          {}
        );

        if (result.error) {
          const error = result.error as FetchBaseQueryError;
          const data = 'data' in error ? error.data : undefined;
          return {
            error: {
              message: toMessage(data) ?? 'Unfollow request failed.',
              fields: toFieldErrors(data),
            },
          };
        }

        return { data: undefined };
      },
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          authApi.util.updateQueryData('getPublicProfile', userId, (draft) => {
            if (draft.isFollowing) {
              draft.isFollowing = false;
              draft.followersCount = Math.max(0, draft.followersCount - 1);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, _error, userId) => [{ type: 'UserProfile', id: userId }],
    }),
    getMediaReviews: builder.query<MediaReview[], number>({
      async queryFn(mediaId, api) {
        const result = await rawBaseQuery(`/media/${mediaId}/reviews/`, api, {});

        if (result.data) {
          return { data: normalizeReviewList(result.data as RawReviewPayload) };
        }

        const error = result.error as FetchBaseQueryError;
        if ('status' in error && error.status === 500) {
          return { data: [] };
        }
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Review request failed.',
            fields: toFieldErrors(data),
          },
        };
      },
      providesTags: (_result, _error, mediaId) => [{ type: 'MediaReviews', id: mediaId }],
    }),
    createMediaReview: builder.mutation<MediaReview, { mediaId: number; review: MediaReviewRequest }>({
      async queryFn({ mediaId, review }, api) {
        const result = await rawBaseQuery(
          {
            url: `/media/${mediaId}/reviews/`,
            method: 'POST',
            body: toReviewRequestBody(review),
          },
          api,
          {}
        );

        if (result.data) {
          return { data: normalizeReviewPayload(result.data as RawReviewPayload) };
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Review save failed.',
            fields: toFieldErrors(data),
          },
        };
      },
      invalidatesTags: (_result, _error, { mediaId }) => [{ type: 'MediaReviews', id: mediaId }],
    }),
    updateMediaReview: builder.mutation<MediaReview, { mediaId: number; reviewId: number; review: MediaReviewRequest }>({
      async queryFn({ mediaId, reviewId, review }, api) {
        const result = await rawBaseQuery(
          {
            url: `/media/${mediaId}/reviews/${reviewId}/`,
            method: 'PATCH',
            body: toReviewRequestBody(review),
          },
          api,
          {}
        );

        if (result.data) {
          return { data: normalizeReviewPayload(result.data as RawReviewPayload) };
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Review update failed.',
            fields: toFieldErrors(data),
          },
        };
      },
      invalidatesTags: (_result, _error, { mediaId }) => [{ type: 'MediaReviews', id: mediaId }],
    }),
    deleteMediaReview: builder.mutation<void, { mediaId: number; reviewId: number }>({
      query: ({ mediaId, reviewId }) => ({
        url: `/media/${mediaId}/reviews/${reviewId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { mediaId }) => [{ type: 'MediaReviews', id: mediaId }],
    }),
    getMediaInteractions: builder.query<MediaInteraction[], number>({
      async queryFn(mediaId, api) {
        const result = await rawBaseQuery(`/media/${mediaId}/interactions/`, api, {});
        if (result.data) {
          const data = result.data as { interactions: MediaInteraction[] };
          return { data: data.interactions ?? [] };
        }
        return { data: [] };
      },
      providesTags: (_result, _error, mediaId) => [{ type: 'MediaInteractions', id: mediaId }],
    }),

    toggleMediaInteraction: builder.mutation<void, { mediaId: number; action: 'like' | 'dislike' | 'watched' | 'watchlist'; active: boolean }>({
      async queryFn({ mediaId, action, active }, api) {
        const result = await rawBaseQuery(
          active
            ? { url: `/media/${mediaId}/interactions/`, method: 'POST', body: { action } }
            : { url: `/media/${mediaId}/interactions/${action}/`, method: 'DELETE' },
          api,
          {}
        );
        if (result.error) {
          const error = result.error as FetchBaseQueryError;
          const data = 'data' in error ? error.data : undefined;
          return { error: { message: toMessage(data) ?? 'Interaction failed.', fields: toFieldErrors(data) } };
        }
        return { data: undefined };
      },
    }),
    getAdminReports: builder.query<AdminReport[], AdminReportStatus | void>({
      async queryFn(status, api) {
        const query = status ? `?status=${status}` : '';
        const result = await rawBaseQuery(`/community/reports/${query}`, api, {});

        if (result.data) {
          return { data: normalizeAdminReports(result.data as RawAdminReportsPayload) };
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Admin reports request failed.',
            fields: toFieldErrors(data),
          },
        };
      },
      providesTags: ['AdminReports'],
    }),
    processAdminReport: builder.mutation<AdminReport, { reportId: number; status: Exclude<AdminReportStatus, 'pending'> }>({
      async queryFn({ reportId, status }, api) {
        const result = await rawBaseQuery(
          {
            url: `/community/reports/${reportId}/`,
            method: 'PATCH',
            body: { action: status === 'approved' ? 'approve' : 'reject' },
          },
          api,
          {}
        );

        if (result.data) {
          return { data: normalizeAdminReport(result.data as RawAdminReport) };
        }

        const error = result.error as FetchBaseQueryError;
        const data = 'data' in error ? error.data : undefined;
        return {
          error: {
            message: toMessage(data) ?? 'Report update failed.',
            fields: toFieldErrors(data),
          },
        };
      },
      invalidatesTags: ['AdminReports'],
    }),
    banAdminUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/users/${userId}/ban/`,
        method: 'PUT',
      }),
      invalidatesTags: ['AdminUsers'],
    }),
  }),
});

export const {
  useBanAdminUserMutation,
  useChangePasswordMutation,
  useCreateMediaReviewMutation,
  useDeleteAccountMutation,
  useDeleteMediaReviewMutation,
  useGetAdminReportsQuery,
  useGetMeQuery,
  useGetMediaReviewsQuery,
  useGetMyPageDashboardQuery,
  useGetPublicProfileQuery,
  useGetUserActivityQuery,
  useGoogleLoginMutation,
  useFollowUserMutation,
  useLoginMutation,
  useLogoutMutation,
  useProcessAdminReportMutation,
  useSignupMutation,
  useUnfollowUserMutation,
  useUpdateAvatarMutation,
  useUpdateMeMutation,
  useUpdateMediaReviewMutation,
  useGetMediaInteractionsQuery,
  useToggleMediaInteractionMutation,
} = authApi;
