# Module Used

**Project:** Media Recommendation & Community Platform  
**Required:** 14 pts | **Target:** 21 pts (14 pts required + 5 pts bonus cap = 19 pts recognized)

---

## Score Summary

| Category | Major (2pt) | Minor (1pt) | Subtotal |
|----------|-------------|-------------|----------|
| Web | 4 | 4 | 12 pts |
| User Management | 1 | 1 | 3 pts |
| Accessibility & i18n | - | 1 | 1 pt |
| Artificial Intelligence | 2 | 1 | 5 pts |
| DevOps | - | 1 | 1 pt |
| Data & Analytics | 1 | - | 2 pts |
| **Total** | **8 (16pt)** | **5 (5pt)** | **21 pts** |

---

## Web

### Major: Frontend + Backend Framework (2pt)

- **Tech:** React + TypeScript + Redux Toolkit + RTK Query (Frontend) / Django + DRF (Backend)
- **Scope:** Entire system
- **Description:** React SPA for the frontend, Django REST Framework for all API server endpoints. TypeScript ensures frontend type safety, while DRF's Serializer/ViewSet pattern structures the REST API.
- **Frontend State Management:**
  - **Redux Toolkit (Client State):** Manages logged-in user/JWT token (authSlice), UI state (uiSlice), and WebSocket chat messages (chatSlice).
  - **RTK Query (Server State):** Handles caching, auto-refetching, and optimistic updates for all server data including media, board, recommendations, RAG, and user profiles. Uses `invalidatesTags` for automatic recommendation cache invalidation on interaction, and `pollingInterval` for 3-second comment polling.
  - **Separation Criteria:** REST API data → RTK Query, WebSocket realtime data → chatSlice, Pure UI state → uiSlice

### Major: Real-time features (WebSocket) (2pt)

- **Tech:** Django Channels + Redis Channel Layer
- **Scope:** Real-time discussion rooms, activity status
- **Description:** Up to 4 users participate in real-time chat via WebSocket in discussion rooms. Join/leave/message events are instantly broadcast to all participants. User online/offline activity status is also updated in real-time via WebSocket. Handles reconnection logic and graceful disconnect.

### Major: User interaction (2pt)

- **Scope:** Discussion room chat, profiles, follow
- **Description:** Implements user-to-user chat system in real-time discussion rooms. All users have a profile page displaying avatar, bio, preferences, and review list. Follow/unfollow functionality enables user relationships with follower/following lists. Online status of followed users is visible.

### Major: Public API (2pt)

- **Scope:** All API endpoints
- **Description:** Public API with API key authentication, rate limiting (DRF throttling), and Swagger/ReDoc documentation. Includes GET/POST/PUT/DELETE methods across 5+ endpoint groups: media, recommendations, board CRUD, user management, and discussion rooms.
- **Endpoint Groups:**
  - `/api/auth/*` — Auth (POST register/login/logout/refresh)
  - `/api/users/*` — User profiles, follow (GET/PUT/POST/DELETE)
  - `/api/media/*` — Media list, detail, interactions (GET/POST)
  - `/api/posts/*` — Board CRUD, comments, likes (GET/POST/PUT/DELETE)
  - `/api/chat-rooms/*` — Discussion room management (GET/POST/DELETE)

### Minor: ORM (Django ORM) (1pt)

- **Tech:** Django ORM
- **Scope:** Entire backend data access layer
- **Description:** All database access handled through Django ORM. Includes AbstractUser inheritance, ManyToManyField, ForeignKey relationships, unique_together/CheckConstraint constraints, and composite index configuration at the ORM level.

### Minor: Custom design system (1pt)

- **Scope:** Frontend entire UI
- **Description:** Build a custom design system with 10+ reusable UI components. Unified color palette, typography, and icon set applied throughout.
- **Components:** Button, Input, Modal, Card, Avatar, Badge, Toast, Dropdown, Tabs, Pagination, MediaCard, CommentTree, SearchBar, etc.

### Minor: Advanced search (1pt)

- **Scope:** Board search, media filtering
- **Description:** Title/content-based post search using PostgreSQL Full-text search. Media list supports genre, type (movie/drama/anime), and country filters with rating/newest sorting. All lists use cursor-based pagination.

### Minor: File upload & management (1pt)

- **Scope:** Board post/comment attachments, profile avatars, review images
- **Description:** Supports image (jpg, png, gif, webp) and video (mp4, webm) uploads. Client/server-side validation for file type, size (images 5MB, video 20MB), and extension. Provides upload progress indicators, file preview, and deletion. Initially local storage, designed for S3 transition.

---

## User Management

### Major: Standard user management & authentication (2pt)

- **Scope:** Registration/login, profiles, follow
- **Description:** User management built on Django AbstractUser. JWT authentication (access + refresh token). Users can update profile info, upload avatars (default avatar provided), form relationships via follow/following, and check online status. Profile page displays user info, reviews, and follower/following lists.

