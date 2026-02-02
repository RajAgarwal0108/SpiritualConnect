# 🦅 High-Level Design (HLD) Document
**Project:** SpiritualConnect  
**Version:** 1.0  
**Status:** Active Development

---

## 1. Executive Summary
SpiritualConnect is a "Digital Sanctuary" designed to provide a distraction-free, spiritually aligned social platform. Unlike traditional social media, it focuses on deep connection ("Sangha"), shared wisdom ("Chronicles"), and intentional communication. The platform integrates modern real-time capabilities with AI-powered spiritual guidance (Vedic Oracle).

## 2. Goals & Objectives
*   **Sanctuary First:** Design a UI that reduces anxiety and promotes focus (Sacred Design System).
*   **Community Centric:** Facilitate topic-based groups (Sanghas) rather than just algorithmic feeds.
*   **Wisdom Preservation:** Allow long-form content (Blogs/Chronicles) to coexist with short updates.
*   **Real-Time Presence:** Foster a sense of "being there" with others via live chat and presence indicators.
*   **AI Guidance:** Provide context-aware spiritual advice using Generative AI.

## 3. User Roles
### 3.1 The Seeker (Standard User)
*   **Profile**: Can customize avatar, bio, and interests.
*   **Discovery**: Can join Sanghas, follow teachers, and view a personalized feed.
*   **Creation**: Can post reflections, write blogs, and comment.
*   **Interaction**: Can chat 1:1, like posts, and bookmark wisdom.

### 3.2 The Guide (Admin/Moderator)
*   **Oversight**: Can view analytics and manage user reports.
*   **Curation**: Can pin posts, feature blogs, and manage community standards.
*   **System**: Access to the Admin Dashboard for platform health monitoring.

## 4. Key Modules

### 🏛️ The Sanctuary (Social Feed)
The central hub where users see content from their joined communities and followed users.
*   **Flow**: User logs in -> Fetches Feed -> Infinite Scroll.
*   **Features**: Image/Video support, "Heart" reactions, Threaded comments.

### 🧘 Sanghas (Communities)
Dedicated spaces for specific spiritual topics (e.g., "Meditation", "Yoga", "Sufism").
*   **Structure**: Public or Private groups.
*   **Membership**: Users "Join" to see content in their main feed.

### 📜 Wisdom Chronicles (Blogs)
A rich-text publishing platform for deeper contemplation.
*   **Read**: Distraction-free reading mode.
*   **Write**: Markdown/Rich-text editor for publishing articles.

### 🗨️ Direct Presence (Chat)
A real-time messaging system.
*   **Modes**: 
    1. **Sidebar**: Quick collaborative chats.
    2. **Expanded**: Full-screen deep conversation mode.
*   **Presence**: "Online" indicators show who is currently actively meditating/reading.

### 🧠 Vedic Oracle (AI)
An integrated chatbot powered by Google Gemini.
*   **Capabilities**: Answer questions, suggest practices, summarize spiritual texts.
*   **Context**: Aware of the user's current reading or query.

## 5. User Journeys
1.  **Onboarding**: Register -> Select Interests -> Join 3 Recommended Sanghas -> Enter Sanctuary.
2.  **Morning Routine**: Check "Daily Wisdom" -> Meditate (Timer) -> Share Reflection.
3.  **Deep Dive**: Search for "Advaita" -> Read Blog Post -> Ask AI for clarification -> Discuss in Chat.
