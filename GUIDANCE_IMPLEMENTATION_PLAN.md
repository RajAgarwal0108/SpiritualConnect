# Guidance Feature Implementation Plan

This document outlines the detailed step-by-step implementation plan for the "Guidance" feature, where users can become verified guides, and other users can request 1-on-1 private guidance sessions with them.

## Phase 1: Database & Schema Updates

**File to Edit**: `backend/prisma/schema.prisma`

1. **Add Enums**:
   - `GuideStatus`: `PENDING`, `APPROVED`, `REJECTED`, `NONE`
   - `SessionStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`

2. **Update `User` Model**:
   - Add `isGuide Boolean @default(false)`
   - Add `guideStatus GuideStatus @default(NONE)`
   - Add `phoneNumber String?`
   - Add `guideTitle String?` (e.g., "Spiritual Coach", "Meditation Expert")
   - Add `guideBio String?` 
   - Add relations for `GuideApplication`, `guidanceUserSessions`, `guidanceGuideSessions`.

3. **Create `GuideApplication` Model**:
   - `id String @id @default(cuid())`
   - `userId String @unique` (relation to User)
   - `reportText String` (Why they want to be a guide + credentials info)
   - `documentUrl String?` (URL of the uploaded PDF via Cloudinary)
   - `status GuideStatus @default(PENDING)`
   - `createdAt DateTime @default(now())`
   - `updatedAt DateTime @updatedAt`

4. **Create `GuidanceSession` Model**:
   - `id String @id @default(cuid())`
   - `userId String` (relation to User - the seeker)
   - `guideId String` (relation to User - the guide)
   - `status SessionStatus @default(PENDING)`
   - `isDetailsShared Boolean @default(false)` (tracks if user shared personal details/number)
   - `createdAt DateTime @default(now())`
   - `updatedAt DateTime @updatedAt`
   - Unique constraint on `[userId, guideId]` if we want only one active session per pair.

5. **Create `GuidanceMessage` Model**:
   - `id String @id @default(cuid())`
   - `sessionId String` (relation to GuidanceSession)
   - `senderId String` (relation to User)
   - `content String`
   - `createdAt DateTime @default(now())`

6. **Action**: Run `bun prisma format` and `bun prisma migrate dev --name add_guidance_feature`.

---

## Phase 2: Backend APIs & Controllers

**New Files**: 
- `backend/routes/guidance.routes.ts`
- `backend/controllers/guidance.controller.ts`

**1. Guidance Application & Discovery API**:
   - `POST /api/guidance/apply`: Authenticated user submits `reportText` and uploads a PDF (reusing the existing upload middleware to Cloudinary). Creates/updates a `GuideApplication` and changes `User.guideStatus` to `PENDING`.
   - `GET /api/guidance/guides`: Fetch all users where `isGuide = true`. Returns public profiles, titles, and bios.
   - `GET /api/guidance/guides/:id`: Fetch specific guide profile.

**2. Session Management API** (in `guidance.controller.ts`):
   - `POST /api/guidance/request`: User requests a session with a `guideId`. Creates `GuidanceSession` with `PENDING` status.
   - `GET /api/guidance/sessions/incoming`: For guides to see incoming `PENDING` requests.
   - `PATCH /api/guidance/sessions/:sessionId/respond`: Guide accepts or rejects user request (Update status to `ACCEPTED` or `REJECTED`).
   - `GET /api/guidance/sessions`: Gets active `ACCEPTED` sessions for the current user (works for both guide and standard user).
   - `GET /api/guidance/sessions/:sessionId/messages`: Pagination/fetch history for `GuidanceMessage`.
   - `PATCH /api/guidance/sessions/:sessionId/share-details`: User toggles sharing personal details (sets `isDetailsShared = true`), which allows the guide to see the user's phone number.

**3. Admin API** (Update `backend/controllers/admin.controller.ts` and `admin.routes.ts`):
   - `GET /api/admin/guide-applications`: List all `PENDING` guide applications.
   - `PATCH /api/admin/guide-applications/:id`: Admin approves/rejects application. If approved, update `User.isGuide = true` and `User.guideStatus = APPROVED`.
   - `DELETE /api/admin/guides/:userId`: Admin revokes guide access `User.isGuide = false`.

**4. Real-time Chat/Sockets** (Update `backend/index.ts` / socket logic):
   - Create new socket events: `join_guidance_session`, `send_guidance_message`, `receive_guidance_message`.
   - Ensure users are part of the `GuidanceSession` before granting socket room entry.
   - Save messages to `GuidanceMessage` model immediately upon receive, then emit to the room.

---

## Phase 3: Frontend Interface

**New Files & Directory Structure**:
- `frontend/src/app/guidance/`
- `frontend/src/app/admin/guides/`

**1. Types & Services**:
   - `frontend/src/types/guidance.ts`: Define `Guide`, `GuidanceSession`, `GuidanceMessage` interfaces.
   - `frontend/src/services/guidance.service.ts`: Axios calls for applying, requesting, responding, and fetching.

**2. Pages for Standard Users**:
   - `/guidance/page.tsx`: Directory grid showing Verified Guides. Search and filter capabilities.
   - `/guidance/[guideId]/page.tsx`: Detailed view of a guide. Includes user reviews (if any), bio, and a "Request Guidance" button.
   - `/guidance/apply/page.tsx`: Application form. Dropzone for PDF credentials and a text area for the report.

**3. Dashboard for Sessions**:
   - `/profile/guidance/page.tsx` (or a tab in the existing profile):
     - For Standard Users: Shows "My Guides" (Accepted sessions) and "Pending Requests".
     - For Guides: Shows "Incoming Requests" (with Accept/Decline buttons) and "My Seekers" (Active sessions).

**4. 1-on-1 Session Space**:
   - `/guidance/session/[sessionId]/page.tsx`:
     - **Chat UI**: Built similarly to the existing chat but bounded to this session ID. Connects to the new socket events.
     - **Header/Sidebar**: Shows the other person's profile info.
     - **Details Sharing**: A button for the user "Share Personal Details". Once clicked, reveals the user's `phoneNumber` to the guide.
     - **Call Button**: Visible if details are shared. Clicking it natively triggers a `<a href="tel:...">` protocol to launch the device's phone dialer.
     - **Report Button**: Uses the existing application Report modal, targeting the guide's User ID.

**5. Admin Panel**:
   - `/admin/guides/page.tsx`: Admin view. Table containing pending applications with a link to view the uploaded PDF, and standard Approve/Reject buttons.
   - Tab for "Active Guides" with a "Revoke Status" button.

---

## Technical Considerations & Security
1. **Privacy**: Ensure standard `Message` APIs cannot read `GuidanceMessage` queries. Validate that `req.user.id` is either the `userId` or `guideId` of the `GuidanceSession` before returning messages.
2. **Admin Blind Spot**: Admins must not have an API endpoint to view `GuidanceMessage` arrays to maintain 1-on-1 privacy, unless explicitly required for report resolution in the future.
3. **Storage**: The PDF credentials should be uploaded via the existing file upload endpoint (`/api/upload`) returning a secure Cloudinary URL.
