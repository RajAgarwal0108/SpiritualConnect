# ⚙️ Low-Level Design (LLD) Document
**Project:** SpiritualConnect  
**Components:** Database Schema, API Specification, Frontend State

---

## 1. Database Schema (PostgreSQL via Prisma)

### 1.1 Core Identity
*   **User**: `id`, `email`, `password` (hashed), `name`, `role` (USER/ADMIN), `isPrivate`.
*   **Profile**: `userId`, `bio`, `avatar`, `interests` (Array), `socialLinks` (JSON).

### 1.2 Social Graph
*   **Follow**: `followerId`, `followingId` (Many-to-Many).
*   **Community**: `id`, `name`, `description`, `memberCount`.
*   **CommunityMembership**: `userId`, `communityId`, `role` (MEMBER/MODERATOR).

### 1.3 Content & Interaction
*   **Post**: `id`, `content`, `media` (URL), `authorId`, `communityId`.
*   **Comment**: `id`, `postId`, `parentId` (Self-reference for nesting), `content`.
*   **Like / Bookmark**: Join tables linking `User` and `Post`.
*   **Blog**: `id`, `title`, `content` (Markdown), `readTime`, `coverImage`.
*   **BlogComment**: Specialized comments for blogs.

### 1.4 Learning & Messaging
*   **Course**: `id`, `title`, `modules` (Relation).
*   **CourseEnrollment**: Tracks `progress` float.
*   **Message**: `id`, `room` (Composite Key "min-max"), `senderId`, `content`.

---

## 2. API Specification (REST Layer)

### 2.1 Authentication (`/api/auth`)
*   `POST /register`: Create account, return JWT.
*   `POST /login`: Validate credentials, return JWT.
*   `GET /me`: Get current user context.

### 2.2 Content (`/api/posts`, `/api/blogs`)
*   `GET /posts/feed`: Aggregated feed based on following + communities.
*   `POST /posts`: Create new reflection with optional file upload (Multer).
*   `GET /blogs`: List all blogs (paginated).
*   `GET /blogs/:id`: Fetch single blog details.

### 2.3 Communities (`/api/communities`)
*   `GET /`: List all available Sanghas.
*   `POST /:id/join`: Add user to membership.
*   `GET /joined`: List user's active communities.

### 2.4 Real-Time & Chat (`/api/messages`, `/api/users`)
*   `GET /messages/room/:roomId`: Fetch chat history.
*   `GET /users/online`: Return list of currently connected socket IDs mapped to users.

### 2.5 AI & Oracle (`/api/ai`)
*   `POST /chat`: Send user prompt -> Gemini Flash API -> Stream response.

---

## 3. Frontend Architecture (Next.js 16)

### 3.1 Global State (Zustand)
*   **AuthStore**: `user`, `token`, `login()`, `logout()`.
*   **UIStore**: `isLeftSidebarOpen`, `isRightSidebarOpen` (Chat), `isChatExpanded`.

### 3.2 Key Components
*   **LayoutWrapper**: Handles global transitions, Sidebars, and Scrims.
*   **ChatSidebar**: Manages Socket.IO connection, message list, and "Online" polling.
*   **PostCard**: Reusable card for Feed and Profile, handles optimistic UI updates for Likes.

### 3.3 Utilities
*   **Motion Config**: `SACRED_EASE` ([0.16, 1, 0.3, 1]) for consistent animations.
*   **API Client**: Axios instance with automatic Token injection.
