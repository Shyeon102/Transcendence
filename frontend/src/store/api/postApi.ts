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

type PostResponse = CommunityPost | { post: CommunityPost };

const postsFrom = (response: PostListResponse | CommunityPost[]) =>
  Array.isArray(response) ? { posts: response } : response;
const commentsFrom = (response: CommentListResponse | CommunityComment[]) =>
  Array.isArray(response) ? { comments: response } : response;
const postFrom = (response: PostResponse) => ('post' in response ? response.post : response);

export const postApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<PostListResponse, PostListArgs>({
      query: ({ search, sort = 'recent', cursor }) => ({
        url: '/community/posts/',
        params: { search: search || undefined, sort, cursor },
      }),
      transformResponse: postsFrom,
      providesTags: (result) => [
        'Posts',
        ...(result?.posts.map(({ id }) => ({ type: 'Posts' as const, id })) ?? []),
      ],
    }),
    getTrendingPosts: builder.query<PostListResponse, void>({
      query: () => '/community/posts/trending/',
      transformResponse: postsFrom,
      providesTags: ['Posts'],
    }),
    getPost: builder.query<CommunityPost, number>({
      query: (id) => `/community/posts/${id}/`,
      transformResponse: postFrom,
      providesTags: (_result, _error, id) => [{ type: 'Posts', id }],
    }),
    createPost: builder.mutation<CommunityPost, PostPayload>({
      query: (body) => ({ url: '/community/posts/', method: 'POST', body }),
      transformResponse: postFrom,
      invalidatesTags: ['Posts'],
    }),
    updatePost: builder.mutation<CommunityPost, { id: number; body: PostPayload }>({
      query: ({ id, body }) => ({ url: `/community/posts/${id}/`, method: 'PUT', body }),
      transformResponse: postFrom,
      invalidatesTags: ['Posts'],
    }),
    deletePost: builder.mutation<void, number>({
      query: (id) => ({ url: `/community/posts/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Posts'],
    }),
    getComments: builder.query<CommentListResponse, number>({
      query: (postId) => `/community/posts/${postId}/comments/`,
      transformResponse: commentsFrom,
      providesTags: ['Posts'],
    }),
    createComment: builder.mutation<CommunityComment, { postId: number; body: CommentPayload }>({
      query: ({ postId, body }) => ({ url: `/community/posts/${postId}/comments/`, method: 'POST', body }),
      invalidatesTags: ['Posts'],
    }),
    likePost: builder.mutation<void, { id: number; liked: boolean }>({
      query: ({ id, liked }) => ({ url: `/community/posts/${id}/like/`, method: liked ? 'DELETE' : 'POST' }),
      invalidatesTags: ['Posts'],
    }),
    likeComment: builder.mutation<void, { id: number; liked: boolean }>({
      query: ({ id, liked }) => ({ url: `/community/comments/${id}/like/`, method: liked ? 'DELETE' : 'POST' }),
      invalidatesTags: ['Posts'],
    }),
    reportPost: builder.mutation<void, { id: number; body: ReportPayload }>({
      query: ({ id, body }) => ({ url: `/community/posts/${id}/report/`, method: 'POST', body }),
    }),
    reportComment: builder.mutation<void, { id: number; body: ReportPayload }>({
      query: ({ id, body }) => ({ url: `/community/comments/${id}/report/`, method: 'POST', body }),
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
