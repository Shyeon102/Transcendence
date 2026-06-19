from django.urls import path
from .views import ( 
    PostDetailView, PostView, TrendingPostView,
    PostCommentView, PostLikeView, CommentLikeView,
    CommentDetailView, PostReportView, CommentReportView
)

urlpatterns = [
    path("posts/", PostView.as_view()),
    path("posts/trending/", TrendingPostView.as_view()),

    path("posts/<int:pk>/", PostDetailView.as_view()),
    path("posts/<int:pk>/comments/", PostCommentView.as_view()),
    path("posts/<int:pk>/like/", PostLikeView.as_view()),

    path("comments/<int:pk>/like/", CommentLikeView.as_view()),
    path("comments/<int:pk>/", CommentDetailView.as_view()),

    path("posts/<int:pk>/report/", PostReportView.as_view()),
    path("comments/<int:pk>/report/", CommentReportView.as_view()),
]
