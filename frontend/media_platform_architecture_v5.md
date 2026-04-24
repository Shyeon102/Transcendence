# 미디어 플랫폼 아키텍처 설계서 v5

**프로젝트명:** 미디어 추천 & 커뮤니티 플랫폼  
**작성일:** 2024년  
**팀:** AI(1명), Frontend(2명), Backend(1명), Data/DevOps(1명)  
**개발 기간:** 9주

---

## 📋 목차

1. [요구사항 분석](#1-요구사항-분석)
2. [시스템 분해](#2-시스템-분해)
3. [기술 스택 선택](#3-기술-스택-선택)
4. [데이터베이스 설계](#4-데이터베이스-설계)
5. [API 엔드포인트 설계](#5-api-엔드포인트-설계)
6. [데이터 흐름 설계](#6-데이터-흐름-설계)
7. [성능 최적화 전략](#7-성능-최적화-전략)
8. [보안 설계](#8-보안-설계)
9. [개발 로드맵 (9주)](#9-개발-로드맵-9주)

---

## 1. 요구사항 분석

### 1-1) 기능 요구사항 상세화

#### 자유게시판
- **글 작성:** 이미지, 텍스트, GIF, 영상(용량 작은 것)
- **댓글/대댓글:** 이미지, 텍스트, GIF 지원
- **게시글 기능:** 추천/신고
- **댓글 기능:** 좋아요/신고
- **핫 게시글:** 3시간 간격으로 업데이트
- **검색:** 제목/내용 기반 게시글 검색, 필터 및 정렬

#### 팔로우 기능
- **팔로우의 의미:** "이 사람 취향 나랑 맞는 것 같아"
- **추천에 적용:** "당신이 팔로우하는 OOO이 좋아한 영화에요"
- **활동 상태:** 실시간 토론방 기준으로 온라인 여부 확인

#### 실시간 토론방
- **생성:** 모든 사용자 가능
- **제한:** 전체 시스템 최대 10개, 각 방당 4명
- **대화 저장:** ChatMessage 테이블에 row 단위 저장, 종료 후 JSON export 가능

#### 미디어 추천
- **대상:** 로그인한 사용자
- **추천 방식:** 
  - Phase 1 (콜드 스타트): 취향 선택 기반 장르 필터링
  - Phase 2 (개인화): 협업 필터링 & 컨텐츠 기반 결합 (유사 유저 기반 추천)
  - 팔로우한 유저의 취향 반영
- **초기 로드:** 10~15개 화면 표시, 30개 기본 로딩
- **갱신:** 상호작용 시 Celery 비동기로 추천 재계산
- **필터:** 미디어 타입 / 장르 / 국가 (확장 가능)
- **인터랙션:** 좋아요 / 별로예요 / 찜

#### AI 채팅 추천 (RAG)
- **대상:** 로그인한 사용자
- **방식:** 자연어 질문 → 벡터 검색(pgvector) → LLM 응답 생성
- **예시:** "액션 좋아하는데 로맨스도 섞인 영화 추천해줘"
- **데이터:** Media 테이블의 제목, 장르, 설명, 리뷰를 벡터 임베딩
- **독립성:** 기존 협업 필터링 추천과 같은 인터페이스로 제공 및 답변 제공

#### 내 공간 (후기)
- **프로필:** 프사 설정, 정보 수정
- **관계:** 팔로우/팔로잉 (팔로우 기능과 연결)
- **후기:** 작성/수정/삭제, 공개범위 설정

#### 관리자 기능
- **신고 처리:** 신고 목록 조회, 처리(승인/반려), 콘텐츠 숨김
- **사용자 관리:** 정지/차단

### 1-2) 우선순위 및 실시간 수준

| 기능 | Priority | 실시간 수준 | 기술 |
|------|----------|-----------|------|
| 회원가입/로그인 | 1 | 비실시간 | REST + JWT |
| 미디어 추천 | 1 | 반실시간 | REST + Celery 비동기 갱신 |
| 내 공간(후기) | 1 | 비실시간 | REST |
| 게시판 글 CRUD | 2 | 비실시간 | REST |
| 게시판 댓글 | 2 | 준실시간 | REST + 폴링(3초) |
| 좋아요/신고 | 2 | 준실시간 | REST + 낙관적 업데이트 |
| 팔로우 | 2 | 비실시간 | REST |
| 실시간 토론방 | 2 | 실시간 | WebSocket |
| 핫 게시글 | 2 | 반실시간 | REST + Redis 캐시(3시간) |
| 활동 상태 | 3 | 실시간 | WebSocket |
| AI 채팅 추천 (RAG) | 2 | 비실시간 | REST + pgvector + LLM |
| 게시글 검색 | 3 | 비실시간 | REST |
| 관리자 기능 | 3 | 비실시간 | REST |

---

## 2. 시스템 분해

### 2-1) 도메인 분해

```
┌──────────────────────────────────────────────────────────────────┐
│                          전체 시스템                                │
├──────────┬───────────┬───────────┬──────────┬──────────┬─────────┤
│ 인증도메인  │ 미디어도메인 │ 커뮤니티도메인│ 실시간도메인 │관리도메인   │ AI 도메인│
├──────────┼───────────┼───────────┼──────────┼──────────┼─────────┤
│          │           │           │          │          │         │
│ • 회원가입 │ • 영상목록   │ • 게시판   │ • 토론방   │ • 신고처리 │ • 추천   │
│ • 로그인   │ • 상세정보  │ • 댓글     │ • 채팅    │ • 유저관리 │ • RAG   │
│ • 토큰관리 │ • 리뷰      │ • 대댓글   │ • 활동상태 │          │ • 필터링  │
│          │ • 평가     │ • 팔로우    │ • 알림    │          │ • 모더레  │
│          │           │ • 좋아요    │          │         │  이션     │
│          │           │ • 신고     │          │          │         │
│          │           │ • 핫게시글  │          │          │         │
│          │           │ • 검색     │          │          │         │
└──────────┴───────────┴───────────┴──────────┴──────────┴─────────┘
```

### 2-2) 레이어 분해

```
┌──────────────────────────────────────────────┐
│ 프레젠테이션 계층                                │
│ (React 컴포넌트)                               │
├──────────────────────────────────────────────┤
│ 프론트엔드 상태관리 계층                           │
│ (Redux Toolkit: 클라이언트 상태)                 │
│ (RTK Query: 서버 상태 캐싱/동기화)                │
├──────────────────────────────────────────────┤
│ API 계층                                      │
│ (REST endpoints + WebSocket)                 │
├──────────────────────────────────────────────┤
│ 비즈니스 로직 계층                                │
│ (추천, 권한, 검증)                               │
├──────────────────────────────────────────────┤
│ 데이터 접근 계층                                 │
│ (DB 쿼리, 캐시)                                │
├──────────────────────────────────────────────┤
│ 저장소 계층                                     │
│ (PostgreSQL, Redis)                          │
└──────────────────────────────────────────────┘
```

---

## 3. 기술 스택 선택

| 계층 | 선택 | 이유 |
|------|------|------|
| **Frontend** | React + TypeScript | 팀 결정, 타입 안전성 |
| **Frontend 상태관리** | Redux Toolkit + RTK Query | 클라이언트 상태(Redux Toolkit) + 서버 상태(RTK Query) |
| **Backend** | Django + DRF | 팀 결정, REST API 지원, AbstractUser 내장 |
| **Real-time** | Django Channels | WebSocket 구현 |
| **Database** | PostgreSQL + pgvector | 관계형, JSON 지원, Full-text search, 벡터 검색 |
| **Cache/Queue** | Redis | 세션, 메시지 큐, Pub/Sub |
| **Task Queue** | Celery | 비동기 작업 (추천 갱신, 핫 게시글, 임베딩) |
| **AI/LLM** | OpenAI API (또는 로컬 LLM) | RAG 응답 생성, 임베딩 |
| **Vector Store** | pgvector | 미디어 벡터 임베딩 저장 및 유사도 검색 |
| **File Storage** | S3 (나중) 또는 로컬 | 프로필, 후기 이미지 |
| **Deployment** | Docker + AWS EC2 | DevOps 인프라 |

---

## 4. 데이터베이스 설계

### 4-1) 사용자 관련 테이블

```python
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Django 기본 User 확장.
    AbstractUser가 제공하는 필드: username, email, password, 
    first_name, last_name, is_active, is_staff, date_joined 등
    """
    # 프로필 확장
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True, max_length=500)
    
    # 취향 정보
    favorite_genres = models.ManyToManyField('Genre', blank=True, related_name='interested_users')
    favorite_countries = models.JSONField(default=list)
    
    updated_at = models.DateTimeField(auto_now=True)

class UserActivity(models.Model):
    """사용자 활동 상태"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='activity')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    current_chat_room = models.ForeignKey(
        'ChatRoom', null=True, blank=True, on_delete=models.SET_NULL
    )
```

### 4-2) 미디어 관련 테이블

```python
class Genre(models.Model):
    """장르 (M2M으로 미디어와 연결)"""
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class Media(models.Model):
    """영화/애니메이션/드라마"""
    TYPES = (('movie', '영화'), ('anime', '애니메이션'), ('drama', '드라마'))
    
    title = models.CharField(max_length=200)
    media_type = models.CharField(max_length=10, choices=TYPES)
    genres = models.ManyToManyField(Genre, related_name='media_items')
    country = models.CharField(max_length=50)
    description = models.TextField()
    director = models.CharField(max_length=100, blank=True)
    cast = models.TextField(blank=True)
    release_date = models.DateField(blank=True, null=True)
    image_url = models.URLField()
    
    avg_rating = models.FloatField(default=0)
    rating_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

class Review(models.Model):
    """미디어 후기 (내 공간)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    media = models.ForeignKey(Media, on_delete=models.CASCADE, related_name='reviews')
    
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    content = models.TextField()
    images = models.JSONField(default=list)
    
    VISIBILITY = (
        ('public', '공개'),
        ('followers', '팔로워만'),
        ('private', '비공개'),
    )
    visibility = models.CharField(max_length=10, choices=VISIBILITY, default='public')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'media')  # 한 유저당 한 미디어에 하나의 리뷰

class MediaInteraction(models.Model):
    """미디어에 대한 사용자 평가 (추천 시스템용)"""
    ACTIONS = (
        ('like', '좋아요'),
        ('dislike', '별로예요'),
        ('watchlist', '보고 싶어요'),
        ('watched', '이미 봤어요'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactions')
    media = models.ForeignKey(Media, on_delete=models.CASCADE, related_name='interactions')
    action = models.CharField(max_length=20, choices=ACTIONS)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'media')  # 한 유저당 한 미디어에 하나의 상태만
```

### 4-3) AI/RAG 관련 테이블

```python
class MediaEmbedding(models.Model):
    """미디어 벡터 임베딩 (RAG 검색용)"""
    media = models.OneToOneField(Media, on_delete=models.CASCADE, related_name='embedding')
    
    # pgvector 필드 (1536차원 = OpenAI text-embedding-3-small)
    embedding = VectorField(dimensions=1536)
    
    # 임베딩에 사용된 원본 텍스트 (디버깅용)
    source_text = models.TextField()
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            # pgvector HNSW 인덱스 (코사인 유사도)
            HnswIndex(
                name='media_embedding_hnsw_idx',
                fields=['embedding'],
                m=16,
                ef_construction=64,
                opclasses=['vector_cosine_ops'],
            ),
        ]

class RAGConversation(models.Model):
    """RAG 채팅 대화 기록"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rag_conversations')
    
    # 대화 내역 (JSON: [{role: "user"|"assistant", content: "..."}])
    messages = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 4-4) 커뮤니티 관련 테이블

```python
class Post(models.Model):
    """자유게시판 글"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    media_files = models.JSONField(default=list)  # 이미지, GIF, 영상
    
    like_count = models.IntegerField(default=0)
    report_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    is_hidden = models.BooleanField(default=False)  # 관리자 숨김 처리
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Comment(models.Model):
    """게시판 댓글 (대댓글 지원)"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent_comment = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='replies'
    )
    
    content = models.TextField()
    media_files = models.JSONField(default=list)
    
    like_count = models.IntegerField(default=0)
    report_count = models.IntegerField(default=0)
    is_hidden = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

class PostLike(models.Model):
    """게시글 좋아요 (분리 모델)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'post')  # 한 유저당 한 게시글에 좋아요 한 번만

class CommentLike(models.Model):
    """댓글 좋아요 (분리 모델)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'comment')  # 한 유저당 한 댓글에 좋아요 한 번만

class Report(models.Model):
    """신고"""
    TYPES = (
        ('spam', '스팸'),
        ('abuse', '욕설/폭언'),
        ('nsfw', '부적절한 콘텐츠'),
        ('copyright', '저작권 침해'),
    )
    STATUS = (
        ('pending', '대기'),
        ('approved', '승인'),
        ('rejected', '반려'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=20, choices=TYPES)
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS, default='pending')
    
    # ContentType 대신 심플하게 분리
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_reports')
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(post__isnull=False, comment__isnull=True) |
                    models.Q(post__isnull=True, comment__isnull=False)
                ),
                name='report_target_exactly_one'
            )
        ]

class Follow(models.Model):
    """팔로우"""
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('follower', 'following')  # 중복 팔로우 방지
        constraints = [
            models.CheckConstraint(
                check=~models.Q(follower=models.F('following')),
                name='cannot_follow_self'
            )
        ]

class TrendingPost(models.Model):
    """최근 핫 게시글 (캐시용, 3시간 단위)"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    score = models.FloatField()
    calculated_at = models.DateTimeField(auto_now_add=True)
```

### 4-5) 실시간 토론방 테이블

```python
class ChatRoom(models.Model):
    """실시간 토론방 (전체 시스템 최대 10개)"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rooms')
    
    max_members = models.IntegerField(default=4)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

class ChatRoomMember(models.Model):
    """토론방 멤버"""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('room', 'user')

class ChatMessage(models.Model):
    """토론방 채팅 메시지 (row 단위 저장)"""
    MESSAGE_TYPES = (
        ('message', '일반 메시지'),
        ('join', '입장 알림'),
        ('leave', '퇴장 알림'),
    )
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='message')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
        ]
```

---

## 5. API 엔드포인트 설계

### 5-0) 공통 에러 응답 형식

모든 API는 다음 에러 응답 형식을 따른다:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "사용자에게 보여줄 메시지",
    "details": {
      "field_name": ["구체적인 에러 내용"]
    }
  }
}
```

에러 코드 목록:

| HTTP 상태 | 에러 코드 | 설명 |
|-----------|----------|------|
| 400 | `VALIDATION_ERROR` | 입력값 검증 실패 |
| 401 | `UNAUTHORIZED` | 인증 필요 (토큰 없음/만료) |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 중복 (이미 좋아요 등) |
| 429 | `RATE_LIMITED` | 요청 횟수 초과 |
| 500 | `INTERNAL_ERROR` | 서버 내부 에러 |

### 5-1) 인증 API

```
POST   /api/auth/register              회원가입 + 취향 선택
POST   /api/auth/login                 로그인 → access + refresh token
POST   /api/auth/refresh               access token 갱신
POST   /api/auth/logout                로그아웃 (refresh token 블랙리스트)
```

### 5-2) 사용자 API (auth에서 분리)

```
GET    /api/users/me                   현재 사용자 정보
PUT    /api/users/me                   사용자 정보 수정
PUT    /api/users/me/avatar            프로필 사진 변경
GET    /api/users/{id}                 사용자 프로필
GET    /api/users/{id}/followers       팔로워 목록
GET    /api/users/{id}/following       팔로잉 목록
GET    /api/users/{id}/reviews         사용자 리뷰 목록
GET    /api/users/{id}/activity        사용자 활동 상태
POST   /api/users/{id}/follow          팔로우
DELETE /api/users/{id}/follow          언팔로우
```

### 5-3) 미디어 API

```
GET    /api/media                      미디어 목록 (검색/필터)
  Query: ?cursor=xxx&limit=30&type=movie&genre=1,2&country=한국

GET    /api/media/{id}                 미디어 상세
GET    /api/media/{id}/reviews         해당 미디어 리뷰 목록
POST   /api/media/{id}/reviews         리뷰 작성
PUT    /api/media/{id}/reviews/{rid}   리뷰 수정
DELETE /api/media/{id}/reviews/{rid}   리뷰 삭제

POST   /api/media/{id}/interaction     평가 (좋아요/별로에요/찜)
  Body: {action: "like" | "dislike" | "watchlist"}

GET    /api/media/trending             트렌드 리스트
GET    /api/media/random               랜덤 리스트
```

### 5-4) 추천 API (미디어에서 분리)

```
GET    /api/recommendations            개인 맞춤 추천 목록
  Query: ?cursor=xxx&limit=30
  
  응답: {
    "results": [...],
    "next_cursor": "xxx",
    "algorithm": "hybrid" | "followers" | "cold_start"
  }

GET    /api/recommendations/friends    팔로우한 사람의 취향 기반 추천
```

### 5-5) AI 채팅 추천 API (RAG)

```
POST   /api/rag/chat                    채팅 메시지 전송 + AI 응답
  Body: {
    "message": "액션 영화인데 로맨스도 좀 있는 거 추천해줘",
    "conversation_id": null | "uuid"
  }
  응답: {
    "conversation_id": "uuid",
    "response": "추천 드릴게요! ...",
    "referenced_media": [
      {"id": 1, "title": "...", "similarity": 0.92},
      ...
    ]
  }

GET    /api/rag/conversations           내 대화 목록
GET    /api/rag/conversations/{id}      대화 상세 (이전 메시지 포함)
DELETE /api/rag/conversations/{id}      대화 삭제
```

### 5-6) 게시판 API

```
GET    /api/posts                      게시판 목록 (cursor 페이지네이션)
  Query: ?cursor=xxx&limit=20&sort=recent|trending&search=검색어

POST   /api/posts                      글 작성
GET    /api/posts/{id}                 글 상세
PUT    /api/posts/{id}                 글 수정
DELETE /api/posts/{id}                 글 삭제

GET    /api/posts/{id}/comments        댓글 목록 (트리 구조)
POST   /api/posts/{id}/comments        댓글 작성
PUT    /api/comments/{id}              댓글 수정
DELETE /api/comments/{id}              댓글 삭제

POST   /api/posts/{id}/like            게시글 좋아요
DELETE /api/posts/{id}/like            게시글 좋아요 취소
POST   /api/comments/{id}/like         댓글 좋아요
DELETE /api/comments/{id}/like         댓글 좋아요 취소

POST   /api/posts/{id}/report          게시글 신고
POST   /api/comments/{id}/report       댓글 신고

GET    /api/posts/trending             핫 게시글 (3시간 단위)
```

### 5-7) 실시간 토론방 API

```
GET    /api/chat-rooms                 토론방 목록 (활성화된 것만)
POST   /api/chat-rooms                 토론방 생성 (전체 시스템 최대 10개)
GET    /api/chat-rooms/{id}            토론방 상세
DELETE /api/chat-rooms/{id}            토론방 종료

WS     /ws/chat/{room_id}              토론방 WebSocket

POST   /api/chat-rooms/{id}/join       토론방 입장
POST   /api/chat-rooms/{id}/leave      토론방 퇴장
```

### 5-8) 관리자 API

```
GET    /api/admin/reports              신고 목록 (필터: pending/approved/rejected)
PUT    /api/admin/reports/{id}         신고 처리 (승인/반려)
  Body: {status: "approved" | "rejected"}
  → approved 시 해당 콘텐츠 is_hidden = True

GET    /api/admin/users                사용자 목록
PUT    /api/admin/users/{id}/ban       사용자 정지
```

---

## 6. 데이터 흐름 설계

### 6-1) 미디어 추천 흐름

```
사용자 (첫 접속 - 콜드 스타트)
  │
  └─ GET /api/recommandations?limit=30
    │
    Backend (Django)
    │
    ├─ 1. Redis 캐시 확인
    │      cache_key = "reco:user_{id}"
    │      → 없음 (첫 접속)
    │
    ├─ 2. 콜드 스타트 추천
    │      - 선택한 장르 기반 필터링
    │      - 평점 가중치 적용
    │      - 인기 트렌드 혼합
    │
    ├─ 3. Redis에 캐싱
    │      cache.set(key, data, timeout=None)
    │      → TTL 없음, 상호작용 시 Celery가 갱신
    │
    └─ 4. 응답 반환

사용자 (좋아요 누름 - 협업 필터링 트리거)
  │
  ├─ POST /api/media/1/interaction
  │   Body: {action: "like"}
  │
  Backend
  │
  ├─ 1. 즉시 UI 반영 (프론트 낙관적 업데이트)
  │
  ├─ 2. DB 저장
  │      INSERT INTO media_interactions
  │
  ├─ 3. Celery 비동기 추천 재계산 트리거
  │      refresh_user_recommendations.delay(user_id)
  │
  └─ 4. Celery 워커
         ├─ 유사 유저 계산 (같은 미디어에 같은 반응)
         ├─ 팔로우한 유저의 최근 좋아요 반영
         ├─ 새로운 추천 목록 생성
         └─ Redis 캐시 갱신
              cache.set("reco:user_{id}", new_recommendations)
```

### 6-2) 게시판 댓글 흐름

```
사용자 A (댓글 작성)
  │
  ├─ POST /api/posts/1/comments
  │
  Frontend (React)
  │
  ├─ 1. 즉시 UI에 댓글 표시 (낙관적 업데이트)
  │
  └─ 2. 백엔드 요청
    
  Backend
  │
  ├─ 1. DB에 저장
  │      INSERT INTO comments
  │
  ├─ 2. 응답 반환
  │
  └─ 3. 댓글 캐시 무효화
         cache.delete("post_comments:{post_id}")

사용자 B (같은 글 보고 있음)
  │
  ├─ 3초 폴링으로 새 댓글 수신
  │
  └─ UI 자동 업데이트
```

### 6-3) 실시간 토론방 흐름

```
사용자 A (토론방 생성)
  │
  ├─ POST /api/chat-rooms
  │   → 전체 활성 토론방 10개 미만인지 확인
  │
  Backend
  │
  ├─ 1. DB에 ChatRoom 저장
  │
  └─ 2. WebSocket URL 제공

사용자 A, B, C, D (입장)
  │
  ├─ POST /api/chat-rooms/{id}/join
  │   → 현재 멤버 4명 미만인지 확인
  │
  ├─ WS /ws/chat/{room_id} 연결
  │
  Backend (Django Channels)
  │
  ├─ 1. 연결 수락 + JWT 인증 확인
  │
  ├─ 2. Redis 채널 가입
  │
  ├─ 3. ChatMessage 저장 (type: "join")
  │
  └─ 4. 입장 메시지 브로드캐스트

사용자 A (메시지 전송)
  │
  ├─ WS Message 전송
  │
  Backend
  │
  ├─ 1. ChatMessage 테이블에 row 저장
  │
  ├─ 2. 모든 멤버에게 브로드캐스트
  │
  └─ 3. 다른 멤버 화면에 즉시 표시

토론방 종료 시
  │
  ├─ DELETE /api/chat-rooms/{id}
  │
  Backend
  │
  ├─ 1. is_active = False, ended_at 기록
  │
  └─ 2. (선택) Celery로 ChatMessage → JSON export
```

### 6-4) AI 채팅 추천 (RAG) 흐름

```
[초기 세팅 - 미디어 임베딩 파이프라인]

Celery Beat (매일 새벽)
  │
  ├─ Media 테이블에서 새로 추가/수정된 미디어 조회
  │
  ├─ 각 미디어의 텍스트 생성
  │      text = f"{title} | {genres} | {country} | {description}"
  │      + 해당 미디어의 상위 리뷰 텍스트 추가
  │
  ├─ 임베딩 API 호출
  │      embedding = openai.embeddings.create(text, model="text-embedding-3-small")
  │
  └─ MediaEmbedding 테이블에 저장 (pgvector)
         INSERT INTO media_embeddings (media_id, embedding, source_text)
         ON CONFLICT (media_id) DO UPDATE

[사용자 질문 시 - RAG 파이프라인]

사용자
  │
  ├─ POST /api/rag/chat
  │   Body: {message: "스릴러인데 반전 있는 영화 추천해줘"}
  │
  Backend (Django)
  │
  ├─ 1. 사용자 질문 임베딩
  │      query_embedding = embed(message)
  │
  ├─ 2. pgvector 유사도 검색 (Top-K)
  │      SELECT m.*, me.embedding <=> query_embedding AS distance
  │      FROM media_embeddings me
  │      JOIN media m ON m.id = me.media_id
  │      ORDER BY distance
  │      LIMIT 5
  │
  ├─ 3. 컨텍스트 구성
  │      context = 검색된 미디어 5개의 제목, 장르, 설명, 평점
  │      + 사용자의 이전 대화 히스토리 (RAGConversation.messages)
  │      + 사용자의 취향 정보 (User.favorite_genres)
  │
  ├─ 4. LLM 응답 생성
  │      prompt = system_prompt + context + user_message
  │      response = llm.chat(prompt)
  │
  ├─ 5. 대화 기록 저장
  │      RAGConversation.messages.append([
  │          {role: "user", content: message},
  │          {role: "assistant", content: response}
  │      ])
  │
  └─ 6. 응답 반환
         {
           response: "스릴러 반전 영화라면...",
           referenced_media: [{id, title, similarity}, ...],
           conversation_id: "uuid"
         }
```

---

## 7. 성능 최적화 전략

### 7-1) Redis 캐싱 계획

| 캐시 키 | TTL | 갱신 방식 |
|---------|-----|---------|
| reco:user_{id} | 없음 | 상호작용 시 Celery 비동기 갱신 |
| trending_posts | 3시간 | Celery Beat (주기적) |
| user_profile:{user_id} | 24시간 | 정보 수정 시 무효화 |
| media_reviews:{media_id} | 1시간 | 새 리뷰 추가 시 무효화 |
| post_comments:{post_id} | 5분 | 새 댓글 추가 시 무효화 |
| user_followers:{user_id} | 24시간 | 팔로우 변경 시 무효화 |
| online_status | Session | WebSocket 활성 시 갱신 |
| rag_response:{query_hash} | 1시간 | 동일 질문 캐싱 (선택) |

### 7-2) 데이터베이스 인덱스

```python
# ===== 단일 인덱스 =====
# 각 테이블의 FK는 Django가 자동으로 인덱스를 생성함

# ===== 복합 인덱스 =====
# 
# 복합 인덱스란?
# 두 개 이상의 컬럼을 하나의 인덱스로 묶는 것.
# WHERE 절 + ORDER BY에 자주 같이 쓰이는 컬럼을 묶으면
# DB가 필터링과 정렬을 한 번에 인덱스에서 처리함.
#
# 예: (genre_id, avg_rating DESC) 복합 인덱스가 있으면
#     WHERE genre_id = 1 ORDER BY avg_rating DESC
#     → 인덱스 하나로 필터 + 정렬 동시 처리 (Index Only Scan)
#
#     단일 인덱스 (genre_id)만 있으면
#     → genre_id로 필터링 후 결과를 다시 avg_rating으로 정렬 (추가 비용)

class Media(models.Model):
    class Meta:
        indexes = [
            # 추천 조회: 장르별 + 평점순
            # → WHERE genre_id IN (...) ORDER BY avg_rating DESC
            models.Index(fields=['media_type', '-avg_rating']),
        ]

# Genre-Media M2M은 Django가 중간 테이블 자동 생성 + 인덱스

class Post(models.Model):
    class Meta:
        indexes = [
            # 게시판 최신순: ORDER BY created_at DESC
            models.Index(fields=['-created_at']),
            # 인기순: ORDER BY like_count DESC
            models.Index(fields=['-like_count']),
        ]

class Comment(models.Model):
    class Meta:
        indexes = [
            # 특정 게시글의 댓글 시간순
            # → WHERE post_id = ? ORDER BY created_at
            models.Index(fields=['post_id', 'created_at']),
        ]

class MediaInteraction(models.Model):
    class Meta:
        indexes = [
            # 특정 유저의 모든 상호작용 (추천 계산용)
            # → WHERE user_id = ? 
            models.Index(fields=['user_id', 'action']),
            # 특정 미디어의 모든 상호작용 (인기도 계산용)
            # → WHERE media_id = ? GROUP BY action
            models.Index(fields=['media_id', 'action']),
        ]

class Follow(models.Model):
    class Meta:
        indexes = [
            # 특정 유저가 팔로우하는 사람 목록
            models.Index(fields=['follower_id']),
            # 특정 유저를 팔로우하는 사람 목록
            models.Index(fields=['following_id']),
        ]

class ChatMessage(models.Model):
    class Meta:
        indexes = [
            # 특정 방의 메시지 시간순
            # → WHERE room_id = ? ORDER BY created_at
            models.Index(fields=['room_id', 'created_at']),
        ]

class Report(models.Model):
    class Meta:
        indexes = [
            # 관리자: 대기 중인 신고 목록
            # → WHERE status = 'pending' ORDER BY created_at
            models.Index(fields=['status', 'created_at']),
        ]
```

### 7-3) Celery 배경 작업

```python
# tasks.py

@shared_task
def refresh_user_recommendations(user_id: int):
    """
    사용자 상호작용 후 비동기 추천 재계산.
    1. 유사 유저 계산 (협업 필터링)
    2. 팔로우 유저의 취향 반영
    3. 새 추천 목록 Redis에 저장
    """
    recommendations = RecommendationService.calculate(user_id)
    cache.set(f"reco:user_{user_id}", recommendations)

@shared_task
def refresh_media_embeddings():
    """
    새로 추가/수정된 미디어의 벡터 임베딩 갱신.
    1. 임베딩이 없거나 Media.updated_at > Embedding.updated_at인 미디어 조회
    2. 제목+장르+설명+상위리뷰로 텍스트 구성
    3. 임베딩 API 호출
    4. MediaEmbedding upsert
    """
    EmbeddingService.refresh_outdated_embeddings()

@shared_task
def refresh_trending_posts():
    """3시간마다 핫 게시글 갱신"""
    TrendingService.calculate_trending_posts()

@shared_task
def export_chat_history(room_id: int):
    """토론방 종료 후 채팅 로그 JSON export"""
    ChatService.export_to_json(room_id)

@shared_task
def cleanup_expired_sessions():
    """만료된 세션/블랙리스트 토큰 정리"""
    TokenBlacklist.objects.filter(expires_at__lt=timezone.now()).delete()

# Celery Beat 스케줄
CELERY_BEAT_SCHEDULE = {
    'refresh-trending': {
        'task': 'tasks.refresh_trending_posts',
        'schedule': crontab(minute=0, hour='*/3'),  # 3시간마다
    },
    'refresh-embeddings': {
        'task': 'tasks.refresh_media_embeddings',
        'schedule': crontab(minute=0, hour=3),  # 매일 새벽 3시
    },
    'cleanup-sessions': {
        'task': 'tasks.cleanup_expired_sessions',
        'schedule': crontab(minute=0, hour=4),  # 매일 새벽 4시
    },
}
```

### 7-4) 페이지네이션

```python
# Cursor 기반 페이지네이션 예시 (DRF)
#
# Offset 방식의 문제:
#   GET /api/posts?offset=0&limit=10  → 1~10번 글
#   (새 글이 추가됨)
#   GET /api/posts?offset=10&limit=10 → 10번 글이 또 나옴 (중복!)
#
# Cursor 방식:
#   GET /api/posts?limit=10           → 1~10번 글, next_cursor="post_10_id"
#   (새 글이 추가됨)
#   GET /api/posts?cursor=post_10_id&limit=10 → 11~20번 글 (중복 없음)

# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.CursorPagination',
    'PAGE_SIZE': 20,
}

# views.py (커스텀 cursor)
class PostCursorPagination(CursorPagination):
    page_size = 20
    ordering = '-created_at'
    cursor_query_param = 'cursor'
```

---

## 8. 보안 설계

### 8-1) JWT 인증

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,           # refresh 시 새 refresh token 발급
    'BLACKLIST_AFTER_ROTATION': True,         # 이전 refresh token 블랙리스트
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Refresh Token 저장: httpOnly Cookie (XSS 방지)
# Access Token: 메모리 (localStorage 사용 금지)
```

### 8-2) 파일 업로드 제한

```python
# 허용 확장자
ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']
ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm']

# 크기 제한
MAX_IMAGE_SIZE = 5 * 1024 * 1024    # 5MB
MAX_VIDEO_SIZE = 20 * 1024 * 1024   # 20MB
MAX_FILES_PER_POST = 5              # 한 게시글당 최대 5개

# 서버 레벨
DATA_UPLOAD_MAX_MEMORY_SIZE = 25 * 1024 * 1024  # 25MB
```

### 8-3) Rate Limiting

```python
# settings.py (DRF throttling)
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '100/hour',
        'anon': '30/hour',
        'auth': '5/minute',    # 로그인 시도 제한
    }
}
```

---

## 9. 프론트엔드 상태관리 설계

### 9-1) 상태 분류

```
┌─────────────────────────────────────────────────────────┐
│                  React 앱 상태 구조                        │
├─────────────────────────┬───────────────────────────────┤
│   클라이언트 상태           │     서버 상태                   │
│   (Redux Toolkit)       │     (RTK Query)               │
├─────────────────────────┼───────────────────────────────┤
│                         │                               │
│ • 현재 로그인 유저 정보      │ • 미디어 목록/상세                │
│ • JWT 토큰 (메모리)        │ • 추천 피드                     │
│ • UI 상태 (모달, 사이드바)   │ • 게시판 글/댓글                 │
│ • 테마/언어 설정            │ • 유저 프로필                   │
│ • 토론방 WebSocket 상태    │ • 팔로워/팔로잉 목록              │
│ • RAG 채팅 입력 상태       │ • 토론방 목록                    │
│                         │ • 리뷰 목록                     │
│                         │ • RAG 대화 기록                 │
│                         │ • 관리자 신고 목록                │
│                         │ • 핫 게시글                     │
└─────────────────────────┴───────────────────────────────┘
```

### 9-2) Redux Toolkit Store 구조

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    // 클라이언트 상태 (Redux Toolkit Slices)
    auth: authReducer,       // 로그인 유저, JWT 토큰
    ui: uiReducer,           // 모달, 사이드바, 테마, 언어
    chat: chatReducer,       // WebSocket 연결 상태, 토론방 실시간 메시지

    // 서버 상태 (RTK Query)
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
```

