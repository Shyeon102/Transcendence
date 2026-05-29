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
  favoriteCountries?: string[];
  isStaff?: boolean;
}

export interface StoredUser extends AuthUser {
  password: string;
}

export interface LoginRequest {
  email: string;
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
  firstName: string;
  lastName: string;
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
