# WebSocket & Channel System Implementation Guide

**Project**: Transcendence - Forum/Private Channel System  
**Date**: May 23, 2026  
**Status**: Planning Phase

---

## 📋 Table of Contents

1. [Current Architecture Assessment](#current-architecture-assessment)
2. [What's Already Good](#whats-already-good)
3. [What's Missing](#whats-missing)
4. [Docker Network Architecture](#docker-network-architecture)
5. [Implementation Phases (1-6)](#implementation-phases)
6. [Frontend WebSocket Configuration](#frontend-websocket-configuration)
7. [Data Flow Diagram](#data-flow-diagram)
8. [What Frontend Handles vs Backend](#what-frontend-handles-vs-backend)
9. [Checklist for Getting Started](#checklist-for-getting-started)

---

## Current Architecture Assessment

### Technology Stack Overview
- **Backend**: Django 4.2+ with Django Channels
- **Frontend**: React 19.2 + Redux Toolkit + Vite
- **Database**: PostgreSQL (pgvector)
- **Message Broker**: Redis (already in docker-compose.yml)
- **Container Orchestration**: Docker Compose

### Existing Models (Chat App)
```
ChatRoom
├── title (CharField)
├── description (TextField)
├── created_by (ForeignKey to User)
├── max_members (IntegerField, default=4)
├── is_active (BooleanField)
├── created_at (DateTimeField)
└── ended_at (DateTimeField, nullable)

ChatRoomMember
├── room (ForeignKey to ChatRoom)
├── user (ForeignKey to User)
├── joined_at (DateTimeField)
└── unique_together: (room, user)

ChatMessage
├── room (ForeignKey to ChatRoom)
├── user (ForeignKey to User)
├── content (TextField)
├── message_type (CharField: 'message', 'join', 'leave')
├── created_at (DateTimeField)
└── indexes: [room, created_at]
```

---

## ✅ What's Already Good

1. **Models Structure** ✅
   - `ChatRoom`, `ChatRoomMember`, `ChatMessage` are well-designed
   - Proper relationships and constraints
   - Good indexing strategy for performance

2. **Dependencies** ✅
   - `channels` already in `requirements.txt`
   - `redis` service in `docker-compose.yml`
   - PostgreSQL ready for persistence

3. **WebSocket Routing** ✅
   - Basic routing exists in `apps/chat/routing.py`
   - Consumer stub exists in `apps/chat/consumers.py`

4. **Frontend Infrastructure** ✅
   - Redux store with API middleware (`apiSlice.ts`)
   - JWT token management (`authSlice.ts`)
   - Environment variable setup (`.env` files)
   - TypeScript + React Router configured

5. **Docker Setup** ✅
   - Proper service dependencies
   - Health checks configured
   - Volume management set up

---

## ❌ What's Missing

### Backend Missing Components

1. **ASGI Configuration**
   - `project/asgi.py` needs `ProtocolTypeRouter`
   - Need to route WebSocket and HTTP to appropriate handlers
   - `ASGI_APPLICATION` not set in settings

2. **Channel Layer Configuration**
   - `CHANNEL_LAYERS` not configured in settings
   - Redis connection string needed for broadcasting
   - Need `channels-redis` in requirements

3. **Consumer Implementation**
   - Only has `async def connect()`
   - Missing: `disconnect()`, `receive()`, `chat_message()`
   - No room subscription logic
   - No authentication/permission validation
   - No message persistence
   - No group management

4. **ASGI Server**
   - Backend uses `runserver` (dev only)
   - Need `daphne` for production WebSocket support
   - Docker CMD needs to run `daphne` instead of `runserver`

5. **API Endpoints** (for REST operations)
   - Need CRUD for chat rooms
   - Need message history endpoint
   - Need member management endpoints

### Frontend Missing Components

1. **Environment Variables**
   - `VITE_WS_URL` not set up
   - Need separate dev/production WebSocket URLs

2. **WebSocket Service**
   - No service layer for WebSocket communication
   - Need connection management
   - Need reconnection logic
   - Need message handling

3. **Custom Hooks**
   - No `useWebSocket` hook
   - No connection state management

4. **Chat UI Components**
   - No ChatRoom component
   - No MessageList component
   - No MessageInput component
   - No RoomList component

### Optional Features (Could Implement Later)

- ❌ Read receipts (know who's read what)
- ❌ Typing indicators ("User X is typing...")
- ❌ User presence tracking (who's online)
- ❌ Message editing/deletion (soft deletes)
- ❌ File/media uploads in messages
- ❌ Message search functionality
- ❌ Push notifications
- ❌ Rate limiting/spam prevention
- ❌ Channel scaling policies

---

## Docker Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Docker Compose Network                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │   │  Database    │  │
│  │  Container   │◄──►│  Container   │◄─►│ (PostgreSQL) │  │
│  │ :5173        │    │ :8000        │   │ :5432        │  │
│  └──────────────┘    └──────────────┘   └──────────────┘  │
│        ▲                     ▲                                │
│        │                     │                                │
│        │  (host network)     │  (internal docker network)     │
│        │                     │                                │
│  ┌─────────────┐        ┌──────────────┐                   │
│  │   Browser   │        │    Redis     │                   │
│  │ localhost   │        │  Container   │                   │
│  │  :5173      │        │ :6379        │                   │
│  └─────────────┘        └──────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Connection URLs Reference

| From → To | Development URL | Notes |
|-----------|-----------------|-------|
| **Browser → Backend (REST)** | `http://localhost:8000/api` | From host machine |
| **Browser → Backend (WebSocket)** | `ws://localhost:8000/ws/chat/` | From host machine |
| **Frontend Container → Backend** | `http://backend:8000/api` | Inside docker network |
| **Frontend Container → Backend (WS)** | `ws://backend:8000/ws/chat/` | Inside docker network |
| **Backend → Redis** | `redis://redis:6379` | Inside docker network |
| **Backend → Database** | `postgresql://db:5432` | Inside docker network |

### Docker Compose Services

```yaml
Services in docker-compose.yml:
├── db (PostgreSQL pgvector:pg16)
├── redis (Redis 7-alpine)
├── backend (Django 8000)
├── frontend (Vite/React 5173)
└── worker (AI/Celery - currently commented out)
```

---

## Implementation Phases

### Phase 1: Infrastructure Setup ⭐ START HERE

#### 1.1 Add `channels-redis` to requirements
**File**: `backend/requirements.txt`
```python
channels-redis  # Add this
```

#### 1.2 Configure ASGI Application
**File**: `backend/project/asgi.py`

Create proper ASGI configuration with ProtocolTypeRouter:
```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.chat.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
```

#### 1.3 Configure Channel Layers in Settings
**File**: `backend/project/settings.py`

Add to INSTALLED_APPS:
```python
INSTALLED_APPS = [
    # ... existing apps
    'daphne',  # Must be first!
    'channels',
]
```

Add Channel Layer configuration:
```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [(os.getenv('REDIS_HOST', 'redis'), 6379)],
        },
    },
}

# Must set ASGI app
ASGI_APPLICATION = 'project.asgi.application'
```

#### 1.4 Update Docker Setup
**File**: `backend/Dockerfile`

Change CMD to use Daphne:
```dockerfile
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "project.asgi:application"]
```

Add `daphne` to `requirements.txt`:
```python
daphne
```

### Phase 2: Model Enhancements (Optional)

Consider adding these fields to `ChatMessage`:

```python
class ChatMessage(models.Model):
    # ... existing fields ...
    
    # Optional: for editing
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    
    # Optional: for deletion
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # Optional: original content for audit
    original_content = models.TextField(null=True, blank=True)
```

Run migration: `python manage.py makemigrations` + `python manage.py migrate`

### Phase 3: Consumer Implementation ⭐ CORE FEATURE

**File**: `backend/apps/chat/consumers.py`

Implement full AsyncWebsocketConsumer:
- `connect()` - Authenticate and join room group
- `disconnect()` - Leave room group
- `receive()` - Handle incoming messages
- `chat_message()` - Message handler for group
- `user_joined()` - Broadcast join event
- `user_left()` - Broadcast leave event

**Key responsibilities**:
1. Validate JWT token from query params
2. Check user has permission to join room
3. Add user to ChatRoomMember
4. Join channel layer group
5. Persist messages to PostgreSQL
6. Broadcast to all connected clients
7. Handle disconnections gracefully

### Phase 4: Authentication & Security

1. **JWT Token Validation in Consumer**
   - Extract token from `scope['query_string']` or `scope['headers']`
   - Validate against `settings.SIMPLE_JWT`
   - Store `scope['user']` for authorization

2. **Room Access Control**
   - Check if user is in `ChatRoomMember`
   - Reject if user doesn't have access
   - Check room is active (`is_active=True`)

3. **Rate Limiting**
   - Prevent message spam
   - Add cooldown between messages
   - Consider per-user or per-room limits

4. **Message Validation**
   - Check message length
   - Sanitize HTML/scripts
   - Validate message type

### Phase 5: REST API Endpoints

Add to `backend/apps/chat/views.py` or create `backend/apps/chat/serializers.py`:

```
GET    /api/chat/rooms/                    # List rooms
POST   /api/chat/rooms/                    # Create room
GET    /api/chat/rooms/{id}/               # Get room details
PUT    /api/chat/rooms/{id}/               # Update room
DELETE /api/chat/rooms/{id}/               # Delete room

GET    /api/chat/rooms/{id}/messages/      # Get message history
POST   /api/chat/rooms/{id}/members/       # Add member
DELETE /api/chat/rooms/{id}/members/{uid}/ # Remove member
GET    /api/chat/rooms/{id}/members/       # List room members
```

### Phase 6: Frontend WebSocket Client

Create WebSocket service and components (detailed below in [Frontend WebSocket Configuration](#frontend-websocket-configuration))

---

## Frontend WebSocket Configuration

### Step 1: Create Environment Variables

**File**: `frontend/.env`
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws/chat
```

**File**: `frontend/.env.production`
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_WS_URL=wss://yourdomain.com/ws/chat
```

### Step 2: Create WebSocket Service

**File**: `frontend/src/services/websocketService.ts`

Features:
- Connect with JWT token
- Auto-reconnect with exponential backoff
- Message event handling
- Clean disconnect

### Step 3: Create Custom Hook

**File**: `frontend/src/hooks/useWebSocket.ts`

Provides:
- `connect()` - Establish connection
- `disconnect()` - Close connection
- `sendMessage()` - Send a message
- `subscribe()` - Listen to message events
- `isConnected` - Connection state

### Step 4: Create Chat Components

**Files to create**:
- `frontend/src/pages/ChatPage.tsx` - Main chat page
- `frontend/src/components/ChatRoom.tsx` - Room display
- `frontend/src/components/MessageList.tsx` - Messages
- `frontend/src/components/MessageInput.tsx` - Input form
- `frontend/src/components/RoomList.tsx` - Room selector
- `frontend/src/components/MemberList.tsx` - Room members

### Step 5: Integrate with Redux Store

Create chat slice: `frontend/src/store/slices/chatSlice.ts`
```typescript
interface ChatState {
  rooms: ChatRoom[];
  currentRoomId: number | null;
  messages: ChatMessage[];
  members: User[];
  isConnected: boolean;
  typingUsers: string[];
}
```

---

## Data Flow Diagram

### Message Send Flow
```
User Types Message
         ↓
React Component (ChatMessage.tsx)
         ↓
handleSendMessage() calls useWebSocket
         ↓
websocketService.send({type: 'chat_message', content: '...'})
         ↓
[BROWSER] ──WebSocket──► [BACKEND CONTAINER]
         ↓
ChatConsumer.receive()
         ↓
Validate: User has access? Room active? Message valid?
         ↓
Save to PostgreSQL via ChatMessage model
         ↓
Broadcast to Redis Channel Layer
         ↓
All Connected Clients receive: {type: 'chat_message', ...}
         ↓
useWebSocket hook triggers message handler
         ↓
Redux dispatch: updateMessages(newMessage)
         ↓
Components re-render with new message
```

### Real-time Updates
```
Database (PostgreSQL)
         ↓
ChatMessage.objects.create(...) in Consumer
         ↓
Redis Channel Layer groups
         ↓
All connected clients via async_to_sync(channel_layer.group_send)
         ↓
Consumer.chat_message() callback
         ↓
WebSocket.send() to each client
         ↓
Browser receives WebSocket message
         ↓
Redux store updated
         ↓
React re-renders UI
```

---

## What Frontend Handles vs Backend

### 🎨 Frontend Responsibilities (UI/Display)
- ✅ Display messages
- ✅ Show room members list
- ✅ Render typing indicators
- ✅ Handle user input (text fields)
- ✅ Display notifications/toasts
- ✅ Manage UI state (collapsed/expanded)
- ✅ Theme switching
- ✅ Scroll to bottom on new messages
- ✅ Form validation (client-side)
- ❌ **Database access** (NO!)
- ❌ **Authentication logic** (token comes from backend)
- ❌ **Message storage** (NO!)
- ❌ **Permissions** (backend decides)

### ⚙️ Backend Responsibilities (Logic/Security)
- ✅ Validate message content
- ✅ Authenticate users (verify JWT)
- ✅ Check permissions (user in room?)
- ✅ Store messages in PostgreSQL
- ✅ Broadcast to all clients
- ✅ Manage room members
- ✅ Track online status
- ✅ Handle typing status
- ✅ Rate limiting
- ✅ Message editing/deletion
- ✅ Access control
- ✅ Data persistence
- ✅ Single source of truth

### 📊 Single Source of Truth
**Backend Database (PostgreSQL)** = Always authoritative
- Frontend is a view layer
- All data comes from backend
- Frontend never writes directly to DB
- Frontend asks backend to write, then receives result

---

## Checklist for Getting Started

### ✅ Backend Setup (Priority 1)
- [ ] Add `channels-redis` and `daphne` to `backend/requirements.txt`
- [ ] Create proper `backend/project/asgi.py` with ProtocolTypeRouter
- [ ] Configure `CHANNEL_LAYERS` in `backend/project/settings.py`
- [ ] Add `'daphne'` and `'channels'` to INSTALLED_APPS
- [ ] Set `ASGI_APPLICATION` in settings
- [ ] Update `backend/Dockerfile` CMD to use Daphne
- [ ] Create `.env` file with Redis host settings (or use defaults)

### ✅ WebSocket Consumer (Priority 2)
- [ ] Implement full `ChatConsumer` in `backend/apps/chat/consumers.py`
- [ ] Add JWT token extraction and validation
- [ ] Add room access control
- [ ] Add ChatRoomMember creation on join
- [ ] Implement group management (join/leave groups)
- [ ] Implement message persistence (save to DB)
- [ ] Implement group broadcasting

### ✅ REST API Endpoints (Priority 3)
- [ ] Create serializers for ChatRoom, ChatMessage, ChatRoomMember
- [ ] Create ViewSets/Views for CRUD operations
- [ ] Add URL routing in `backend/apps/chat/urls.py`
- [ ] Add permissions (IsAuthenticated, IsRoomMember)
- [ ] Test endpoints with Postman/curl

### ✅ Frontend Environment (Priority 4)
- [ ] Create `.env` with `VITE_WS_URL`
- [ ] Create `frontend/src/services/websocketService.ts`
- [ ] Create `frontend/src/hooks/useWebSocket.ts`
- [ ] Test WebSocket connection (check browser console)

### ✅ Frontend Components (Priority 5)
- [ ] Create ChatRoom page component
- [ ] Create MessageList component
- [ ] Create MessageInput component
- [ ] Create RoomList component
- [ ] Create Redux chat slice
- [ ] Integrate with existing components

### ✅ Integration & Testing (Priority 6)
- [ ] Test message sending/receiving
- [ ] Test user join/leave notifications
- [ ] Test multiple clients (open 2 browser tabs)
- [ ] Test reconnection logic
- [ ] Test authentication (invalid token)
- [ ] Test permissions (user not in room)
- [ ] Load testing (many messages)

---

## Code Structure Summary

```
Backend
├── backend/requirements.txt           # Add: channels-redis, daphne
├── backend/project/asgi.py           # NEW: ProtocolTypeRouter config
├── backend/project/settings.py       # UPDATE: CHANNEL_LAYERS, ASGI_APPLICATION
├── backend/Dockerfile                # UPDATE: CMD for Daphne
└── backend/apps/chat/
    ├── models.py                     # MAYBE: add is_edited, deleted_at fields
    ├── consumers.py                  # UPDATE: Full ChatConsumer implementation
    ├── routing.py                    # Already exists, might need updates
    ├── serializers.py                # NEW or UPDATE: Serializers for API
    ├── views.py                      # UPDATE: REST API endpoints
    └── urls.py                       # UPDATE: Add REST API routes

Frontend
├── frontend/.env                     # NEW: VITE_WS_URL
├── frontend/.env.production          # NEW: Production WebSocket URL
└── frontend/src/
    ├── services/
    │   └── websocketService.ts       # NEW: WebSocket client
    ├── hooks/
    │   └── useWebSocket.ts           # NEW: React hook
    ├── pages/
    │   └── ChatPage.tsx              # NEW: Main chat page
    ├── components/
    │   ├── ChatRoom.tsx              # NEW
    │   ├── MessageList.tsx           # NEW
    │   ├── MessageInput.tsx          # NEW
    │   ├── RoomList.tsx              # NEW
    │   └── MemberList.tsx            # NEW
    └── store/
        └── slices/
            └── chatSlice.ts          # NEW: Redux chat state
```

---

## Common Patterns & Best Practices

### Message Event Format (Backend → Frontend)

```json
{
  "type": "chat_message",
  "id": 123,
  "room_id": 1,
  "user_id": 5,
  "username": "john_doe",
  "avatar": "https://...",
  "content": "Hello everyone!",
  "created_at": "2026-05-23T10:30:00Z",
  "message_type": "message"
}
```

### Join Event Format

```json
{
  "type": "user_joined",
  "room_id": 1,
  "user_id": 5,
  "username": "john_doe",
  "joined_at": "2026-05-23T10:30:00Z"
}
```

### Typing Indicator Format

```json
{
  "type": "user_typing",
  "room_id": 1,
  "user_id": 5,
  "username": "john_doe",
  "is_typing": true
}
```

---

## Environment Variables Reference

### Backend `.env`
```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,backend

POSTGRES_DB=transcendence
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_HOST=db
POSTGRES_PORT=5432

REDIS_HOST=redis
REDIS_PORT=6379
```

### Frontend `.env` (Development)
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws/chat
```

### Frontend `.env.production` (Production)
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_WS_URL=wss://yourdomain.com/ws/chat
```

---

## Key Django Channels Concepts

### Channel Layer
- Middleware that broadcasts messages to multiple consumers
- Redis-backed for production
- Allows consumers to communicate even without direct WebSocket

### Consumer
- Handler for WebSocket connections
- Similar to Django views but for WebSockets
- Async functions for non-blocking I/O

### Groups
- Named groups of consumers
- Can broadcast to entire group at once
- Used for room-based messaging

### Example Flow
```python
# Consumer A joins room 5
await self.channel_layer.group_add('room_5', self.channel_name)

# Consumer B in room 5 sends message
await self.channel_layer.group_send('room_5', {
    'type': 'chat_message',  # calls self.chat_message() in all consumers
    'content': 'Hello!',
})

# All consumers in room_5 receive this
async def chat_message(self, event):
    await self.send(text_data=json.dumps(event))
```

---

## Troubleshooting Tips

### WebSocket Won't Connect
- Check `ASGI_APPLICATION` is set in settings
- Check `CHANNEL_LAYERS` config points to correct Redis
- Check Docker network connectivity
- Check browser console for errors

### Messages Not Persisting
- Check ChatMessage model in database
- Check Consumer actually calls `.save()`
- Check database migrations ran

### Multiple Clients Not Seeing Messages
- Check `channel_layer.group_send()` is called
- Check group name is consistent
- Check Redis is running and healthy

### Reconnection Infinite Loop
- Limit reconnect attempts (implemented in service)
- Add exponential backoff
- Log reconnection attempts

---

## Next Steps

1. **Immediate**: Implement Phase 1 (Infrastructure Setup)
2. **Short-term**: Implement Phase 3 (Consumer)
3. **Medium-term**: Implement Phase 5 (REST API)
4. **Then**: Build frontend components
5. **Finally**: Test and optimize

---

## Resources & References

- Django Channels: https://channels.readthedocs.io/
- Channels Redis: https://channels.readthedocs.io/en/latest/topics/channel_layers.html
- Daphne: https://channels.readthedocs.io/en/latest/deploying.html
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- Redux Toolkit Query: https://redux-toolkit.js.org/rtk-query/overview

