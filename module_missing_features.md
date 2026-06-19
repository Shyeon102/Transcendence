# Missing Features from module_used_v3_en.md

This file summarizes the features described in `module_used_v3_en.md` that are not currently implemented in this repository.

## Present / partially implemented
- Django + DRF backend with core app structure
- WebSocket chat with Django Channels and Redis
- JWT auth endpoints under `/api/auth/`
- User profile PATCH/update
- Frontend language support for `ko`, `en`, `fr`
- Frontend OAuth UI and 42 OAuth redirect flow stubs
- Frontend avatar preview / profile edit UI
- Health check endpoint at `/health/`
- Follow model exists in backend schema

## Missing or not implemented
### Recommendation system
- No backend recommendation endpoints or controllers
- No collaborative filtering / recommendation service logic
- No Celery recommendation refresh task implementation

### RAG system
- No pgvector / vector embedding models or tables
- No OpenAI / embedding / LLM integration code
- No `/api/rag/*` endpoints or frontend RAG interface

### Public API docs and throttling
- No Swagger/ReDoc or DRF schema documentation setup
- No DRF rate limiting / throttle configuration
- No API key authentication mechanism

### OAuth 2.0 backend
- No `django-allauth` or `social-auth-app-django` integration
- No social auth backend configuration in settings
- Backend OAuth routes are missing

### File upload and management
- Avatar upload is handled as a URL / preview only
- No actual file upload endpoint or server-side storage handling
- No board/comment attachment or review image upload support

### Advanced analytics dashboard
- No frontend analytics/dashboard pages or components
- No backend aggregation APIs for charts or exports

### Search and filtering
- No PostgreSQL full-text search implementation
- No advanced media/board filtering or search-by-keyword logic

### Content moderation AI
- No profanity/spam/inappropriate content detection code
- No moderation pipeline or admin report support for AI moderation

### Backup and disaster recovery
- Health endpoint exists, but no documented pg_dump/cron backup automation

## Notes
This is a working reminder file. Use it to track implementation priorities and cross-check against the module requirements in `module_used_v3_en.md`.
