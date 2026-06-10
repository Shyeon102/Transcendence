export interface OnboardingAnswers {
  allTimeFavorite: string;
  recentFavorite: string;
  friendRecommendation: string;
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  favoriteGenres?: number[];
  favoriteTitles?: string[];
  onboardingAnswers?: OnboardingAnswers;
  onboardingCompleted?: boolean;
  favoriteCountries?: string[];
  isStaff?: boolean;
}

export interface StoredUser extends AuthUser {
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  passwordConfirm: string;
  favoriteGenres?: number[];
  favoriteTitles?: string[];
  onboardingAnswers?: OnboardingAnswers;
}

export interface SignupResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

export interface AuthErrorResponse {
  message: string;
  fields?: Record<string, string[]>;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DashboardReview {
  id: number;
  title: string;
  note: string;
  when: string;
  rating: number;
}

export interface MyPageDashboardData {
  reviews: DashboardReview[];
  watchlist: string[];
  activities: string[];
}

export interface MediaReview {
  id: number;
  userId: number;
  username: string;
  mediaId: number;
  mediaTitle: string;
  rating: number;
  content: string;
  visibility: 'public' | 'followers' | 'private';
  createdAt: string;
  updatedAt: string;
}

export interface MediaReviewRequest {
  rating: number;
  content: string;
  visibility?: 'public' | 'followers' | 'private';
}
