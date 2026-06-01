# Media Platform Architecture Document v5

**Project Name:** Media Recommendation & Community Platform  
**Created:** 2024  
**Team:** AI(1), Frontend(2), Backend(1), Data/DevOps(1)  
**Development Period:** 9 weeks

---

## 📋 Table of Contents

1. [Requirements Analysis](#1-requirements-analysis)
2. [System Decomposition](#2-system-decomposition)
3. [Technology Stack](#3-technology-stack)
4. [Database Design](#4-database-design)
5. [API Endpoint Design](#5-api-endpoint-design)
6. [Data Flow Design](#6-data-flow-design)
7. [Performance Optimization Strategy](#7-performance-optimization-strategy)
8. [Security Design](#8-security-design)
9. [Frontend State Management Design](#9-frontend-state-management-design)
10. [Development Roadmap (9 weeks)](#10-development-roadmap-9-weeks)

---

## 1. Requirements Analysis

### 1-1) Detailed Functional Requirements

#### Free Board
- **Post creation:** Images, text, GIF, video (small size)
- **Comments/Replies:** Images, text, GIF support
- **Post features:** Upvote/Report
- **Comment features:** Like/Report
- **Trending posts:** Updated every 3 hours
- **Search:** Title/content-based post search, filters and sorting

#### Follow Feature
- **Follow meaning:** "This person's taste seems to match mine"
- **Applied to recommendations:** "This is a movie that OOO you follow liked"
- **Activity status:** Online/offline based on discussion room participation

#### Real-time Discussion Room
- **Creation:** Available to all users
- **Limits:** Max 10 rooms system-wide, 4 members per room
- **Chat storage:** Row-level storage in ChatMessage table, JSON export after closure

#### Media Recommendation
- **Target:** Logged-in users
- **Recommendation methods:** 
  - Phase 1 (Cold start): Genre filtering based on preference selection
  - Phase 2 (Personalization): Collaborative filtering & content-based hybrid (similar user-based)
  - Reflects followed users' preferences
- **Initial load:** Display 10~15 on screen, load 30 by default
- **Refresh:** Async recommendation recalculation via Celery on interaction
- **Filters:** Media type / Genre / Country (extensible)
- **Interactions:** Like / Dislike / Watchlist

#### AI Chat Recommendation (RAG)
- **Target:** Logged-in users
- **Method:** Natural language query → Vector search (pgvector) → LLM response generation
- **Example:** "Recommend me an action movie with some romance"
- **Data:** Vector embeddings of title, genre, description, reviews from Media table
- **UI:** Floating button (fixed) at bottom-right → Chat panel expands left on click. Accessible from any page without navigation; recommended media viewable/interactable within the chat
- **API:** Separate endpoints under `/api/rag/*`. Accessible from the same screen as the recommendation feed, but API is independent

#### My Space (Reviews)
- **Profile:** Avatar settings, profile editing
- **Relationships:** Followers/Following (linked to follow feature)
- **Reviews:** Create/Edit/Delete, visibility settings

#### Admin Features
- **Report handling:** View report list, process (approve/reject), hide content
- **User management:** Suspend/Ban

### 1-2) Priority and Real-time Levels

| Feature | Priority | Real-time Level | Technology |
|------|----------|-----------|------|
| Sign up/Login | 1 | Non-realtime | REST + JWT |
| Media Recommendation | 1 | Semi-realtime | REST + Celery async refresh |
| My Space (Reviews) | 1 | Non-realtime | REST |
| Board Post CRUD | 2 | Non-realtime | REST |
| Board Comments | 2 | Near-realtime | REST + Polling (3s) |
| Like/Report | 2 | Near-realtime | REST + Optimistic update |
| Follow | 2 | Non-realtime | REST |
| Real-time Discussion | 2 | Realtime | WebSocket |
| Trending Posts | 2 | Semi-realtime | REST + Redis cache (3h) |
| Activity Status | 3 | Realtime | WebSocket |
| AI Chat Recommendation (RAG) | 2 | Non-realtime | REST + pgvector + LLM |
| Post Search | 3 | Non-realtime | REST |
| Admin Features | 3 | Non-realtime | REST |

---

## 2. System Decomposition

### 2-1) Domain Decomposition

```
┌──────────────────────────────────────────────────────────────────┐
│                          Full System                                │
├──────────┬───────────┬───────────┬──────────┬──────────┬─────────┤
│ Auth  │ Media │ Community│ Realtime │Admin   │ AI│
├──────────┼───────────┼───────────┼──────────┼──────────┼─────────┤
│          │           │           │          │          │         │
│ • Sign up │ • Media list   │ • Board   │ • Discussion   │ • Report mgmt │ • Reco   │
│ • Login   │ • Details  │ • Comments     │ • Chat    │ • User mgmt │ • RAG   │
│ • Token mgmt │ • Reviews      │ • Replies   │ • Activity │          │ • Filtering  │
│          │ • Ratings     │ • Follow    │ • Notifications    │          │ • Moder-  │
│          │           │ • Likes    │          │         │  ation     │
│          │           │ • Reports     │          │          │         │
│          │           │ • Trending  │          │          │         │
│          │           │ • Search     │          │          │         │
└──────────┴───────────┴───────────┴──────────┴──────────┴─────────┘
```

### 2-2) Layer Decomposition

```
┌──────────────────────────────────────────────┐
│ Presentation Layer                                │
│ (React Components)                               │
├──────────────────────────────────────────────┤
│ Frontend State Management Layer                           │
│ (Redux Toolkit: Client State)                 │
│ (RTK Query: Server State Caching/Sync)                │
├──────────────────────────────────────────────┤
│ API Layer                                      │
│ (REST endpoints + WebSocket)                 │
├──────────────────────────────────────────────┤
│ Business Logic Layer                                │
│ (Recommendations, Permissions, Validation)                               │
├──────────────────────────────────────────────┤
│ Data Access Layer                                 │
│ (DB Queries, Cache)                                │
├──────────────────────────────────────────────┤
│ Storage Layer                                     │
│ (PostgreSQL, Redis)                          │
└──────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Choice | Reason |
|------|------|------|
| **Frontend** | React + TypeScript | Team decision, type safety |
| **Frontend State Mgmt** | Redux Toolkit + RTK Query | Client state (Redux Toolkit) + Server state (RTK Query) |
| **Backend** | Django + DRF | Team decision, REST API support, built-in AbstractUser |
| **Real-time** | Django Channels | WebSocket implementation |
| **Database** | PostgreSQL + pgvector | Relational, JSON support, Full-text search, vector search |
| **Cache/Queue** | Redis | Sessions, message queue, Pub/Sub |
| **Task Queue** | Celery | Async tasks (recommendation refresh, trending, embeddings) |
| **AI/LLM** | OpenAI API (or local LLM) | RAG response generation, embeddings |
| **Vector Store** | pgvector | Media vector embedding storage and similarity search |
| **File Storage** | S3 (later) or local | Profile, review images |
| **Deployment** | Docker + AWS EC2 | DevOps infrastructure |

---

## 4. Database Design

### 4-1) User Tables

```python
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Extended Django User.
    Fields provided by AbstractUser: username, email, password, 
    first_name, last_name, is_active, is_staff, date_joined, etc.
    """
    # Profile extension
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True, max_length=500)
    
    # Preference info
    favorite_genres = models.ManyToManyField('Genre', blank=True, related_name='interested_users')
    favorite_countries = models.JSONField(default=list)
    
    updated_at = models.DateTimeField(auto_now=True)

class UserActivity(models.Model):
    """User activity status"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='activity')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)
    current_chat_room = models.ForeignKey(
        'ChatRoom', null=True, blank=True, on_delete=models.SET_NULL
    )
```

### 4-2) Media Tables

```python
class Genre(models.Model):
    """Genre (M2M with Media)"""
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class Media(models.Model):
    """Movie/Anime/Drama"""
    TYPES = (('movie', 'Movie'), ('anime', 'Anime'), ('drama', 'Drama'))
    
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
    """Media review (My Space)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    media = models.ForeignKey(Media, on_delete=models.CASCADE, related_name='reviews')
    
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    content = models.TextField()
    images = models.JSONField(default=list)
    
    VISIBILITY = (
        ('public', 'Public'),
        ('followers', 'Followers only'),
        ('private', 'Private'),
    )
    visibility = models.CharField(max_length=10, choices=VISIBILITY, default='public')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'media')  # One review per user per media item

class MediaInteraction(models.Model):
    """User interactions with media (for the recommendation system)"""
    ACTIONS = (
        ('like', 'Likes'),
        ('dislike', 'Dislike'),
        ('watchlist', 'Watchlist'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactions')
    media = models.ForeignKey(Media, on_delete=models.CASCADE, related_name='interactions')
    action = models.CharField(max_length=20, choices=ACTIONS)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'media')  # One status per user per media
```

### 4-3) AI/RAG Tables

```python
class MediaEmbedding(models.Model):
    """Media vector embeddings (for RAG search)"""
    media = models.OneToOneField(Media, on_delete=models.CASCADE, related_name='embedding')
    
    # pgvector field (1536 dims = OpenAI text-embedding-3-small)
    embedding = VectorField(dimensions=1536)
    
    # Source text used for embedding (debugging)
    source_text = models.TextField()
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            # pgvector HNSW index (cosine similarity)
            HnswIndex(
                name='media_embedding_hnsw_idx',
                fields=['embedding'],
                m=16,
                ef_construction=64,
                opclasses=['vector_cosine_ops'],
            ),
        ]

class RAGConversation(models.Model):
    """RAG chat conversation history"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rag_conversations')
    
    # Conversation history (JSON: [{role: "user"|"assistant", content: "..."}])
    messages = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 4-4) Community Tables

```python
class Post(models.Model):
    """Free board post"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    media_files = models.JSONField(default=list)  # Images, GIF, video
    
    like_count = models.IntegerField(default=0)
    report_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    is_hidden = models.BooleanField(default=False)  # Admin hide flag
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Comment(models.Model):
    """Board comments (supports replies)"""
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
    """Post likes (separate model)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'post')  # One like per user per post

class CommentLike(models.Model):
    """Comment likes (separate model)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'comment')  # One like per user per comment

class Report(models.Model):
    """Reports"""
    TYPES = (
        ('spam', 'Spam'),
        ('abuse', 'Abuse/Profanity'),
        ('nsfw', 'Inappropriate content'),
        ('copyright', 'Copyright infringement'),
    )
    STATUS = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=20, choices=TYPES)
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS, default='pending')
    
    # Simple separation instead of ContentType
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
    """Follow"""
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('follower', 'following')  # Prevent duplicate follows
        constraints = [
            models.CheckConstraint(
                check=~models.Q(follower=models.F('following')),
                name='cannot_follow_self'
            )
        ]

class TrendingPost(models.Model):
    """Recent trending posts (cache, 3h intervals)"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    score = models.FloatField()
    calculated_at = models.DateTimeField(auto_now_add=True)
```

### 4-5) Real-time Discussion Room Tables

```python
class ChatRoom(models.Model):
    """Real-time discussion room (maximum 10 system-wide)"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rooms')
    
    max_members = models.IntegerField(default=4)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

class ChatRoomMember(models.Model):
    """Discussion room member"""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('room', 'user')

class ChatMessage(models.Model):
    """Discussion chat message (stored one row per message)"""
    MESSAGE_TYPES = (
        ('message', 'Message'),
        ('join', 'Join notification'),
        ('leave', 'Leave notification'),
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

## 5. API Endpoint Design

### 5-0) Common Error Response Format

All APIs follow this error response format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Message to display to user",
    "details": {
      "field_name": ["Specific error details"]
    }
  }
}
```

Error code list:

| HTTP Status | Error Code | Description |
|-----------|----------|------|
| 400 | `VALIDATION_ERROR` | Input validation failed |
| 401 | `UNAUTHORIZED` | Auth required (no/expired token) |
| 403 | `FORBIDDEN` | No permission |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate action (e.g. already liked) |
| 429 | `RATE_LIMITED` | Request rate exceeded |
| 500 | `INTERNAL_ERROR` | Internal server error |

### 5-1) Auth API

```
POST   /api/auth/register              Sign up + preference selection
POST   /api/auth/login                 Login → access + refresh token
POST   /api/auth/refresh               Refresh access token
POST   /api/auth/logout                Logout (blacklist refresh token)
```

### 5-2) User API (separated from auth)

```
GET    /api/users/me                   Current user info
PUT    /api/users/me                   Update user info
PUT    /api/users/me/avatar            Change profile picture
GET    /api/users/{id}                 User profile
GET    /api/users/{id}/followers       Follower list
GET    /api/users/{id}/following       Following list
GET    /api/users/{id}/reviews         User review list
GET    /api/users/{id}/activity        User activity status
POST   /api/users/{id}/follow          Follow
DELETE /api/users/{id}/follow          Unfollow
```

### 5-3) Media API

```
GET    /api/media                      Media list (search/filter)
  Query: ?cursor=xxx&limit=30&type=movie&genre=1,2&country=Korea

GET    /api/media/{id}                 Media detail
GET    /api/media/{id}/reviews         Review list for this media item
POST   /api/media/{id}/reviews         Reviews Create
PUT    /api/media/{id}/reviews/{rid}   Reviews Edit
DELETE /api/media/{id}/reviews/{rid}   Reviews Delete

POST   /api/media/{id}/interaction     Interaction (Like / Dislike / Watchlist)
  Body: {action: "like" | "dislike" | "watchlist"}

GET    /api/media/trending             Trending list
GET    /api/media/random               Random list
```

### 5-4) Recommendation API (separated from media)

```
GET    /api/recommendations            Personalized recommendation list
  Query: ?cursor=xxx&limit=30
  
  Response: {
    "results": [...],
    "next_cursor": "xxx",
    "algorithm": "hybrid" | "followers" | "cold_start"
  }

GET    /api/recommendations/friends    Recommendations based on followed users' preferences
```

### 5-5) AI Chat Recommendation API (RAG)

```
POST   /api/rag/chat                    Send chat message + receive AI response
  Body: {
    "message": "Recommend me an action movie with some romance.",
    "conversation_id": null | "uuid"
  }
  Response: {
    "conversation_id": "uuid",
    "response": "Sure — here are some recommendations! ...",
    "referenced_media": [
      {"id": 1, "title": "...", "similarity": 0.92},
      ...
    ]
  }

GET    /api/rag/conversations           My conversation list
GET    /api/rag/conversations/{id}      Conversation detail (with previous messages)
DELETE /api/rag/conversations/{id}      Delete conversation
```

### 5-6) Board API

```
GET    /api/posts                      Board list (cursor pagination)
  Query: ?cursor=xxx&limit=20&sort=recent|trending&search=search_term

POST   /api/posts                      Create post
GET    /api/posts/{id}                 Post detail
PUT    /api/posts/{id}                 Update post
DELETE /api/posts/{id}                 Delete post

GET    /api/posts/{id}/comments        Comment list (tree structure)
POST   /api/posts/{id}/comments        Create comment
PUT    /api/comments/{id}              Edit comment
DELETE /api/comments/{id}              Delete comment

POST   /api/posts/{id}/like            Post Likes
DELETE /api/posts/{id}/like            Remove post like
POST   /api/comments/{id}/like         Comment like
DELETE /api/comments/{id}/like         Remove comment like

POST   /api/posts/{id}/report          Report post
POST   /api/comments/{id}/report       Report comment

GET    /api/posts/trending             Trending posts (3h intervals)
```

### 5-7) Real-time Discussion Room API

```
GET    /api/chat-rooms                 Discussion room list (active only)
POST   /api/chat-rooms                 Create discussion room (maximum 10 system-wide)
GET    /api/chat-rooms/{id}            Discussion room detail
DELETE /api/chat-rooms/{id}            End discussion room

WS     /ws/chat/{room_id}              Discussion WebSocket

POST   /api/chat-rooms/{id}/join       Join discussion room
POST   /api/chat-rooms/{id}/leave      Leave discussion room
```

### 5-8) Admin API

```
GET    /api/admin/reports              Report list (filter: pending/approved/rejected)
PUT    /api/admin/reports/{id}         Process report (approve/reject)
  Body: {status: "approved" | "rejected"}
  → If approved: set content.is_hidden = True

GET    /api/admin/users                User list
PUT    /api/admin/users/{id}/ban       Ban user
```

---

## 6. Data Flow Design

### 6-1) Media Recommendation Flow

```
User (First visit - Cold start)
  │
  └─ GET /api/recommendations?limit=30
    │
    Backend (Django)
    │
    ├─ 1. Check Redis cache
    │      cache_key = "reco:user_{id}"
    │      → None (first visit)
    │
    ├─ 2. cold-start recommendations
    │      - User with selected preferences: filter by chosen genres/types + apply rating weights
    │      - User without selected preferences: random recommendations (GET /api/media/random)
    │      - Common: mixed with top 100+ trending items (GET /api/media/trending)
    │      - Categories: Explore (random) / Trending / Recommendations (personalized)
    │
    ├─ 3. Cache in Redis
    │      cache.set(key, data, timeout=None)
    │      → No TTL, Celery refreshes on interaction
    │
    └─ 4. Return response

User (clicks Like - triggers collaborative filtering)
  │
  ├─ POST /api/media/1/interaction
  │   Body: {action: "like"}
  │
  Backend
  │
  ├─ 1. Immediate UI update (frontend optimistic update)
  │
  ├─ 2. Save to DB
  │      INSERT INTO media_interactions
  │
  ├─ 3. trigger asynchronous recommendation recalculation via Celery
  │      refresh_user_recommendations.delay(user_id)
  │
  └─ 4. Celery worker
         ├─ Calculate similar users (same reactions to same media)
         ├─ reflect recent likes from followed users
         ├─ generate a new recommendation list
         └─ Redis cache refresh
              cache.set("reco:user_{id}", new_recommendations)
```

### 6-2) Board Comment Flow

```
User A (Create comment)
  │
  ├─ POST /api/posts/1/comments
  │
  Frontend (React)
  │
  ├─ 1. Immediately display comment in the UI (optimistic update)
  │
  └─ 2. Backend request
    
  Backend
  │
  ├─ 1. Save to DB
  │      INSERT INTO comments
  │
  ├─ 2. Return response
  │
  └─ 3. Invalidate comment cache
         cache.delete("post_comments:{post_id}")

User B (viewing same post)
  │
  ├─ Receive new comments via 3-second polling
  │
  └─ Auto-update UI
```

### 6-3) Real-time Discussion Room Flow

```
User A (Discussion Generation)
  │
  ├─ POST /api/chat-rooms
  │   → Check whether fewer than 10 active discussion rooms exist system-wide
  │
  Backend
  │
  ├─ 1. Save ChatRoom to DB
  │
  └─ 2. Provide WebSocket URL

Users A, B, C, D (join)
  │
  ├─ POST /api/chat-rooms/{id}/join
  │   → Check if current members < 4
  │
  ├─ WS /ws/chat/{room_id} connect
  │
  Backend (Django Channels)
  │
  ├─ 1. Accept connection + JWT auth check
  │
  ├─ 2. Join Redis channel
  │
  ├─ 3. ChatMessage Storage (type: "join")
  │
  └─ 4. Broadcast join message

User A (sends message)
  │
  ├─ Send WS Message
  │
  Backend
  │
  ├─ 1. Save row to ChatMessage table
  │
  ├─ 2. Broadcast to all members
  │
  └─ 3. Immediately display on other members' screens

When ending the discussion room
  │
  ├─ DELETE /api/chat-rooms/{id}
  │
  Backend
  │
  ├─ 1. Set is_active = False, record ended_at
  │
  └─ 2. (Optional) Export ChatMessage → JSON via Celery
```

### 6-4) AI Chat Recommendation (RAG) Flow

```
[Initial Setup - Media Embedding Pipeline]

Celery Beat (daily at dawn)
  │
  ├─ Query newly added/updated media from Media table
  │
  ├─ Generate text for each media
  │      text = f"{title} | {genres} | {country} | {description}"
  │      + add top review text for that media item
  │
  ├─ Call embedding API
  │      embedding = openai.embeddings.create(text, model="text-embedding-3-small")
  │
  └─ Save to MediaEmbedding table (pgvector)
         INSERT INTO media_embeddings (media_id, embedding, source_text)
         ON CONFLICT (media_id) DO UPDATE

[On User Query - RAG Pipeline]

User
  │
  ├─ POST /api/rag/chat
  │   Body: {message: "Recommend me a thriller movie with a plot twist."}
  │
  Backend (Django)
  │
  ├─ 1. Embed user query
  │      query_embedding = embed(message)
  │
  ├─ 2. pgvector similarity search (top-K)
  │      SELECT m.*, me.embedding <=> query_embedding AS distance
  │      FROM media_embeddings me
  │      JOIN media m ON m.id = me.media_id
  │      ORDER BY distance
  │      LIMIT 5
  │
  ├─ 3. Build context
  │      context = titles, genres, descriptions, and ratings of the 5 retrieved media items
  │      + User's previous conversation history (RAGConversation.messages)
  │      + User's preference info (User.favorite_genres)
  │
  ├─ 4. Generate LLM response
  │      prompt = system_prompt + context + user_message
  │      response = llm.chat(prompt)
  │
  ├─ 5. Save conversation history
  │      RAGConversation.messages.append([
  │          {role: "user", content: message},
  │          {role: "assistant", content: response}
  │      ])
  │
  └─ 6. Return response
         {
           response: "For thriller movies with plot twists...",
           referenced_media: [{id, title, similarity}, ...],
           conversation_id: "uuid"
         }
```

---

## 7. Performance Optimization Strategy

### 7-1) Redis Caching Plan

| Cache Key | TTL | Refresh Method |
|---------|-----|---------|
| reco:user_{id} | None | Celery async refresh on interaction |
| trending_posts | 3h | Celery Beat (periodic) |
| user_profile:{user_id} | 24h | Invalidate on profile update |
| media_reviews:{media_id} | 1h | Invalidate when a new review is added |
| post_comments:{post_id} | 5m | Invalidate when a new comment is added |
| user_followers:{user_id} | 24h | Invalidate when follow relationships change |
| online_status | Session | Refresh on WebSocket active |
| rag_response:{query_hash} | 1h | Cache identical queries (optional) |

### 7-2) Database Indexes

```python
# ===== Single Indexes =====
# Django auto-creates indexes for FK fields

# ===== Composite Indexes =====
# 
# What is a composite index?
# Combining two or more columns into a single index.
# When columns frequently used together in WHERE + ORDER BY are combined,
# The DB can handle filtering and sorting together using the index.
#
# Ex: With (genre_id, avg_rating DESC) composite index,
#     WHERE genre_id = 1 ORDER BY avg_rating DESC
#     → A single index can handle filtering and sorting at the same time (Index Only Scan).
#
#     If only a single index on (genre_id) exists
#     → the DB filters by genre_id and then sorts the result again by avg_rating (extra cost).

class Media(models.Model):
    class Meta:
        indexes = [
            # Recommendation query: by genre + rating order
            # → WHERE genre_id IN (...) ORDER BY avg_rating DESC
            models.Index(fields=['media_type', '-avg_rating']),
        ]

# Genre-Media M2M: Django auto-creates junction table + indexes

class Post(models.Model):
    class Meta:
        indexes = [
            # Board newest first: ORDER BY created_at DESC
            models.Index(fields=['-created_at']),
            # Popular: ORDER BY like_count DESC
            models.Index(fields=['-like_count']),
        ]

class Comment(models.Model):
    class Meta:
        indexes = [
            # Comments for a specific post in chronological order
            # → WHERE post_id = ? ORDER BY created_at
            models.Index(fields=['post_id', 'created_at']),
        ]

class MediaInteraction(models.Model):
    class Meta:
        indexes = [
            # All interactions for a specific user (for recommendation calculation)
            # → WHERE user_id = ? 
            models.Index(fields=['user_id', 'action']),
            # All interactions for media (for popularity calculation)
            # → WHERE media_id = ? GROUP BY action
            models.Index(fields=['media_id', 'action']),
        ]

class Follow(models.Model):
    class Meta:
        indexes = [
            # List of users followed by a specific user
            models.Index(fields=['follower_id']),
            # List of users following a specific user
            models.Index(fields=['following_id']),
        ]

class ChatMessage(models.Model):
    class Meta:
        indexes = [
            # Messages for specific room in time order
            # → WHERE room_id = ? ORDER BY created_at
            models.Index(fields=['room_id', 'created_at']),
        ]

class Report(models.Model):
    class Meta:
        indexes = [
            # Admin: list of pending reports
            # → WHERE status = 'pending' ORDER BY created_at
            models.Index(fields=['status', 'created_at']),
        ]
```

### 7-3) Celery Background Tasks

```python
# tasks.py

@shared_task
def refresh_user_recommendations(user_id: int):
    """
    Asynchronously recalculate recommendations after user interaction.
    1. Calculate similar users (collaborative filtering)
    2. Reflect preferences of followed users
    3. Store the new recommendation list in Redis
    """
    recommendations = RecommendationService.calculate(user_id)
    cache.set(f"reco:user_{user_id}", recommendations)

@shared_task
def refresh_media_embeddings():
    """
    Refresh vector embeddings for newly added or updated media.
    1. Query media without embeddings or where Media.updated_at > Embedding.updated_at
    2. Build text from title + genres + description + top reviews
    3. Call embedding API
    4. Upsert MediaEmbedding
    """
    EmbeddingService.refresh_outdated_embeddings()

@shared_task
def refresh_trending_posts():
    """Refresh trending posts every 3 hours"""
    TrendingService.calculate_trending_posts()

@shared_task
def export_chat_history(room_id: int):
    """Export chat logs to JSON after ending the discussion room"""
    ChatService.export_to_json(room_id)

@shared_task
def cleanup_expired_sessions():
    """Cleanup expired sessions/blacklisted tokens"""
    TokenBlacklist.objects.filter(expires_at__lt=timezone.now()).delete()

# Celery Beat schedule
CELERY_BEAT_SCHEDULE = {
    'refresh-trending': {
        'task': 'tasks.refresh_trending_posts',
        'schedule': crontab(minute=0, hour='*/3'),  # every 3 hours
    },
    'refresh-embeddings': {
        'task': 'tasks.refresh_media_embeddings',
        'schedule': crontab(minute=0, hour=3),  # Daily at 3 AM
    },
    'cleanup-sessions': {
        'task': 'tasks.cleanup_expired_sessions',
        'schedule': crontab(minute=0, hour=4),  # Daily at 4 AM
    },
}
```

### 7-4) Pagination

```python
# Example of cursor-based pagination (DRF)
#
# Problem with offset approach:
#   GET /api/posts?offset=0&limit=10  → posts 1-10
#   (a new post is added)
#   GET /api/posts?offset=10&limit=10 → post 10 appears again (duplicate!)
#
# Cursor approach:
#   GET /api/posts?limit=10           → posts 1-10, next_cursor="post_10_id"
#   (a new post is added)
#   GET /api/posts?cursor=post_10_id&limit=10 → posts 11-20 (no duplicates)

# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.CursorPagination',
    'PAGE_SIZE': 20,
}

# views.py (custom cursor)
class PostCursorPagination(CursorPagination):
    page_size = 20
    ordering = '-created_at'
    cursor_query_param = 'cursor'
```

---

## 8. Security Design

### 8-1) JWT Authentication

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,           # issue a new refresh token on refresh
    'BLACKLIST_AFTER_ROTATION': True,         # blacklist the previous refresh token
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Refresh Token: httpOnly Cookie (prevents XSS)
# Access Token: Memory only (never localStorage)
```

### 8-2) File Upload Limits

```python
# Allowed extensions
ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']
ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm']

# Size limits
MAX_IMAGE_SIZE = 5 * 1024 * 1024    # 5MB
MAX_VIDEO_SIZE = 20 * 1024 * 1024   # 20MB
MAX_FILES_PER_POST = 5              # Max 5 per post

# Server level
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
        'auth': '5/minute',    # Limit login attempts
    }
}
```

---

## 9. Frontend State Management Design

### 9-1) State Classification

```
┌─────────────────────────────────────────────────────────┐
│                  React App State Structure                        │
├─────────────────────────┬───────────────────────────────┤
│   Client State           │     Server State                   │
│   (Redux Toolkit)       │     (RTK Query)               │
├─────────────────────────┼───────────────────────────────┤
│                         │                               │
│ • Current logged-in user info      │ • Media list/detail                │
│ • JWT token (memory)        │ • Recommendation feed                     │
│ • UI state (modal, sidebar)   │ • Board posts/comments                 │
│ • Theme/language settings            │ • User profile                   │
│ • Discussion WebSocket State    │ • Follower/following list              │
│ • RAG chat input state       │ • Discussion room list                    │
│                         │ • Review list                     │
│                         │ • RAG conversation history                 │
│                         │ • Admin report list                │
│                         │ • Trending posts                     │
└─────────────────────────┴───────────────────────────────┘
```

### 9-2) Redux Toolkit Store Structure

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    // Client State (Redux Toolkit Slices)
    auth: authReducer,       // Login User, JWT token
    ui: uiReducer,           // Modal, sidebar, theme, language
    chat: chatReducer,       // WebSocket connect State, Discussion Real-time messages

    // Server State (RTK Query)
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
```

### 9-3) Client State Slices

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
// WebSocket messages in separate slice, not RTK Query cache
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    connected: false,
    currentRoomId: null as number | null,
    messages: [] as ChatMessage[],   // Realtime message buffer
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

### 9-4) RTK Query API Definition

```typescript
// store/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    // Auto-inject JWT token from Redux store
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Auto-refresh on 401
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    const refreshResult = await baseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions);
    if (refreshResult.data) {
      api.dispatch(setCredentials(refreshResult.data));
      result = await baseQuery(args, api, extraOptions);  // Retry original request
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
  endpoints: () => ({}),  // injectEndpoints from each domain file
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
      // Optimistic update: Immediate UI before server response
      async onQueryStarted({ mediaId, action }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          mediaApi.util.updateQueryData('getMediaDetail', mediaId, (draft) => {
            draft.user_interaction = action;
          })
        );
        try { await queryFulfilled; } catch { patchResult.undo(); }
      },
      invalidatesTags: ['Recommendations'],  // Invalidate recommendation cache after interactions
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
      // optimistic update: Immediately increase the like count
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

### 9-5) State Management Strategy Summary

| Data | Management | Reason |
|--------|----------|------|
| JWT token | authSlice (Redux Toolkit) | Memory-only, accessed from multiple components |
| Logged-in user info | authSlice (Redux Toolkit) | Needed globally; no server sync required |
| UI state (modal, theme, language) | uiSlice (Redux Toolkit) | Pure client state |
| WebSocket Chat Message | chatSlice (Redux Toolkit) | Real-time stream; different in nature from REST cache |
| Media/Board/Reco Data | RTK Query | Server data caching + automatic refetching |
| Likes/Interaction | RTK Query (optimistic update) | Immediate UI update + rollback on failure |
| RAG conversations | RTK Query (mutation) | Needs server-side persistence + conversation list caching |
| Follow/Profile | RTK Query | Server data; automatically refresh via tag invalidation |
| Comments (3-second polling) | RTK Query (pollingInterval) | `pollingInterval: 3000` Automatic polling via settings |

---

## 10. Development Roadmap (9 weeks)

### Phase 1: Foundation (Week 1~2)

#### WEEK 1: Infrastructure + Auth

**Data/DevOps:**
- Docker Compose setup (Django + PostgreSQL + Redis)
- DB migration scripts
- Redis setup
- CI/CD initial setup (GitHub Actions)

**Backend:**
- Django project structure (app separation: auth, users, media, community, chat)
- AbstractUser model + JWT auth implementation
- Sign up/Login/Logout API
- Common error response middleware

**Frontend:**
- Dev environment setup (React + TypeScript)
- Redux Toolkit + RTK Query store setup
  - authSlice, uiSlice initial implementation
  - apiSlice baseQuery + auto reauth middleware
- Login/sign-up screen
- JWT token management (managed in authSlice, auto-refresh interceptor)
- Common components start (Layout, Header, ErrorBoundary)

**AI:**
- Analyze recommendation algorithms and research datasets
- Cold start logic design
- RAG system architecture design (embedding model selection, pgvector testing)

#### WEEK 2: Media + Recommendation Basics

**Data/DevOps:**
- Load media data (initial seed data)
- Implement Redis caching strategy
- Monitoring setup (basic)

**Backend:**
- Media, Genre models + API implementation
- cold-start recommendations API (genre-based)
- MediaInteraction API
- File upload API (images)

**Frontend:**
- RTK Query: mediaApi, recommendationApi endpoint definition
- Media list/detail screens (RTK Query caching + infinite scroll)
- Preference selection onboarding screen
- Recommendation feed screen (cache management using RTK Query providesTags)
- Media interaction UI (optimistic update: onQueryStarted)

**AI:**
- cold-start recommendations Logic Implementation
- Collaborative filtering prototype
- Implement media embedding pipeline (seed data embeddings)

---

### Phase 2: Core Features (Week 3~5)

#### WEEK 3: My Space + Reviews

**Backend:**
- Review CRUD API
- User profile API (/api/users/*)
- Public visibility filtering logic

**Frontend:**
- My Space screen (Profile, Review list)
- Review create/edit/delete screens
- Profile edit screen
- Other user profile query screen

**AI:**
- Collaborative filtering implementation (similar user calculation)
- Celery Integrate asynchronous recommendation refresh

**Data/DevOps:**
- Celery + Celery Beat setup
- Reco Cache Refresh pipeline

#### WEEK 4: Board Default

**Backend:**
- Post CRUD API
- Comment API (including replies)
- PostLike, CommentLike API
- Apply cursor pagination

**Frontend:**
- Board list screen (infinite scroll, Sort)
- Create post/detail/edit screens
- Comments/replies UI (tree structure)
- Likes optimistic update

**Data/DevOps:**
- DB index optimization
- Query performance monitoring

#### WEEK 5: Board expansion + Follow + RAG

**Backend:**
- Reports API
- Follow/Unfollow API
- Post Search API (PostgreSQL full-text search)
- Trending posts Logic (Celery Beat)
- RAG API endpoint implementation (/api/rag/chat, conversations)

**Frontend:**
- Report modal UI
- Follow/Unfollow UI
- Search screen (filter, sort)
- Trending posts section
- AI chat recommendation UI (conversational interface)

**AI:**
- Add follow-based recommendation logic
- Tune recommendation algorithms
- Complete the RAG pipeline (search + generate LLM response)
- Prompt engineering (system prompt, build context)

**Data/DevOps:**
- pgvector index performance tuning
- Embedding refresh Celery Beat setup

---

### Phase 3: Realtime + Admin (Week 6~7)

#### WEEK 6: Realtime Discussion

**Data/DevOps:**
- Django Channels setup
- Redis Channel Layer configuration
- WebSocket infrastructure setup

**Backend:**
- ChatRoom CRUD API
- ChatMessage model + WebSocket Consumer
- Join/leave logic (member count limit)
- Logic for 10 discussion room limit

**Frontend:**
- Discussion room list screen
- Chat UI (Real-time messages)
- WebSocket client (connect/reconnect/error handling)
- Activity status display

#### WEEK 7: Admin + Security + AI Moderation

**Backend:**
- Admin API (Reports Processing, Suspend user)
- Apply rate limiting
- Strengthen file upload validation
- Integrate content moderation middleware

**Frontend:**
- Admin dashboard (Reports list, Processing, Display AI judgment)
- Notifications System (Default)

**AI:**
- Implement content moderation AI (auto-detect profanity/spam)
- RAG response quality tuning + edge case handling

**Data/DevOps:**
- Security audit
- Build logging system

---

### Phase 4: Completion + Deployment (Week 8~9)

#### WEEK 8: Integration Testing + Optimization

**Entire team:**
- Integration testing (by scenario)
- Cross-browser testing
- Performance optimization (N+1 queries, cache hit rate)
- Bug fixes

**Data/DevOps:**
- Performance monitoring dashboard
- Cache optimization
- Staging environment setup

#### WEEK 9: Deployment + Documentation

**Entire team:**
- Production deployment
- Write README.md (module descriptions, role assignments)
- API documentation
- Presentation preparation
- Final bug fixes

**Data/DevOps:**
- Production infrastructure setup
- SSL certificates
- Backup strategy setup
- Health check + monitoring

---

## ✅ Team Meeting Checklist

### Data Schema Review
- [ ] Agree on AbstractUser-based User model
- [ ] Confirm Genre M2M relationship
- [ ] Review unique_together constraints
- [ ] Agree on ChatMessage table structure
- [ ] Confirm index strategy

### API Endpoint Review
- [ ] Agree on error response format
- [ ] Agree on the cursor pagination approach
- [ ] Auth method (JWT access/refresh flow)
- [ ] Request/response format per endpoint

### Final Real-time Level Decisions
- [ ] WebSocket: Discussion, Activity
- [ ] Polling: comments (3 seconds)
- [ ] Celery async: recommendation refresh, embedding refresh

### RAG System
- [ ] Select embedding model (OpenAI vs Sentence-Transformers)
- [ ] Select LLM API (OpenAI vs local model)
- [ ] pgvector installation and index strategy
- [ ] Agree on prompt template
- [ ] API key management (.env)

### File Upload Strategy
- [ ] Local → S3 transition timing
- [ ] File size limits (images 5MB, video 20MB)
- [ ] Allowed extension list

### Dev Environment Setup
- [ ] Git repository structure (monorepo vs separate)
- [ ] Branch strategy (main, dev, feature/*)
- [ ] CI/CD setup (GitHub Actions)

### Schedule Confirmation
- [ ] Confirm assignees per week
- [ ] Set milestones per phase
- [ ] Weekly review schedule (every Monday?)

---

## 📞 Collaboration

### Data/DevOps Role
1. **Infrastructure:** Docker, Docker Compose, AWS setup
2. **Database:** migration, index optimization, seed data
3. **Caching:** Redis strategy, Celery setup
4. **Performance:** Monitoring, bottleneck analysis
5. **Deployment:** CI/CD, automation, health check

### Backend Developer Role
1. **API:** REST endpoint implementation + error handling
2. **Business Logic:** Recommendation integration, Filtering, Permission Validation
3. **DB Queries:** ORM usage + N+1 prevention
4. **Realtime:** WebSocket Consumer implementation

### Frontend x2 Role
1. **UI Components:** Page screens
2. **State Management:** Redux Toolkit (client) + RTK Query (server) separate operation
3. **API Communication:** RTK Query endpoint definition, optimistic updates, tag invalidation
4. **Optimization:** Rendering performance, code splitting, RTK Query cache strategy

### AI Role
1. **Cold start:** initial genre-based recommendations
2. **Collaborative filtering:** similar user calculation + recommendations
3. **Follow integration:** social-graph-based recommendations
4. **RAG System:** Media Embedding, Vector Search, LLM Prompt engineering
5. **Content Moderation:** Auto-detect profanity/spam model
6. **Continuous improvement:** Monitor recommendation accuracy + RAG response quality

---

## 📚 References

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

**Author:** Seonghyeon Kim  
**Last Modified:** April 13, 2026  
**Version:** v5 (Redux Toolkit + RTK Query state management added)

### Changelog
- v1 → v2: Initial design
- v2 → v3: DB design improvement, API restructuring, security, roadmap extended to 9 weeks
- v3 → v4: RAG system, Content moderation AI, pgvector introduction
- v4 → v5:
  - Frontend state management design section added (Section 9)
  - Redux Toolkit: authSlice, uiSlice, chatSlice design
  - RTK Query: apiSlice + domain-specific endpoints (media, post, recommendation, rag)
  - Optimistic update strategy (likes, interactions)
  - Auto JWT refresh (baseQueryWithReauth)
  - WebSocket messages separated into chatSlice (not mixed with RTK Query)
  - Apply RTK Query pollingInterval for comment polling
  - Redux Toolkit + RTK Query added to tech stack
