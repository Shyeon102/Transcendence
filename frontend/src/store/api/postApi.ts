import { apiSlice } from '../slices/apiSlice';
import type {
  CommentListResponse,
  CommentPayload,
  CommunityComment,
  CommunityPost,
  PostListResponse,
  PostPayload,
  PostSort,
  ReportPayload,
} from '../../types/community';

type PostListArgs = {
  search?: string;
  sort?: PostSort;
  cursor?: string;
};

const postsFrom = (response: PostListResponse | CommunityPost[]) =>
  Array.isArray(response) ? { posts: response } : response;
const commentsFrom = (response: CommentListResponse | CommunityComment[]) =>
  Array.isArray(response) ? { comments: response } : response;

export const postApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<PostListResponse, PostListArgs>({
      query: ({ search, sort = 'recent', cursor }) => ({
        url: '/posts',
        params: { search: search || undefined, sort, cursor },
      }),
      transformResponse: postsFrom,
      providesTags: (result) => [
        'Posts',
        ...(result?.posts.map(({ id }) => ({ type: 'Posts' as const, id })) ?? []),
      ],
    }),
    getTrendingPosts: builder.query<PostListResponse, void>({
      query: () => '/posts/trending',
      transformResponse: postsFrom,
      providesTags: ['Posts'],
    }),
    getPost: builder.query<CommunityPost, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Posts', id }],
    }),
    createPost: builder.mutation<CommunityPost, PostPayload>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: ['Posts'],
    }),
    updatePost: builder.mutation<CommunityPost, { id: number; body: PostPayload }>({
      query: ({ id, body }) => ({ url: `/posts/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Posts'],
    }),
    deletePost: builder.mutation<void, number>({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Posts'],
    }),
    getComments: builder.query<CommentListResponse, number>({
      query: (postId) => `/posts/${postId}/comments`,
      transformResponse: commentsFrom,
      providesTags: ['Posts'],
    }),
    createComment: builder.mutation<CommunityComment, { postId: number; body: CommentPayload }>({
      query: ({ postId, body }) => ({ url: `/posts/${postId}/comments`, method: 'POST', body }),
      invalidatesTags: ['Posts'],
    }),
    likePost: builder.mutation<void, { id: number; liked: boolean }>({
      query: ({ id, liked }) => ({ url: `/posts/${id}/like`, method: liked ? 'DELETE' : 'POST' }),
      invalidatesTags: ['Posts'],
    }),
    likeComment: builder.mutation<void, { id: number; liked: boolean }>({
      query: ({ id, liked }) => ({ url: `/comments/${id}/like`, method: liked ? 'DELETE' : 'POST' }),
      invalidatesTags: ['Posts'],
    }),
    reportPost: builder.mutation<void, { id: number; body: ReportPayload }>({
      query: ({ id, body }) => ({ url: `/posts/${id}/report`, method: 'POST', body }),
    }),
    reportComment: builder.mutation<void, { id: number; body: ReportPayload }>({
      query: ({ id, body }) => ({ url: `/comments/${id}/report`, method: 'POST', body }),
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useCreatePostMutation,
  useDeletePostMutation,
  useGetCommentsQuery,
  useGetPostQuery,
  useGetPostsQuery,
  useGetTrendingPostsQuery,
  useLikeCommentMutation,
  useLikePostMutation,
  useReportCommentMutation,
  useReportPostMutation,
  useUpdatePostMutation,
} = postApi;