### 9-3) 클라이언트 상태 Slices

```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null, isAuthenticated: false },
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) Object.assign(state.user, action.payload);
    },
  },
});

// store/slices/uiSlice.ts
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light' as 'light' | 'dark',
    language: 'ko' as 'ko' | 'en' | 'fr',
    sidebarOpen: false,
    activeModal: null as string | null,
  },
  reducers: {
    toggleTheme: (state) => { state.theme = state.theme === 'light' ? 'dark' : 'light'; },
    setLanguage: (state, action) => { state.language = action.payload; },
    openModal: (state, action) => { state.activeModal = action.payload; },
    closeModal: (state) => { state.activeModal = null; },
  },
});

// store/slices/chatSlice.ts
// WebSocket 메시지는 RTK Query 캐시가 아닌 별도 slice로 관리
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    connected: false,
    currentRoomId: null as number | null,
    messages: [] as ChatMessage[],   // 실시간 메시지 버퍼
    typingUsers: [] as string[],
  },
  reducers: {
    wsConnected: (state, action) => { state.connected = true; state.currentRoomId = action.payload; },
    wsDisconnected: (state) => { state.connected = false; state.messages = []; },
    messageReceived: (state, action) => { state.messages.push(action.payload); },
    setTypingUsers: (state, action) => { state.typingUsers = action.payload; },
  },
});
```

