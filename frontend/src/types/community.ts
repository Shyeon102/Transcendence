export type PostSort = 'recent' | 'trending';
export type ReportType = 'spam' | 'abuse' | 'nsfw' | 'copyright';

export interface CommunityPost {
  id: number;
  user: number;
  username?: string;
  title: string;
  content: string;
  media_files: string[];
  like_count: number;
  report_count: number;
  view_count: number;
  is_hidden: boolean;
  is_liked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: number;
  post: number;
  user: number;
  username?: string;
  parent_comment: number | null;
  content: string;
  media_files: string[];
  like_count: number;
  report_count: number;
  is_hidden: boolean;
  is_liked?: boolean;
  created_at: string;
}

export interface PostListResponse {
  posts: CommunityPost[];
  next?: string | null;
}

export interface CommentListResponse {
  comments: CommunityComment[];
}

export interface PostPayload {
  title: string;
  content: string;
}

export interface CommentPayload {
  content: string;
  parent_comment?: number;
}

export interface ReportPayload {
  report_type: ReportType;
  reason: string;
}
