# 🌿 SpiritualConnect

A Digital Sanctuary for Modern Seekers. SpiritualConnect is a full-stack community platform designed to foster deep connections, shared wisdom, and personal growth through a "Sacred" design language and AI-powered spiritual guidance.

---

## 🌟 Key Features

### 🏛️ The Sanctuary (Social Feed)
- **Reflections**: Share thoughts, images, and videos in a serene, distraction-free feed.
- **Interactions**: Like, comment, and engage with others' spiritual journeys.
- **Personalized Feed**: Content tailored to your interests and joined Sanghas.

### 🧘 Sanghas (Topic-Based Groups)
- Join or create specialized spiritual circles (e.g., "Vedic Breathwork", "Advaita Vedanta").
- Participate in themed discussions and shared learning paths.

### 📜 Wisdom Chronicles (Blogs)
- Long-form wisdom shared by teachers and community members.
- Dynamic data fetching from a PostgreSQL database.

### 🗨️ Direct Presence (Real-Time Chat)
- **Presence Tracking**: See who is currently online in the sanctuary.
- **Private Messaging**: Real-time 1v1 conversations powered by Socket.IO.
- **Expanded Mode**: A focus-driven chat experience that scales to full-screen.

### 🧠 Vedic Oracle (AI Assistant)
- **Gemini-Powered**: Contextual spiritual guidance using Google's Gemini 1.5/2.0 models.
- **Intentional Conversations**: Seekers can ask deep questions and receive thoughtful, AI-curated responses.

### 🛡️ Admin Sanctuary
- Comprehensive dashboard for managing users, communities, posts, and analytics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind CSS (Sacred Design System)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Data Fetching**: React Query (TanStack)

### Backend
- **Runtime**: Bun
- **Framework**: Express (v5)
- **Database**: PostgreSQL 15 (Dockerized)
- **ORM**: Prisma
- **Real-Time**: Socket.IO
- **AI**: Google Generative AI (Gemini SDK)

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh)
- [Docker](https://www.docker.com/) & Docker Compose
- Node.js (v20+ recommended)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/RajAgarwal0108/SpiritualConnect.git
   cd SpiritualConnect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env # Add your DATABASE_URL, JWT_SECRET, and GEMINI_API_KEY
   bun install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   bun install
   ```

4. **Database & Services**
   ```bash
   # Start PostgreSQL via Docker
   docker-compose -f ../docker/docker-compose.yml up -d

   # Run Migrations & Seed Data
   cd ../backend
   bunx prisma migrate dev
   bun prisma/seed.ts
   ```

5. **Start Development Servers**
   ```bash
   # In backend/
   bun run dev

   # In frontend/
   bun run dev
   ```

---

## 🎨 Design Philosophy: "The Sacred Design System"
SpiritualConnect follows a "Sacred Minimalist" aesthetic:
- **Palette**: Sacred Beige, Gold, and Earthy Text tones.
- **Typography**: Elegant serifs for wisdom (Header) and clean sans-serifs for utility.
- **Motion**: High-tension, smooth springs (`[0.16, 1, 0.3, 1]`) to mimic natural patterns.
- **Focus**: High contrast between active content and the calming background.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with intention by [Raj Agarwal](https://github.com/RajAgarwal0108).
