from rest_framework.views import APIView
from rest_framework.response import Response
from apps.community.models import (
     Comment, Post, TrendingPost, PostLike,
     CommentLike
)
from apps.community.serializers import (
     PostSerializer, CommentSerializer,
     ReportSerializer
)
from rest_framework import status
from django.shortcuts import get_object_or_404


# GET    /api/posts                      Board list (cursor pagination)
#   Query: ?cursor=xxx&limit=20&sort=recent|trending&search=search_term

# POST   /api/posts                      Create post
# GET    /api/posts/{id}                 Post detail
# PUT    /api/posts/{id}                 Update post
# DELETE /api/posts/{id}                 Delete post

# GET    /api/posts/{id}/comments        Comment list (tree structure)
# POST   /api/posts/{id}/comments        Create comment
# PUT    /api/comments/{id}              Edit comment
# DELETE /api/comments/{id}              Delete comment

# POST   /api/posts/{id}/like            Post Likes
# DELETE /api/posts/{id}/like            Remove post like
# POST   /api/comments/{id}/like         Comment like
# DELETE /api/comments/{id}/like         Remove comment like

# POST   /api/posts/{id}/report          Report post
# POST   /api/comments/{id}/report       Report comment

# GET    /api/posts/trending             Trending posts (3h intervals)


class PostView(APIView):
    def get(self, request):
        queryset = (
            Post.objects
            .filter(is_hidden=False)
            .select_related("user")
            .order_by("-created_at")
        )

        serializer = PostSerializer(queryset, many=True)

        return Response(
            {"posts": serializer.data},
            status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = PostSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)

            return Response(
                {"post": serializer.data},
                status=status.HTTP_201_CREATED
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class PostDetailView(APIView):
    def get(self, request, pk):
        post = get_object_or_404(
            Post.objects.select_related("user"),
            pk=pk,
            is_hidden=False
        )

        serializer = PostSerializer(post)

        return Response(
            {"post": serializer.data},
            status=status.HTTP_200_OK
        )

    def put(self, request, pk):
        post = get_object_or_404(Post, pk=pk, user=request.user)

        serializer = PostSerializer(
            post,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {"post": serializer.data},
                status=status.HTTP_200_OK
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk, user=request.user)

        post.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class TrendingPostView(APIView):
    def get(self, request):
        trending_posts = (
            TrendingPost.objects
            .select_related("post", "post__user")
            .order_by("-score")[:20]
        )

        posts = [t.post for t in trending_posts]

        serializer = PostSerializer(posts, many=True)

        return Response(
            {"posts": serializer.data},
            status=status.HTTP_200_OK
        )


class PostCommentView(APIView):

    def get(self, request, pk):
        post = get_object_or_404(Post, pk=pk)

        comments = (
            post.comments
            .select_related("user")
            .filter(parent_comment=None, is_hidden=False)
            .order_by("created_at")
        )

        serializer = CommentSerializer(comments, many=True)

        return Response(
            {"comments": serializer.data},
            status=status.HTTP_200_OK
        )

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)

        serializer = CommentSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(
                post=post,
                user=request.user
            )

            return Response(
                {"comment": serializer.data},
                status=status.HTTP_201_CREATED
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class PostLikeView(APIView):

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)

        like, created = PostLike.objects.get_or_create(
            user=request.user,
            post=post
        )

        if created:
            post.like_count += 1
            post.save(update_fields=["like_count"])

        return Response(status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk)

        deleted, _ = PostLike.objects.filter(
            user=request.user,
            post=post
        ).delete()

        if deleted:
            post.like_count = max(0, post.like_count - 1)
            post.save(update_fields=["like_count"])

        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentLikeView(APIView):

    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)

        like, created = CommentLike.objects.get_or_create(
            user=request.user,
            comment=comment
        )

        if created:
            comment.like_count += 1
            comment.save(update_fields=["like_count"])

        return Response(status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)

        deleted, _ = CommentLike.objects.filter(
            user=request.user,
            comment=comment
        ).delete()

        if deleted:
            comment.like_count = max(0, comment.like_count - 1)
            comment.save(update_fields=["like_count"])

        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentDetailView(APIView):

    def put(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk, user=request.user)

        serializer = CommentSerializer(
            comment,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {"comment": serializer.data},
                status=status.HTTP_200_OK
            )

        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk, user=request.user)

        comment.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class PostReportView(APIView):
    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        serializer = ReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        report = serializer.save(
            user=request.user,
            post=post
        )

        post.report_count += 1
        post.save(update_fields=["report_count"])

        return Response({
            "status": report.status,
            "report_id": report.id
        }, status=status.HTTP_201_CREATED)


class CommentReportView(APIView):
    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        serializer = ReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        report = serializer.save(
            user=request.user,
            comment=comment
        )

        comment.report_count += 1
        comment.save(update_fields=["report_count"])

        return Response({
            "status": report.status,
            "report_id": report.id
        }, status=status.HTTP_201_CREATED)