### 9-4) RTK Query API 정의

```typescript
// store/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    // Redux store에서 JWT 토큰을 가져와 자동 주입
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// 401 시 자동 refresh 처리
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    const refreshResult = await baseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions);
    if (refreshResult.data) {
      api.dispatch(setCredentials(refreshResult.data));
      result = await baseQuery(args, api, extraOptions);  // 원래 요청 재시도
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Media', 'Recommendations', 'Posts', 'Comments',
    'User', 'Followers', 'Reviews', 'ChatRooms',
    'RAGConversations', 'Reports', 'Trending',
  ],
  endpoints: () => ({}),  // 각 도메인별 파일에서 injectEndpoints
});

// store/api/mediaApi.ts
export const mediaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMedia: builder.query({
      query: ({ cursor, limit = 30, type, genre, country }) => ({
        url: '/media',
        params: { cursor, limit, type, genre, country },
      }),
      providesTags: (result) =>
        result
          ? [...result.results.map(({ id }) => ({ type: 'Media', id })), { type: 'Media', id: 'LIST' }]
          : [{ type: 'Media', id: 'LIST' }],
    }),
    getMediaDetail: builder.query({
      query: (id) => `/media/${id}`,
      providesTags: (result, error, id) => [{ type: 'Media', id }],
    }),
    addInteraction: builder.mutation({
      query: ({ mediaId, action }) => ({
        url: `/media/${mediaId}/interaction`,
        method: 'POST',
        body: { action },
      }),
      // 낙관적 업데이트: 서버 응답 전에 UI 즉시 반영
      async onQueryStarted({ mediaId, action }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          mediaApi.util.updateQueryData('getMediaDetail', mediaId, (draft) => {
            draft.user_interaction = action;
          })
        );
        try { await queryFulfilled; } catch { patchResult.undo(); }
      },
      invalidatesTags: ['Recommendations'],  // 상호작용 후 추천 캐시 무효화
    }),
  }),
});

// store/api/postApi.ts
export const postApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: ({ cursor, sort = 'recent', search }) => ({
        url: '/posts',
        params: { cursor, sort, search },
      }),
      providesTags: ['Posts'],
    }),
    likePost: builder.mutation({
      query: (postId) => ({ url: `/posts/${postId}/like`, method: 'POST' }),
      // 낙관적 업데이트: 좋아요 카운트 즉시 증가
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          postApi.util.updateQueryData('getPosts', undefined, (draft) => {
            const post = draft.results.find((p) => p.id === postId);
            if (post) { post.like_count += 1; post.is_liked = true; }
          })
        );
        try { await queryFulfilled; } catch { patchResult.undo(); }
      },
      invalidatesTags: ['Posts'],
    }),
  }),
});

// store/api/recommendationApi.ts
export const recommendationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecommendations: builder.query({
      query: ({ cursor, limit = 30 }) => ({
        url: '/recommendations',
        params: { cursor, limit },
      }),
      providesTags: ['Recommendations'],
    }),
    getFriendsRecommendations: builder.query({
      query: () => '/recommendations/friends',
      providesTags: ['Recommendations'],
    }),
  }),
});

// store/api/ragApi.ts
export const ragApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendRagMessage: builder.mutation({
      query: ({ message, conversationId }) => ({
        url: '/rag/chat',
        method: 'POST',
        body: { message, conversation_id: conversationId },
      }),
      invalidatesTags: ['RAGConversations'],
    }),
    getRagConversations: builder.query({
      query: () => '/rag/conversations',
      providesTags: ['RAGConversations'],
    }),
  }),
});
```

