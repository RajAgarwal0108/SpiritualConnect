# SpiritualConnect Implementation Plan

Based on the requirements in `spiritualConnect.md`, this plan outlines the step-by-step process to build the SpiritualConnect platform using Bun, Next.js, Prisma, and PostgreSQL.

## Phase 1: Project Initialization & Infrastructure

### 1.1 Workspace Setup
- [ ] Create root project directory `spiritual-connect/`.
- [ ] Create subdirectories: `frontend/`, `backend/`, `docker/`.
- [ ] Initialize Git repository.

### 1.2 Database & Environment
- [ ] Create `docker/docker-compose.yml` for PostgreSQL.
- [ ] Create `docker/Dockerfile` for the Bun backend.
- [ ] Create `.env` files for both frontend and backend (DB URL, JWT Secrets, API Keys).

### 1.3 Backend Setup (Bun + Prisma)
- [ ] Initialize Bun project in `backend/` (`bun init`).
- [ ] Install dependencies: `prisma`, `@prisma/client`, `jsonwebtoken`, `bcryptjs`, `cors`, `zod`.
- [ ] Initialize Prisma: `bunx prisma init`.
- [ ] Define **Prisma Schema** (`backend/prisma/schema.prisma`) with models:
    - User (Auth & Role: USER, ADMIN)
    - Profile
    - Post & Comment
    - Course & Enrollment
    - Blog
    - Report (for Admin)
    - Analytics (optional/if db based)
- [ ] Run initial migration to create database tables.
- [ ] check database connection.

## Phase 2: Backend Core Development

### 2.1 Server Structure
- [ ] Create entry point `backend/index.ts` (Bun server).
- [ ] Set up basic generic Middleware (CORS, Error Handling, Logger).
- [ ] Create Route/Controller structure.

### 2.2 Authentication Module
- [ ] Implement `POST /api/auth/register` (hashing password).
- [ ] Implement `POST /api/auth/login` (generating JWT).
- [ ] Implement Auth Middleware (JWT verification & Role checks).

### 2.3 Core API Features
- [ ] **Posts**: `GET /api/posts`, `POST /api/posts`, `POST /api/posts/:id/comment`.
- [ ] **Users**: `GET /api/users/:id`, `PATCH /api/users/:id` (Profile).
- [ ] **Chat**: Basic websocket or polling endpoint foundation.

## Phase 3: Frontend Setup (Next.js + Tailwind)

### 3.1 Framework Initialization
- [ ] Initialize Next.js project in `frontend/` (`bun create next-app`).
- [ ] Configure **Tailwind CSS**.
- [ ] Install key libraries: `axios`, `@tanstack/react-query`, `zustand`, `framer-motion`, `lucide-react` (icons).

### 3.2 State Management & Architecture
- [ ] Set up **React Query Provider** in `app/layout.tsx`.
- [ ] Create **Zustand Store** (`frontend/store/globalStore.ts`) for AuthUser state.
- [ ] Create API Service (`frontend/services/api.ts`) with Axios interceptors for JWT.

### 3.3 Basic UI Components (Scaffolding)
- [ ] Create `Header.tsx` (Navigation), `Footer.tsx`.
- [ ] Create `PostCard.tsx`, `Avatar.tsx`, `Button.tsx`.

## Phase 4: User Feature Implementation

### 4.1 Authentication UI
- [ ] Build `/login` and `/register` pages.
- [ ] Connect to backend Auth API.
- [ ] Protect private routes using a custom `useAuth` hook.

### 4.2 Core Social Features
- [ ] **Home Feed (`/`)**: Fetch and display posts (Infinite scroll).
- [ ] **Create Post**: UI to submit text/media content.
- [ ] **Profile Page (`/profile/[userId]`)**: View user details and their posts.

### 4.3 Advanced Features
- [ ] **Courses (`/courses`)**: connect to dummy or real course API endpoints.
- [ ] **Chat (`/chat`)**: UI for 1:1 messaging.
- [ ] **AI Assistant (`/ai-assistant`)**: Chat interface connecting to RAG endpoint.

## Phase 5: Admin Panel Implementation

### 5.1 Admin Architecture
- [ ] Create Admin Layout (`app/admin/layout.tsx`) with Sidebar.
- [ ] Add Role-based protection (Redirect if not Admin).

### 5.2 Admin Modules
- [ ] **Dashboard (`/admin/dashboard`)**: Stats overview (User count, Posts count).
- [ ] **User Management (`/admin/users`)**: Table to view all users, Ban/Delete actions.
- [ ] **Content Moderation (`/admin/posts`)**: List user posts, delete inappropriate content.
- [ ] **Reports (`/admin/reports`)**: View reported content.

## Phase 6: Refinement & Deployment

- [ ] **Error Handling**: Add Toasts/Notifications for success/error.
- [ ] **Loading States**: Add Skeleton loaders.
- [ ] **Testing**: Verify User flow and Admin flow.
- [ ] **Docker**: Finalize `docker-compose.yml` for full stack startup.

## Phase 7: Configuration & Secrets

### 7.1 External Service Integration
- [ ] Configure `OPENAI_API_KEY` in backend `.env` for AI Chatbot.
- [ ] Configure S3/Cloud storage credentials for media uploads.
- [ ] Set up secure `JWT_SECRET` and `DATABASE_URL` (Production).

### 7.2 Admin & Branding
- [ ] Seed initial Admin user in database.
- [ ] Apply brand assets (Logo, Colors) to frontend theme.

## Phase 8: Home Page Redesign & Feature Expansion
- [ ] Refactor Home Page (`/`) to 3-column layout (Left Sidebar, Feed, Right Sidebar).
- [ ] Create `PostCard` component with square design and fixed media sizing.
- [ ] Create `ChatSidebar` component for the right section.
- [ ] Update `Header` to include Notification button.
- [ ] Implement responsive sidebar toggles.
