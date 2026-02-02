# 🏗️ System Architecture Document
**Project:** SpiritualConnect  
**Architecture Style:** Modular Monolith (Frontend) + Service-Oriented Backend

---

## 1. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 16 (React 19) | Server Components, SEO, robust routing. |
| **Styling** | Tailwind CSS v4 | Utility-first, strict design system enforcement. |
| **State** | Zustand | Lightweight, unopinionated global state. |
| **Backend Runtime** | Bun | High-performance JS runtime (faster startup/file IO). |
| **API Framework** | Express v5 | Mature ecosystem, ease of middleware integration. |
| **Database** | PostgreSQL 15 | Relational integrity, robust querying. |
| **ORM** | Prisma | Type-safe database access, auto-migrations. |
| **Real-Time** | Socket.IO | Bi-directional communication for Chat/Presence. |
| **AI Model** | Gemini 2.0 Flash | Low latency, high reasoning capability for spiritual context. |
| **Containerization** | Docker | Consistent dev/prod environments (Database). |

---

## 2. System Context Diagram

```mermaid
graph TD
    User[Seeker] -->|HTTPS/WSS| LB[Load Balancer / Nginx]
    LB -->|Next.js App| Frontend[Frontend Container]
    Frontend -->|API Calls / Socket| Backend[Backend Service (Bun)]
    
    subgraph "Data Layer"
        Backend -->|Prisma| DB[(PostgreSQL)]
        Backend -->|File System| Storage[Uploads / S3]
    end
    
    subgraph "External Services"
        Backend -->|REST| AI[Google Gemini API]
    end
```

---

## 3. Core Architectural Patterns

### 3.1 Authentication Flow
1.  **Stateless JWT**: Tokens are issued upon login.
2.  **Storage**: Tokens stored in browser `localStorage` (client) or HTTP-only cookies.
3.  **Transport**: Sent via `Authorization: Bearer` header.
4.  **Verification**: Middleware verifies signature before passing to controllers.

### 3.2 Real-Time Presence (The "Living Sanctuary")
*   **Pattern**: Pub/Sub via Socket.IO.
*   **Events**:
    *   `connection`: User maps to Socket ID.
    *   `user_online`: Server broadcasts updated roster.
    *   `send_message`: Server routes to Room or DM target.
*   **Service**: `PresenceService` maintains in-memory Map of active users for sub-millisecond lookups.

### 3.3 AI Integration (RAG-Lite)
*   **Current**: Direct API calls to Gemini with system prompts defining the "Vedic Persona".
*   **Future**: Vector Database (pgvector) to store blog/course content for RAG (Retrieval Augmented Generation).

---

## 4. Deployment Strategy

### 4.1 Docker Composition
*   **Service 1 (DB)**: `postgres:15-alpine` with persistent volume.
*   **Service 2 (Backend)**: Custom Node/Bun image, exposes port 3001.
*   **Service 3 (Frontend)**: Next.js Production build, exposes port 3000.

### 4.2 Scalability
*   **Vertical**: Increase memory for backend to handle more concurrent Socket connections.
*   **Horizontal**: 
    *   Stateless backend allows multiple instances behind a load balancer.
    *   Requires Redis Adapter for Socket.IO if scaling beyond one instance.

## 5. Security Measures
*   **Helmet**: Sets secure HTTP headers.
*   **CORS**: Restricted to frontend domain.
*   **Input Validation**: Zod schemas for all API payloads.
*   **Rate Limiting**: Express-rate-limit on Auth routes to prevent brute force.