### 9-5) 상태관리 전략 요약

| 데이터 | 관리 방식 | 이유 |
|--------|----------|------|
| JWT 토큰 | authSlice (Redux Toolkit) | 메모리에만 보관, 여러 컴포넌트에서 접근 |
| 로그인 유저 정보 | authSlice (Redux Toolkit) | 전역에서 필요, 서버 동기화 불필요 |
| UI 상태 (모달, 테마, 언어) | uiSlice (Redux Toolkit) | 순수 클라이언트 상태 |
| WebSocket 채팅 메시지 | chatSlice (Redux Toolkit) | 실시간 스트림, REST 캐시와 성격 다름 |
| 미디어/게시판/추천 데이터 | RTK Query | 서버 데이터 캐싱 + 자동 리페칭 |
| 좋아요/인터랙션 | RTK Query (낙관적 업데이트) | 즉시 UI 반영 + 실패 시 롤백 |
| RAG 대화 | RTK Query (mutation) | 서버 저장 필요 + 대화 목록 캐싱 |
| 팔로우/프로필 | RTK Query | 서버 데이터, tag invalidation으로 자동 갱신 |
| 댓글 (3초 폴링) | RTK Query (pollingInterval) | `pollingInterval: 3000` 설정으로 자동 폴링 |

---

