# 🌿 SpiritualConnect — Feature Documentation

A Digital Sanctuary for Modern Seekers. This document outlines every feature implemented in the SpiritualConnect platform, organized by user journey and technical architecture.

⸻

## 📋 Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Social Feed & Reflections](#social-feed--reflections)
3. [Blogs & Long-Form Wisdom](#blogs--long-form-wisdom)
4. [Courses & Learning Paths](#courses--learning-paths)
5. [Vedic Oracle (AI Assistant)](#vedic-oracle-ai-assistant)
6. [Community & Messaging](#community--messaging)
7. [Admin Dashboard](#admin-dashboard)
8. [User Profiles](#user-profiles)
9. [Settings & Preferences](#settings--preferences)
10. [Design System & UI Components](#design-system--ui-components)

⸻

## 1. Authentication & User Management

### Overview
The authentication system is the gateway to the sanctuary. It ensures secure access while maintaining a calm, welcoming onboarding experience.

### Features

#### 1.1 User Registration (`/register`)
**Purpose**: Allow new seekers to join the community.

**User Flow**:
- Navigate to `/register` page
- Enter email and password
- Confirm password
- Click "Join the Circle"
- Upon success, redirect to `/login` or auto-login

**Technical Details**:
- **Backend**: `POST /api/auth/register`
- **Validation**: 
  - Email format validation
  - Password strength (min 8 characters)
  - Unique email constraint
- **Security**: Password hashed with bcryptjs before storage
- **Response**: User object with JWT token + refresh token (if applicable)

**UI Design**:
- Minimal, centered layout
- Sacred Beige background
- Typography-driven (serifs for prompts, sans-serif for input labels)
- No distracting graphics; focus on text

---

#### 1.2 User Login (`/login`)
**Purpose**: Authenticate existing users into the sanctuary.

**User Flow**:
- Enter email and password
- Submit via "Enter Sanctuary" button
- Upon success, store JWT in localStorage/cookies
- Redirect to home feed (`/`)

**Technical Details**:
- **Backend**: `POST /api/auth/login`
- **JWT Management**: 
  - Token stored in Authorization header for API calls
  - Axios interceptor auto-attaches token to requests
  - Token refresh logic if expired
- **Error Handling**: Show helpful messages for invalid credentials
- **Response**: User object + JWT

**UI Design**:
- Matching registration, but with "forgotten password" option (future)
- "Don't have an account?" link to register

---

#### 1.3 JWT Authentication Middleware
**Purpose**: Verify user identity on protected routes.

**Implementation**:
- **Backend Middleware** (`auth.middleware.ts`):
  - Checks `Authorization: Bearer <token>` header
  - Validates JWT signature and expiry
  - Attaches user object to request context
  - Returns 401 if invalid/missing

- **Frontend Protection**:
  - `useAuthStore` hook checks user state
  - Redirect unauthenticated users to `/login`
  - Role-based route protection (e.g., admin-only routes)

**Technical Stack**:
- Backend: jsonwebtoken (JWT signing/verification)
- Frontend: Zustand store + React context guards

---

#### 1.4 User Profile Creation
**Purpose**: Establish user identity within the sanctuary.

**Fields**:
- Avatar (image upload → S3/cloud storage)
- Bio (short description, max 200 chars)
- Spiritual interests/tags
- Social links (optional)
- Location (optional)
- Status (online/offline)

**Technical Details**:
- **Endpoint**: `PATCH /api/users/:id/profile`
- **Image Handling**: Upload to cloud storage, store URL in database
- **Validation**: Avatar < 5MB, bio < 200 chars
- **Updates**: Real-time in-page reflection (no page reload)

---

### Database Schema (Auth)
```prisma
model User {
  id              Int         @id @default(autoincrement())
  email           String      @unique
  password        String      (hashed)
  role            UserRole    @default(USER)  // USER, ADMIN, MODERATOR
  profile         Profile?
  posts           Post[]
  comments        Comment[]
  likes           Like[]
  bookmarks       Bookmark[]
  messages        Message[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Profile {
  id              Int         @id @default(autoincrement())
  userId          Int         @unique
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  avatar          String?
  bio             String?
  spiritualInterests String[]
  location        String?
  socialLinks     String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

---

## 2. Social Feed & Reflections

### Overview
The heart of the sanctuary. Users post reflections (text + media), engage through likes/comments, and discover wisdom from the community.

### Features

#### 2.1 Create a Reflection (Post)
**Purpose**: Allow users to share their spiritual insights.

**User Flow**:
- Navigate to home (`/`)
- In the "Create Reflection" section at top
- Type text or caption
- Optionally upload image/media
- Click "Offer" to publish

**Technical Details**:
- **Endpoint**: `POST /api/posts`
- **Payload**:
  ```json
  {
    "content": "string (required)",
    "media": "url (optional)",
    "tags": ["array of spiritual tags"]
  }
  ```
- **Image Upload Flow**:
  1. User selects file via file input
  2. Frontend sends to `POST /api/upload`
  3. Backend uploads to S3/cloud storage
  4. Returns URL to client
  5. URL included in POST payload
- **Validation**: Content required, max 1000 chars (configurable)
- **Response**: Created post object with ID, timestamps

**UI Design**:
- Compact, centered card at top of feed
- Placeholder text: "Contribute your light..."
- Hidden until user hovers/focuses
- Submit button: "Offer Reflection"

---

#### 2.2 View Home Feed
**Purpose**: Display personalized reflections from the community.

**User Flow**:
- Land on `/` (authenticated)
- See "Wisdom Uncluttered" header + search bar
- Below: "Today's Sutras" section with post cards
- Scroll to load more (infinite scroll or pagination)

**Technical Details**:
- **Endpoint**: `GET /api/posts?page=1&limit=20`
- **Ordering**: Most recent first (chronological)
- **Pagination**: 20 posts per page, load more on scroll
- **Caching**: React Query caches posts, refetch on manual refresh
- **Response**: Array of post objects with author, likes, comments count

**Post Card Anatomy**:
- **Header**: Author name (small, muted) + date
- **Media**: Large image (aspect 4:5 for reading focus) if present
- **Caption**: Centered serif typography, italicized
- **Actions**: Heart (like), comment, share, bookmark
  - Hidden by default, revealed on hover
  - Smooth fade-in (700ms, sacred easing)
- **Metadata**: "X Breaths" (likes), "Y Reflections" (comments)
- **Quick Comment**: Input field at bottom, hidden until hover

**Design System Integration**:
- Card: `glass-panel`, `rounded-[48px]`
- Text: Sacred serif font, 1.7-1.9 line height
- Spacing: 128px between post sections (vertical rhythm)
- Motion: `SACRED_EASE` cubic-bezier for all transitions

---

#### 2.3 Like a Reflection
**Purpose**: Allow users to show appreciation for wisdom.

**User Flow**:
- Hover over post card
- Heart icon becomes interactive
- Click to toggle like

**Technical Details**:
- **Endpoint**: `POST /api/posts/:id/like`
- **Logic**: 
  - If user already liked: unlike (decrement count)
  - If user hasn't liked: like (increment count)
- **Optimistic Update**: UI updates immediately, request sent async
- **Response**: Updated post with new like count

**UI Feedback**:
- Heart fills with red + solid stroke when liked
- Count updates instantly
- No loading state (instant perceived feedback)

---

#### 2.4 Bookmark a Reflection
**Purpose**: Allow users to save posts for later reading.

**User Flow**:
- Hover over post card
- Bookmark icon at bottom-right
- Click to toggle bookmark

**Technical Details**:
- **Endpoint**: `POST /api/posts/:id/bookmark`
- **Database**: `Bookmark` model links User ↔ Post
- **UI State**: Filled bookmark when active, outline when inactive
- **Retrieval**: Users can see all bookmarks in future feature

**Response**:
```json
{
  "id": 1,
  "userId": 5,
  "postId": 10,
  "createdAt": "2025-01-23T..."
}
```

---

#### 2.5 View Single Post (Reading Mode)
**Purpose**: Distraction-free reading experience for long reflections.

**User Flow**:
- Click on post card or comment link
- Navigate to `/posts/:postId`
- See full post in centered, readable layout
- Comments section below

**Technical Details**:
- **Endpoint**: `GET /api/posts/:id`
- **Route Protection**: Public (any user can view)
- **Related Data**: Author details, all comments, like/bookmark status

**UI Design** (Premium Reading Mode):
- **Hero Section**: Post media (full height, 70vh)
- **Content Container**: Narrow column (max-w-3xl), floated back button
- **Typography**: 
  - Serif font for body
  - 1.8 line height for readability
  - Large font size (17-18px desktop)
- **No Distractions**: 
  - Hidden header while reading
  - Only post content + comments visible
  - Floating back-to-feed button (top-left, hidden on scroll)

---

#### 2.6 Comment on a Reflection
**Purpose**: Enable dialogue and deeper reflection.

**User Flow**:
- On post detail page
- Scroll to "Reflections" section
- Input field: "Add your light..."
- Type comment
- Click "Offer Reflection"

**Technical Details**:
- **Endpoint**: `POST /api/posts/:postId/comment`
- **Payload**:
  ```json
  {
    "content": "string (required)",
    "postId": "int"
  }
  ```
- **Auth**: Requires logged-in user
- **Response**: Created comment object

**UI Design**:
- Comments displayed in chronological order
- Each comment shows:
  - Author avatar + name
  - Date
  - Comment text (serif, italic)
  - Author role badge (e.g., "Wisdom Keeper")

---

#### 2.7 Share a Reflection
**Purpose**: Amplify wisdom across the network.

**User Flow** (Future):
- Click share icon on post
- Options: Copy link, Share to social media

**Current State**: UI placeholder present, backend logic pending

---

### Database Schema (Posts & Engagement)
```prisma
model Post {
  id              Int         @id @default(autoincrement())
  authorId        Int
  author          User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  content         String
  media           String?
  tags            String[]    @default([])
  likes           Like[]
  comments        Comment[]
  bookmarks       Bookmark[]
  _count          PostCount?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Like {
  id              Int         @id @default(autoincrement())
  userId          Int
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId          Int
  post            Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt       DateTime    @default(now())

  @@unique([userId, postId])  // Prevent duplicate likes
}

model Comment {
  id              Int         @id @default(autoincrement())
  content         String
  authorId        Int
  author          User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  postId          Int
  post            Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Bookmark {
  id              Int         @id @default(autoincrement())
  userId          Int
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId          Int
  post            Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt       DateTime    @default(now())

  @@unique([userId, postId])  // Prevent duplicate bookmarks
}
```

---

## 3. Blogs & Long-Form Wisdom

### Overview
A curated library of deep wisdom. Distinct from social posts, blogs are polished, longer-form articles authored by designated wisdom keepers.

### Features

#### 3.1 Browse Blogs (`/blogs`)
**Purpose**: Discover and explore long-form wisdom.

**User Flow**:
- Navigate to `/blogs`
- See "The Library of Light" header
- Grid of blog cards (2 per row on desktop)
- Click "Inscribe New Wisdom" (if logged in as author) or read existing

**Technical Details**:
- **Endpoint**: `GET /api/blogs?page=1&limit=12`
- **Ordering**: Most recent first
- **Pagination**: 12 blogs per page
- **Response**: Array of blog objects with preview data

**Blog Card Anatomy**:
- **Image**: Tall hero (h-80) with gradient overlay
- **Tag**: "Sutra" badge in top-left
- **Title**: Serif, light weight, 2xl size
- **Preview Text**: First 180 chars of content, HTML stripped
- **Author**: Avatar + name + date
- **CTA**: "Journey Inward" button with chevron

**Design System**:
- Card: `glass-panel`, `rounded-[48px]`, subtle ring
- Grid: 2 columns on desktop, 1 on mobile
- Section gap: 128px vertical rhythm
- Hover: Slight lift on card, image zoom

---

#### 3.2 View Blog Detail (`/blogs/:blogId`)
**Purpose**: Deep, immersive reading experience for long-form wisdom.

**User Flow**:
- Click blog card from grid
- Navigate to `/blogs/:blogId`
- See full article in reading mode

**Technical Details**:
- **Endpoint**: `GET /api/blogs/:id`
- **Related Data**: Author, comments, like count

**UI Design** (Premium Reading Mode):
- **Hero Section**: Blog thumbnail (70vh, full width)
  - Subtle gradient overlay
  - Floating "Back to Library" button (fixed, top-left)
- **Content Column**: Narrow (max-w-3xl), centered
  - Metadata: Publication date, estimated read time
  - Title: Large serif, light weight
  - Author Card: Avatar + name + bio snippet
  - Body: HTML content rendered with prose styling
    - Headings: Serif, light, tracking tight
    - Paragraphs: Serif, 1.8 line height, 17-18px
    - Blockquotes: Indented, italic, subtle background
    - Lists: Styled with secondary color
  - Separator: Subtle horizontal divider before actions
  - Actions: Like + Share + Bookmark buttons
    - No counts, minimal visual weight
- **Reflections Section**: Comments below fold
  - Title: "Reflections"
  - Comment cards: Author avatar + name + date + text
  - Add comment form: Textarea for logged-in users
    - Placeholder: "Share your perspective on this sutra..."

**Motion**:
- Hero image: 2s fade-in + subtle zoom
- Content: Staggered fade-in on scroll
- Comment input: Smooth expand on focus

---

#### 3.3 Create Blog (`/blogs/new`)
**Purpose**: Allow wisdom keepers to publish articles.

**User Flow** (Future):
- Logged-in user navigates to `/blogs/new`
- Rich text editor for blog content
- Upload hero image
- Add metadata (title, description, tags)
- Publish

**Current State**: Route exists, UI scaffolding in place. Awaiting backend editor integration.

---

#### 3.4 Like Blog
**Purpose**: Show appreciation for long-form wisdom.

**Technical Details**:
- **Endpoint**: `POST /api/blogs/:id/like`
- **Logic**: Toggle like on blog
- **UI**: Heart icon at bottom of article, no count visible

---

#### 3.5 Comment on Blog
**Purpose**: Continue the conversation in a structured way.

**Technical Details**:
- **Endpoint**: `POST /api/blogs/:id/comment`
- **Payload**: Same as post comments
- **UI**: Reflection cards below article

---

### Database Schema (Blogs)
```prisma
model Blog {
  id              Int         @id @default(autoincrement())
  title           String
  content         String      // HTML content
  author          User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId        Int
  thumbnailUrl    String?
  tags            String[]    @default([])
  likes           BlogLike[]
  comments        BlogComment[]
  _count          BlogCount?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model BlogLike {
  id              Int         @id @default(autoincrement())
  userId          Int
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  blogId          Int
  blog            Blog        @relation(fields: [blogId], references: [id], onDelete: Cascade)
  createdAt       DateTime    @default(now())

  @@unique([userId, blogId])
}

model BlogComment {
  id              Int         @id @default(autoincrement())
  content         String
  authorId        Int
  author          User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  blogId          Int
  blog            Blog        @relation(fields: [blogId], references: [id], onDelete: Cascade)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

---

## 4. Courses & Learning Paths

### Overview
Structured learning journeys guided by mentors. Courses are curated paths to deepen spiritual practice.

### Features

#### 4.1 Browse Courses (`/courses`)
**Purpose**: Discover guided learning experiences.

**User Flow**:
- Navigate to `/courses`
- See "The Academy of Being" header + intro text
- Grid of course cards (3 per row on desktop)
- Click "Explore Path" to view details

**Technical Details**:
- **Endpoint**: `GET /api/courses?page=1&limit=12`
- **Ordering**: Most recent first (configurable)
- **Response**: Array of course objects

**Course Card Anatomy**:
- **Image Area**: Tall placeholder (h-64) with Compass icon
  - Subtle rotation on hover
  - Backdrop color: Sacred Beige
- **Title**: Serif, light weight, 2xl
- **Instructor**: Small badge with instructor name
- **Description**: 3-line clamp, serif, italic
- **CTA**: "Explore Path" button

**Design System**:
- Card: `glass-panel`, `rounded-[48px]`, subtle ring
- Grid: 3 columns desktop, 2 tablet, 1 mobile
- Hover: Lift + shadow deepening

---

#### 4.2 View Course Detail (`/courses/:courseId`)
**Purpose**: Explore course curriculum and enroll.

**User Flow** (Future):
- Click course card
- See course overview, curriculum, instructor bio
- "Enroll Now" button if not enrolled
- Access course content after enrollment

**Current State**: Route exists, awaiting backend course content structure.

---

#### 4.3 Enroll in Course (Future)
**Purpose**: Start a learning journey.

**Technical Details** (Placeholder):
- **Endpoint**: `POST /api/courses/:id/enroll`
- **Logic**: Create enrollment record linking User ↔ Course
- **Response**: Enrollment object

**Database Schema**:
```prisma
model Course {
  id              Int         @id @default(autoincrement())
  title           String
  description     String
  instructor      User        @relation(fields: [instructorId], references: [id])
  instructorId    Int
  curriculum      String[]    // Array of lesson titles or structured content
  enrollments     Enrollment[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Enrollment {
  id              Int         @id @default(autoincrement())
  userId          Int
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId        Int
  course          Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  progress        Int         @default(0)  // Percentage or lesson count
  completedAt     DateTime?
  createdAt       DateTime    @default(now())

  @@unique([userId, courseId])  // Prevent duplicate enrollments
}
```

---

## 5. Vedic Oracle (AI Assistant)

### Overview
A spiritual intelligence guide powered by LLM integration. The Oracle answers questions about spirituality, philosophy, and personal growth using curated knowledge sources.

### Features

#### 5.1 Access AI Oracle (`/ai-assistant`)
**Purpose**: Seek personalized spiritual guidance.

**User Flow**:
- Navigate to `/ai-assistant`
- See "Vedic Oracle" header + intro message
- Two example questions presented as buttons
- Type a question or click an example
- Submit to get guidance

**Authentication**: Requires login. Unauthenticated users see a gate with "Join the Circle" CTA.

**Technical Details**:
- **Endpoint**: `POST /api/ai/guidance`
- **Payload**:
  ```json
  {
    "prompt": "string",
    "conversationHistory": []  // Optional, for context
  }
  ```
- **Response**:
  ```json
  {
    "answer": "string",
    "sources": [
      {"type": "gita", "title": "Chapter 2, Verse 47", "id": "..."}
    ],
    "suggestedQuestions": ["string", "string"],
    "confidence": 0.95
  }
  ```

**AI Integration** (Backend):
- **LLM Provider**: OpenAI GPT-4 (or configurable alternative)
- **Prompting Strategy**: 
  - System prompt establishes Oracle identity and knowledge base
  - User query injected into context
  - Knowledge base documents retrieved via semantic search
  - RAG (Retrieval-Augmented Generation) architecture
- **Knowledge Base**: Curated texts on:
  - Bhagavad Gita (verse-level indexing)
  - Buddhist teachings
  - Modern philosophy on well-being
  - Platform wisdom (aggregated posts/blogs)
- **Fallback**: If confidence < threshold, offer to connect with human mentor

#### 5.2 Chat Interface
**Purpose**: Conversational, continuous guidance seeking.

**User Flow**:
- Type spiritual inquiry in input field
- Press Enter or click send
- Message appears in chat (right-aligned, subtle styling)
- Oracle response streamed/fetched and displayed (left-aligned)
- Suggested follow-up questions appear below Oracle response
- Continue conversation

**UI Design**:
- **Main Chat Area**: 
  - Centered, full-height container
  - Scroll area for messages
  - Message bubbles: User (white, subtle ring) vs. Oracle (sacred-beige, no outline)
  - Avatar badges: User icon vs. Bot icon
- **Metadata**:
  - Oracle responses show source badges below (Gita, Buddhist Texts, etc.)
  - Suggested follow-up questions as pill buttons
- **Input Area**: 
  - Textarea placeholder: "Share your spiritual inquiry..."
  - Send button: Floating, icon-only (paper plane)
  - Suggested questions initially visible if no conversation
- **Sidebar** (Desktop):
  - "The Sanctuary" card: Knowledge root info
  - "Echoes" card: Recent conversation history (future)

**Motion**:
- Messages fade in + subtle scale
- Suggested questions stagger-fade
- Oracle thinking indicator: Three bouncing dots

---

#### 5.3 Context Awareness
**Purpose**: Personalize guidance based on user context.

**Implementation** (Future):
- Track user's spiritual interests (from profile)
- Reference user's bookmarked posts/blogs
- Tailor responses to user's spiritual tradition preference
- Store conversation history for continuity

**Technical Details**:
- Conversation history stored in React Query cache (session-based)
- Optional: Store conversation logs in database for user recall (privacy-controlled)

---

### AI Service Architecture (Backend)

**Endpoint**: `POST /api/ai/guidance`
```typescript
async function getGuidance(prompt: string, userId: number) {
  1. Validate user is authenticated
  2. Embed user prompt using OpenAI embeddings API
  3. Vector search knowledge base for top-5 relevant documents
  4. Construct context-aware system prompt:
     - Include oracle persona
     - Inject retrieved documents
     - Add user's spiritual interests from profile
  5. Call LLM with system + user prompt
  6. Extract answer + generate suggested questions
  7. Return response with sources + confidence score
}
```

**Knowledge Base Architecture** (Future):
- **Storage**: Pinecone / Supabase Vector DB / Milvus
- **Documents**: Verse-indexed Gita, Buddhist sutras, modern texts
- **Embeddings**: OpenAI `text-embedding-3-small`
- **Sync**: Background job to periodically index platform content

---

### Database Schema (AI)
```prisma
model AIConversation {
  id              Int         @id @default(autoincrement())
  userId          Int
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages        AIMessage[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model AIMessage {
  id              Int         @id @default(autoincrement())
  conversationId  Int
  conversation    AIConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role            String      // "user" or "oracle"
  content         String
  sources         String[]?   // Array of source references
  createdAt       DateTime    @default(now())
}
```

---

## 6. Community & Messaging (Chat)

### Overview
Private one-to-one messaging for deeper connections between seekers.

### Features

#### 6.1 Chat Interface (`/chat`)
**Purpose**: Enable private dialogue between community members.

**User Flow**:
- Navigate to `/chat`
- See list of conversations (or empty state if none)
- Click a conversation or start new
- See message history
- Type and send messages

**Current State**: UI scaffolding present. Backend real-time messaging (WebSockets) pending.

**Technical Plan**:
- **Endpoint**: `GET /api/messages?conversationId=...`
- **Real-Time**: WebSocket connection for live updates
- **Delivery**: Message status (sent, delivered, read)

---

### Database Schema (Messaging)
```prisma
model Conversation {
  id              Int         @id @default(autoincrement())
  participantIds  Int[]       // Array of user IDs
  participants    User[]      @relation("conversations")
  messages        Message[]
  lastMessageAt   DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Message {
  id              Int         @id @default(autoincrement())
  conversationId  Int
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId        Int
  sender          User        @relation(fields: [senderId], references: [id], onDelete: Cascade)
  content         String
  media           String?     // Optional image/file URL
  readAt          DateTime?   // Null = unread
  createdAt       DateTime    @default(now())
}
```

---

## 7. Admin Dashboard

### Overview
Moderation and platform management tools for administrators.

### Features

#### 7.1 Admin Dashboard (`/admin/dashboard`)
**Purpose**: Overview of platform health and key metrics.

**Accessible To**: Users with `role: ADMIN` only.

**User Flow**:
- Navigate to `/admin`
- See sidebar with admin modules
- Dashboard shows:
  - Total user count
  - Total posts count
  - Total blogs count
  - Recent signups
  - Reports pending review

**Current State**: Route structure in place, metrics endpoints pending.

---

#### 7.2 User Management (`/admin/users`)
**Purpose**: Manage user accounts and permissions.

**Features** (Future):
- Table of all users
- Filter by role, signup date, status
- Ban/unban users
- Change user role
- View user profile details

---

#### 7.3 Content Moderation (`/admin/posts`)
**Purpose**: Review and moderate user-generated content.

**Features** (Future):
- View all posts
- Flag/delete inappropriate content
- Ban content creators if necessary
- View reported content

---

#### 7.4 Reports (`/admin/reports`)
**Purpose**: Handle user reports of inappropriate content.

**Database Schema**:
```prisma
model Report {
  id              Int         @id @default(autoincrement())
  type            ReportType  // POST, COMMENT, USER, BLOG
  targetId        Int         // ID of reported item
  reportedById    Int
  reportedBy      User        @relation(fields: [reportedById], references: [id])
  reason          String      // SPAM, HARASSMENT, INAPPROPRIATE, OTHER
  description     String?
  status          ReportStatus @default(PENDING)  // PENDING, RESOLVED, DISMISSED
  resolvedBy      Int?
  resolvedByUser  User?       @relation("resolvedReports", fields: [resolvedBy], references: [id])
  createdAt       DateTime    @default(now())
  resolvedAt      DateTime?
}
```

---

## 8. User Profiles

### Features

#### 8.1 View User Profile (`/profile/[userId]`)
**Purpose**: See user's public presence and contributions.

**User Flow**:
- Click on user avatar/name anywhere in platform
- Navigate to `/profile/:userId`
- See profile card with:
  - Avatar + name
  - Bio
  - Join date
  - User's posts (grid or feed)
  - Follow button (future)

**Technical Details**:
- **Endpoint**: `GET /api/users/:id`
- **Related Data**: User posts, follower count, following count
- **Public Data Only**: Avatar, bio, name, public posts
- **Private Data**: Email only shown if viewing own profile

**UI Design**:
- Hero section with profile card (centered, `glass-panel`)
- Below: Posts by user displayed in grid/feed
- No editing controls unless own profile

---

#### 8.2 Edit Own Profile (`/profile/[userId]?edit=true` or `/profile/edit`)
**Purpose**: Allow users to update their profile details.

**User Flow** (Future):
- Navigate to settings or click "Edit Profile"
- Form to update:
  - Avatar (image upload)
  - Bio
  - Spiritual interests (multi-select tags)
  - Location
- Save changes

**Technical Details**:
- **Endpoint**: `PATCH /api/users/:id`
- **Auth**: Only owner can edit own profile
- **Validation**: Same as profile creation

---

### Database (see User & Profile above)

---

## 9. Settings & Preferences

### Features

#### 9.1 Account Settings (`/settings/account`)
**Purpose**: Manage account security and credentials.

**Features** (Future):
- Change password
- Email verification
- Two-factor authentication
- Account deletion

---

#### 9.2 Notification Preferences (`/settings/notifications`)
**Purpose**: Control how and when user receives notifications.

**Features** (Future):
- Email notifications (posts, comments, likes)
- In-app notifications
- Frequency (daily digest, instant, off)
- Mute specific users/topics

---

#### 9.3 Privacy & Content Settings (`/settings/privacy`)
**Purpose**: Control profile visibility and content filtering.

**Features** (Future):
- Profile visibility (public, friends-only, private)
- Content filters (mute keywords, block users)
- Data download/export

---

## 10. Design System & UI Components

### 10.1 Global Design Tokens

#### Colors
```css
--color-sacred-beige: #F9F7F2;        /* Canvas */
--color-sacred-gold: #D9A05B;         /* Accent */
--color-sacred-gold-dark: #B8845C;    /* Dark accent variant */
--color-sacred-text: #5C5445;         /* Primary text */
--color-sacred-muted: #8E8675;        /* Secondary text */
--color-sacred-border: rgba(233,228,219,0.4);  /* Subtle dividers */
```

#### Typography
```
Headings:
- Font: Geist / Inter / SF Pro (sans-serif)
- Weight: 300–400 (light to normal)
- Tracking: slightly negative
- Size: 5xl (60px) → xs (12px) scaled by hierarchy

Body Text:
- Font: Cormorant Garamond (serif)
- Weight: 400
- Size: 16–18px
- Line height: 1.7–1.9
```

#### Spacing (Vertical Rhythm)
```
Section gaps:     96px / 128px
Internal padding: 24px / 32px
Card padding:     32px / 40px / 48px
```

#### Corner Radius
```
Containers:       rounded-[48px]  (48px, sanctuary feeling)
Interactive:      rounded-[32px] / rounded-full
Micro:            rounded-lg / rounded-xl
```

#### Motion
```
Default duration: 700ms
Sacred easing:    cubic-bezier(0.16, 1, 0.3, 1)
Hover states:     y: -6px, shadow: deepened
Transitions:      All 700ms ease-sacred
```

---

### 10.2 Reusable Components

#### Button.tsx
- Variants: `primary` (gold gradient), `secondary` (white), `ghost` (transparent)
- Sizes: lg (default), sm, xs
- States: hover, active, disabled
- Motion: Scale + lift on hover

#### Card.tsx
- Default: `glass-panel`, `rounded-4xl`
- Hover: Lift 6px, shadow deepens
- Variants: Can be used for posts, blogs, profiles, etc.
- Motion: Staggered fade-in in lists

#### Header.tsx
- Fixed/floating navigation
- Logo (left), Search (center), Avatar/Menu (right)
- Mobile: Collapses to 3-dot menu
- Blur: `backdrop-blur-xl`
- Overlay: Full-screen menu on 3-dot click

#### PageTransition.tsx
- Wraps route changes
- Fade-in + subtle scale for new pages
- 500ms duration

---

### 10.3 Motion Utilities (Framer Motion)

#### SACRED_EASE
```javascript
const SACRED_EASE = [0.16, 1, 0.3, 1];  // cubic-bezier
```

#### Stagger Container & Items
```javascript
const STAGGER_CONTAINER = {
  initial: "initial",
  animate: "animate",
  exit: "exit",
  variants: {
    animate: { transition: { staggerChildren: 0.1 } },
  },
};

const ITEM_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SACRED_EASE } },
};
```

---

## 🎯 Feature Completion Status

| Feature | Status | Priority |
|---------|--------|----------|
| Authentication (Register/Login) | ✅ Complete | P0 |
| Social Feed | ✅ Complete | P0 |
| Posts (CRUD) | ✅ Complete | P0 |
| Like/Bookmark Posts | ✅ Complete | P0 |
| Comments | ✅ Complete | P0 |
| Blogs | ✅ Complete | P1 |
| Courses (Browse) | ✅ Complete | P1 |
| Vedic Oracle (AI) | ✅ Complete | P1 |
| User Profiles | ✅ Complete | P1 |
| Header Navigation | ✅ Complete | P0 |
| Design System | ✅ Complete | P0 |
| Chat Messaging | 🟡 In Progress | P2 |
| Admin Dashboard | 🟡 In Progress | P2 |
| User Management | ❌ Not Started | P2 |
| Content Moderation | ❌ Not Started | P2 |
| Notifications | ❌ Not Started | P2 |
| Follow/Unfollow | ❌ Not Started | P3 |
| Search | ❌ Not Started | P3 |
| Recommendations | ❌ Not Started | P3 |

---

## 📐 API Reference (Quick Summary)

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me (current user)
```

### Posts
```
GET /api/posts (paginated feed)
POST /api/posts (create)
GET /api/posts/:id
POST /api/posts/:id/like
POST /api/posts/:id/bookmark
POST /api/posts/:id/comment
```

### Blogs
```
GET /api/blogs (paginated)
GET /api/blogs/:id
POST /api/blogs/:id/like
POST /api/blogs/:id/comment
```

### Courses
```
GET /api/courses (paginated)
GET /api/courses/:id
POST /api/courses/:id/enroll
```

### Users
```
GET /api/users/:id (profile)
PATCH /api/users/:id (update profile)
GET /api/users (admin list)
```

### AI
```
POST /api/ai/guidance (ask oracle)
```

### Media
```
POST /api/upload (file upload to cloud storage)
```

---

## 🚀 Next Steps & Roadmap

### Immediate (Current Sprint)
1. ✅ Finalize Design System across all pages
2. ✅ Instagram-style post cards with hover interactions
3. ✅ Blog detail reading mode
4. ⏳ Fix remaining linting errors in AI Assistant

### Short Term (2 Weeks)
1. Complete Chat messaging (WebSocket integration)
2. Implement Admin Dashboard with metrics
3. Add user follow/unfollow logic
4. Refine AI Oracle with RAG integration

### Medium Term (1 Month)
1. Notifications system (email + in-app)
2. Search across posts/blogs/users
3. Personalized recommendations
4. User settings (privacy, preferences)

### Long Term (Q2 2026)
1. Mobile app (React Native)
2. Dark mode (warm palette)
3. Analytics dashboard for creators
4. Community groups/spaces
5. Moderation AI filters

---

## 📞 Support & Maintenance

For questions on any feature, reference this document's section.
For implementation details, check the corresponding backend controller and frontend page files.

**Last Updated**: January 23, 2026
**Maintained By**: SpiritualConnect Core Team
