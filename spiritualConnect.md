You are an expert full-stack architect and engineering lead.

I want a detailed implementation plan for building a **full-stack community platform** that has the following high-level goals:

1. A **social community platform** where users can:
   - Sign up, sign in, and manage their profiles.
   - Follow other users and build a social graph.
   - Discover, post, comment, like, and bookmark posts — both text and multimedia.
   - See an activity feed personalized to interests.
   - Join and create topic-based groups/spaces.
   - Find and connect with friends and mentors.
   - Participate in private and group chat.
   - Get real-time notifications.

2. It should be **inspired by platforms like Wisdom That Breathes** — with community spaces, themed discussions, and topic feed experiences.  [oai_citation:1‡Wisdom That Breathes](https://app.wisdomthatbreathes.com/spaces/21543260/feed)

3. Include an **AI-powered spiritual chatbot** that:
   - Answers user questions with deep contextual understanding.
   - Has access to curated knowledge resources on spiritual teachings.
   - Can guide users on ideas and content suggestions in discussions.
   - Can summarize long threads, recommend next steps, and refine user intentions.

For this request, produce a **structured implementation plan** including:

**A. Architecture Overview**
  - Proposed tech stack (frontend, backend, database, AI ecosystem).
  - Diagram of modules (auth, social feed, chat, AI service, moderation).
  - Communication patterns, APIs, and data flows.

**B. Backend Services**
  - Microservices or monolith plan.
  - REST/GraphQL schema design for core features.
  - Real-time layers (websockets / pub-sub).
  - Integration with search and recommendation.

**C. Frontend Roadmap (Web + Mobile)**
  - UI/UX framework choices.
  - Screens, navigation, state management, PWA support.
  - Accessibility and mobile-first considerations.

**D. Social Graph, Feed, and Discovery**
  - Data schema for social graph, posts, groups.
  - Algorithms for personalized feeds and trends.
  - Caching, pagination, offline support.

**E. Real-Time and Chat**
  - Technology for messaging (WebSockets, Socket.IO, Firebase, or similar).
  - Data persistence, schemas, and push notifications.

**F. Moderation, Safety, and Privacy**
  - Policies and tooling.
  - AI filters for toxicity, spam, and sensitive topics.

**G. LLM/AI Integration**
  - Choice of LLM framework (OpenAI, Anthropic, open models).
  - Prompting strategy and fine-tuning if needed.
  - Knowledge base architecture and vector search.
  - How AI answers questions in context of user posts.

**H. DevOps & Scalability**
  - CI/CD pipelines, testing strategy.
  - Microservices deployment, auto scaling, serverless options.

**I. Milestones + Timeline**
  - Phase 1 (MVP) feature list with estimates.
  - Phase 2 (Growth features) with engagement analytics, personalization, and recommended upsell capabilities.

Provide output in the following format:
- Overview narrative
- Architecture diagram description
- Sectioned plans (A–I)
- API design tables
- Example data models
- Sprint-by-sprint roadmap with timelines

**Required Resources from User:**
To proceed with the full implementation, please provide:
1.  **OpenAI API Key**: To power the AI Spiritual Assistant (RAG chatbot).
2.  **S3 Bucket / Cloud Storage Credentials**: For storing user avatars and post media (images/videos).
3.  **Database Connection String**: If you prefer a managed database (e.g., Supabase, Neon) over local Docker.
4.  **JWT Secret**: A secure random string for authentication tokens (or I can generate one).
5.  **Admin Credentials**: Desired initial email/password for the super-admin account.
6.  **Brand Assets**: Logo (SVG/PNG) and primary color palette hex codes (if different from default Indigo/Purple theme).

Do not write code, only the **implementation plan**.