## 10. 개발 로드맵 (9주)

### Phase 1: 기반 구축 (Week 1~2)

#### WEEK 1: 인프라 + 인증

**Data/DevOps:**
- Docker Compose 세팅 (Django + PostgreSQL + Redis)
- DB 마이그레이션 스크립트
- Redis 설정
- CI/CD 초기 구성 (GitHub Actions)

**Backend:**
- Django 프로젝트 구조 (앱 분리: auth, users, media, community, chat)
- AbstractUser 모델 + JWT 인증 구현
- 회원가입/로그인/로그아웃 API
- 공통 에러 응답 미들웨어

**Frontend:**
- 개발 환경 구성 (React + TypeScript)
- Redux Toolkit + RTK Query 스토어 설정
  - authSlice, uiSlice 초기 구현
  - apiSlice baseQuery + 자동 reauth 미들웨어
- 로그인/회원가입 화면
- JWT 토큰 관리 (authSlice에서 관리, 인터셉터 자동 갱신)
- 공통 컴포넌트 시작 (Layout, Header, ErrorBoundary)

**AI:**
- 추천 알고리즘 분석 및 데이터셋 조사
- 콜드 스타트 로직 설계
- RAG 시스템 아키텍처 설계 (임베딩 모델 선정, pgvector 테스트)