### Minor: OAuth 2.0 (1pt)

- **Tech:** django-allauth or social-auth-app-django
- **Scope:** Registration/login screens
- **Description:** Implements social login via Google, GitHub, or 42. Runs alongside existing email/password authentication as a user-selectable option.

---

## Accessibility and Internationalization

### Minor: Multiple languages (i18n) (1pt)

- **Tech:** react-i18next (Frontend) / Django i18n (Backend)
- **Scope:** All UI text, API error messages
- **Description:** Supports 3 languages: Korean, English, and French. All user-facing text managed through translation files with a language switcher in the UI. API error messages respond in the appropriate language based on Accept-Language header.

---

## Artificial Intelligence

### Major: Recommendation system (ML) (2pt)

- **Tech:** scikit-learn (collaborative filtering), Celery (async computation)
- **Scope:** Media recommendation feed, follow-based recommendations
- **Description:** Implements a 2-phase recommendation system.
  - **Phase 1 (Cold start):** Generates initial recommendation list based on new user's selected preferences (genre, media type) with genre filtering + rating weight, or category selection: Explore (random), Trending (Top 100+), Recommended (random if no preferences selected).
  - **Phase 2 (Personalization):** Calculates similar users based on like/dislike/watchlist interaction data (collaborative filtering), combined with content-based filtering, and reflects followed users' recent preferences for personalized recommendations.
  - Recommendations are recalculated asynchronously via Celery tasks on interaction and cached in Redis.
  - Recommendation accuracy continuously improves as interaction data accumulates over time.

### Major: RAG (Retrieval-Augmented Generation) system (2pt)

- **Tech:** pgvector (PostgreSQL vector search), OpenAI Embeddings API (or Sentence-Transformers), LLM API
- **Scope:** Chat-based media recommendation interface
- **Description:** Implements an interactive recommendation system where users ask natural language questions and the AI responds with recommendations and function execution.
  - **Data preparation:** Vector embeddings of Media table's title, genre, description, and review text stored in pgvector.
  - **Retrieval:** User query is embedded and similar media are retrieved via pgvector similarity search.
  - **Generation:** Retrieved media info is passed as context to the LLM, which generates natural language responses including recommendation reasons and function execution.
  - **Example queries:** "Recommend me a Netflix thriller", "Any Ghibli-style anime?", "Something with action and a bit of romance?"
  - **UI:** Floating button (fixed) at bottom-right → Expands into a chat panel sliding left on click. Accessible from any page without navigation, allowing users to view and interact with recommended media directly within the chat. API separated under `/api/rag/*`

### Minor: Content moderation AI (1pt)

- **Tech:** Pre-trained text classification model or rule-based filtering
- **Scope:** Board posts/comments, discussion room chat, report system
- **Description:** Auto-detects profanity/spam/inappropriate content in posts, comments, and chat messages. Detected content is automatically hidden or triggers a warning to the author. AI judgment results are provided as reference info during admin report processing.

---

## DevOps

### Minor: Health check & backup (1pt)

- **Tech:** Django health-check, pg_dump, cron
- **Scope:** Server infrastructure, database
- **Description:** Provides a status page via `/health` endpoint monitoring Django server, PostgreSQL, Redis, and Celery worker health in real-time. PostgreSQL daily automatic backup (pg_dump) with documented disaster recovery procedures.

---

## Data and Analytics

### Major: Advanced analytics dashboard (2pt)

- **Tech:** Chart.js or Recharts (Frontend), DRF aggregate API (Backend)
- **Scope:** Admin dashboard, user activity analysis
- **Description:** Implements an admin analytics dashboard.
  - **Charts:** Interactive charts including daily/weekly/monthly user registration trends (line), media category interaction distribution (pie/bar), board activity volume (bar), top 10 popular media (bar).
  - **Real-time:** Current connected users and active discussion room counts updated in real-time via WebSocket or polling.
  - **Export:** Dashboard data exportable in PDF and CSV formats.
  - **Filters:** Filter data by date range, media type, genre, etc.

---

## Module Assignments

| Module | Primary | Support |
|--------|---------|---------|
| Frontend + Backend Framework | Frontend x2 / Backend | - |
| WebSocket Realtime | Backend + Data/DevOps | Frontend |
| User interaction | Frontend x2 | Backend |
| Public API | Backend | Data/DevOps |
| ORM | Backend | - |
| Custom design system | Frontend x2 | - |
| Advanced search | Backend + Frontend | - |
| File upload | Backend + Frontend | Data/DevOps |
| User management & auth | Backend | Frontend |
| OAuth 2.0 | Backend | Frontend |
| i18n (multilingual) | Frontend x2 | Backend |
| ML Recommendation | AI | Backend |
| RAG System | AI | Backend + Data/DevOps |
| Content moderation AI | AI | Backend |
| Health check & backup | Data/DevOps | - |
| Analytics dashboard | Frontend + Backend | Data/DevOps |
