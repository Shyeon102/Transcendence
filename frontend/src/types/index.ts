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
  favoriteCountries?: string[];
  isStaff?: boolean;
  dateJoined?: string;
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
  visibility?: 'public' | 'followers' | 'private';
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
export interface MediaInteraction {
  id: number;
  action: 'like' | 'dislike' | 'watched' | 'watchlist';
  createdAt: string;
}

export interface MediaReviewRequest {
  rating: number;
  content: string;
  visibility?: 'public' | 'followers' | 'private';
}

export type AdminReportStatus = 'pending' | 'approved' | 'rejected';
export type AdminReportType = 'spam' | 'abuse' | 'nsfw' | 'copyright';
export type AdminReportTargetType = 'post' | 'comment';

export interface AdminReport {
  id: number;
  type: AdminReportType;
  reason: string;
  status: AdminReportStatus;
  targetType: AdminReportTargetType;
  targetId: number;
  targetTitle?: string;
  targetPreview?: string;
  reporterId: number;
  reporterUsername: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  isActive: boolean;
  isStaff: boolean;
  dateJoined: string;
}