#### WEEK 2: 미디어 + 추천 기초

**Data/DevOps:**
- 미디어 데이터 로드 (초기 시드 데이터)
- Redis 캐싱 전략 구현
- 모니터링 설정 (기본)

**Backend:**
- Media, Genre 모델 + API 구현
- 콜드 스타트 추천 API (장르 기반)
- MediaInteraction API
- 파일 업로드 API (이미지)

**Frontend:**
- RTK Query: mediaApi, recommendationApi 엔드포인트 정의
- 미디어 목록/상세 화면 (RTK Query 캐싱 + 무한스크롤)
- 취향 선택 온보딩 화면
- 추천 피드 화면 (RTK Query providesTags로 캐시 관리)
- 미디어 인터랙션 UI (낙관적 업데이트: onQueryStarted)

**AI:**
- 콜드 스타트 추천 로직 구현
- 협업 필터링 프로토타입
- 미디어 임베딩 파이프라인 구현 (시드 데이터 임베딩)

---

### Phase 2: 핵심 기능 (Week 3~5)

#### WEEK 3: 내 공간 + 리뷰

**Backend:**
- Review CRUD API
- 사용자 프로필 API (/api/users/*)
- 공개범위 필터링 로직

**Frontend:**
- 내 공간 화면 (프로필, 리뷰 목록)
- 리뷰 작성/수정/삭제 화면
- 프로필 편집 화면
- 다른 유저 프로필 조회 화면

**AI:**
- 협업 필터링 구현 (유사 유저 계산)
- Celery 비동기 추천 갱신 연동

**Data/DevOps:**
- Celery + Celery Beat 설정
- 추천 캐시 갱신 파이프라인

#### WEEK 4: 게시판 기본

**Backend:**
- Post CRUD API
- Comment (대댓글 포함) API
- PostLike, CommentLike API
- Cursor 페이지네이션 적용

**Frontend:**
- 게시판 목록 화면 (무한스크롤, 정렬)
- 글 작성/상세/수정 화면
- 댓글/대댓글 UI (트리 구조)
- 좋아요 낙관적 업데이트

**Data/DevOps:**
- DB 인덱스 최적화
- 쿼리 성능 모니터링

#### WEEK 5: 게시판 확장 + 팔로우 + RAG

**Backend:**
- 신고 API
- 팔로우/언팔로우 API
- 게시글 검색 API (PostgreSQL full-text search)
- 핫 게시글 로직 (Celery Beat)
- RAG API 엔드포인트 구현 (/api/rag/chat, conversations)

**Frontend:**
- 신고 모달 UI
- 팔로우/언팔로우 UI
- 검색 화면 (필터, 정렬)
- 핫 게시글 섹션
- AI 채팅 추천 UI (대화형 인터페이스)

**AI:**
- 팔로우 기반 추천 로직 추가
- 추천 알고리즘 튜닝
- RAG 파이프라인 완성 (검색 + LLM 응답 생성)
- 프롬프트 엔지니어링 (시스템 프롬프트, 컨텍스트 구성)

**Data/DevOps:**
- pgvector 인덱스 성능 튜닝
- 임베딩 갱신 Celery Beat 설정

---

### Phase 3: 실시간 + 관리 (Week 6~7)

#### WEEK 6: 실시간 토론방

**Data/DevOps:**
- Django Channels 설정
- Redis Channel Layer 구성
- WebSocket 인프라 구성

**Backend:**
- ChatRoom CRUD API
- ChatMessage 모델 + WebSocket Consumer
- 입장/퇴장 로직 (멤버 수 제한)
- 토론방 10개 제한 로직

**Frontend:**
- 토론방 목록 화면
- 채팅 UI (실시간 메시지)
- WebSocket 클라이언트 (연결/재연결/에러 처리)
- 활동 상태 표시

#### WEEK 7: 관리자 + 보안 + AI 모더레이션

**Backend:**
- 관리자 API (신고 처리, 유저 정지)
- Rate Limiting 적용
- 파일 업로드 검증 강화
- Content moderation 미들웨어 연동

**Frontend:**
- 관리자 대시보드 (신고 목록, 처리, AI 판단 표시)
- 알림 시스템 (기본)

**AI:**
- Content moderation AI 구현 (욕설/스팸 자동 감지)
- RAG 응답 품질 튜닝 + 엣지 케이스 처리

**Data/DevOps:**
- 보안 점검
- 로깅 시스템 구축

---

### Phase 4: 완성 + 배포 (Week 8~9)

#### WEEK 8: 통합 테스트 + 최적화

**전체 팀:**
- 통합 테스트 (시나리오별)
- 크로스 브라우저 테스트
- 성능 최적화 (N+1 쿼리, 캐시 히트율)
- 버그 수정

**Data/DevOps:**
- 성능 모니터링 대시보드
- 캐시 최적화
- 스테이징 환경 구성

#### WEEK 9: 배포 + 문서화

**전체 팀:**
- 프로덕션 배포
- README.md 작성 (모듈 설명, 역할 분담)
- API 문서화
- 발표 준비
- 최종 버그 수정

**Data/DevOps:**
- 프로덕션 인프라 구성
- SSL 인증서
- 백업 전략 설정
- Health check + 모니터링

---

## ✅ 팀 회의 체크리스트

### 데이터 스키마 확인
- [ ] AbstractUser 기반 User 모델 합의
- [ ] Genre M2M 관계 확인
- [ ] unique_together 제약조건 검토
- [ ] ChatMessage 테이블 구조 합의
- [ ] 인덱스 전략 확인

### API 엔드포인트 확인
- [ ] 에러 응답 형식 합의
- [ ] Cursor 페이지네이션 방식 합의
- [ ] 인증 방식 (JWT access/refresh 흐름)
- [ ] 각 엔드포인트별 요청/응답 형식

### 실시간 수준 최종 결정
- [ ] WebSocket: 토론방, 활동상태
- [ ] 폴링: 댓글 (3초)
- [ ] Celery 비동기: 추천 갱신, 임베딩 갱신

### RAG 시스템
- [ ] 임베딩 모델 선정 (OpenAI vs Sentence-Transformers)
- [ ] LLM API 선정 (OpenAI vs 로컬 모델)
- [ ] pgvector 설치 및 인덱스 전략
- [ ] 프롬프트 템플릿 합의
- [ ] API Key 관리 (.env)

### 파일 업로드 전략
- [ ] 로컬 → S3 전환 시점
- [ ] 파일 크기 제한 (이미지 5MB, 영상 20MB)
- [ ] 허용 확장자 목록

### 개발 환경 세팅
- [ ] Git 저장소 구조 (monorepo vs 분리)
- [ ] 브랜치 전략 (main, dev, feature/*)
- [ ] CI/CD 설정 (GitHub Actions)

### 일정 확정
- [ ] 각 주차별 담당자 확인
- [ ] Phase별 마일스톤 설정
- [ ] 주간 점검 일정 (매주 월요일?)

---

## 📞 협업 방식

### Data/DevOps의 역할
1. **인프라 구축:** Docker, Docker Compose, AWS 설정
2. **데이터베이스:** 마이그레이션, 인덱스 최적화, 시드 데이터
3. **캐싱:** Redis 전략 수립, Celery 설정
4. **성능:** 모니터링, 병목 지점 분석
5. **배포:** CI/CD, 자동화, Health check

### Backend 개발자의 역할
1. **API:** REST 엔드포인트 구현 + 에러 처리
2. **비즈니스 로직:** 추천 연동, 필터링, 권한 검증
3. **DB 쿼리:** ORM 활용 + N+1 방지
4. **실시간:** WebSocket Consumer 구현

### Frontend x2의 역할
1. **UI 컴포넌트:** 각 페이지 화면
2. **상태 관리:** Redux Toolkit (클라이언트) + RTK Query (서버) 분리 운영
3. **API 통신:** RTK Query 엔드포인트 정의, 낙관적 업데이트, tag invalidation
4. **최적화:** 렌더링 성능, 코드 스플리팅, RTK Query 캐시 전략

### AI의 역할
1. **콜드 스타트:** 장르 기반 초기 추천
2. **협업 필터링:** 유사 유저 계산 + 추천
3. **팔로우 반영:** 소셜 그래프 기반 추천
4. **RAG 시스템:** 미디어 임베딩, 벡터 검색, LLM 프롬프트 엔지니어링
5. **Content Moderation:** 욕설/스팸 자동 감지 모델
6. **지속 개선:** 추천 정확도 + RAG 응답 품질 모니터링

---

## 📚 참고 문서

- Django Documentation: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- Django Channels: https://channels.readthedocs.io/
- djangorestframework-simplejwt: https://django-rest-framework-simplejwt.readthedocs.io/
- Redis Documentation: https://redis.io/documentation
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- pgvector: https://github.com/pgvector/pgvector
- django-pgvector: https://github.com/pgvector/pgvector-python
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings

---

**문서 작성:** Seonghyeon Kim  
**최종 수정:** 2026년 4월 13일  
**버전:** v5 (Redux Toolkit + RTK Query 상태관리 추가)

### 변경 이력
- v1 → v2: 초기 설계
- v2 → v3: DB 설계 개선, API 구조화, 보안, 로드맵 9주 확장
- v3 → v4: RAG 시스템, Content moderation AI, pgvector 도입
- v4 → v5:
  - 프론트엔드 상태관리 설계 섹션 추가 (섹션 9)
  - Redux Toolkit: authSlice, uiSlice, chatSlice 설계
  - RTK Query: apiSlice + 도메인별 엔드포인트 (media, post, recommendation, rag)
  - 낙관적 업데이트 전략 (좋아요, 인터랙션)
  - 자동 JWT refresh (baseQueryWithReauth)
  - WebSocket 메시지는 chatSlice로 분리 (RTK Query와 혼용하지 않음)
  - 댓글 폴링 RTK Query pollingInterval 적용
  - 기술 스택에 Redux Toolkit + RTK Query 추가
