# 🌿 Sacred • Apple-Inspired Design System

A Digital Sanctuary for Modern Seekers

⸻

## 🎯 Role & Expertise

Principal Frontend Architect & Product Designer
Specialized in:
- Apple Human Interface Guidelines
- Calm Technology
- Spiritual Minimalism
- Long-form reading & contemplative UX
- Modern community platforms (Apple Books × Notion × Circle)

This system prioritizes clarity, reverence, and readability over engagement hacks.

⸻

## 🧠 Product Vision

### The Platform Is a Sanctuary, Not a Feed

This is not social media.
This is a place to arrive, slow down, and stay.

### Core Emotional Outcomes
- Calm on entry
- Focus while reading
- Reflection after interaction
- Trust over time

### Design Keywords
Sacred · Breathable · Human · Premium · Quiet · Intentional

⸻

## �️ Design Constitution (Non-Negotiable)

### 1. Apple Design System — Structure & Logic

**Visual Hierarchy**
- One dominant focal point per screen
- Headings lead the eye, not icons
- No competing CTAs on the same plane

**Whitespace as Architecture**
- Padding is not decoration; it is structure
- Default spacing is 2× typical SaaS
- Content never touches edges emotionally or visually

**Depth & Elevation**
- No hard borders as default
- Depth communicates importance:
  - Feed cards: subtle
  - Modals: deeper
  - Navigation: layered with blur

**Corner Language**
- Containers: `rounded-4xl` (sanctuary feeling)
- Interactive elements: `rounded-2xl`
- Never mix sharp and soft arbitrarily

**Blur & Glass**
Used only for:
- Header / Navigation
- Contextual overlays
- Modals
*Never for content cards.*

⸻

### 2. Spiritual Minimalism — Aesthetic Language

**Color System (Sacred, Not Trendy)**
- **Base**: `sacred-beige` → `#F9F7F2` (Used as canvas, never pure white)
- **Text**:
  - Primary: `#5C5445` (earth charcoal)
  - Secondary: `#8E8675`
  - Muted: `rgba(92,84,69,0.55)`
- **Accent**: `Sacred Gold` `#D9A05B` (Rule: Appears only when something matters)
- **Borders**: Rare. If used: `#E9E4DB` at 8–12% opacity.

⸻

### 3. Typography System — Modern Mind, Ancient Soul

**Headings (Modern Clarity)**
- **Font**: Geist / Inter / SF Pro-like
- **Weight**: 300–400
- **Tracking**: slightly negative
- **Purpose**: orientation, not decoration

**Body Text (Wisdom & Reading)**
- **Font**: Cormorant Garamond
- **Line height**: 1.7–1.9
- **Font size**:
  - Desktop: 17–18px
  - Mobile: 16px
  - Optimized for long reading sessions

*If text is hard to read, the UI has failed.*

⸻

## 🧭 Global Layout System

**Page Width & Rhythm**
- Max content width: 720–860px for reading
- Feeds centered, never stretched
- Vertical rhythm units:
  - Section gaps: 96px / 128px
  - Internal spacing: 24px / 32px

⸻

## 🧩 Header & Navigation (Major Upgrade)

**Desktop Header**
- Floating, blurred (`backdrop-blur-xl`)
- Minimal height
- Left: Logo + Essence
- Center: Nothing (emptiness is intentional)
- Right: Search (pill, subtle), Profile avatar
*No icon clutter.*

**Responsive Header (Critical)**
- **Tablet & Mobile**: Navigation collapses into a 3-dot menu
- **Three-dot menu contains**: Explore, Community, Courses, Reflections, Settings
*This prevents cognitive overload.*

> **Rule**: When space compresses, options hide — meaning remains.

⸻

## 📰 Post & Reflection Card System (Deep Redesign)

**Card Philosophy**
*A post is a reflection, not a status update.*

**Card Size & Positioning**
- Cards are wider and taller
- More breathing room vertically
- Centered, never grid-dense
- Maximum 2 cards visible at once

**Card Anatomy**
- **Top**: Author name (serene, small), Date (muted, secondary)
- **Body**: Large readable text, no truncation by default. Quotes and wisdom emphasized with spacing, not color.
- **Bottom Actions**: Icons hidden until hover/focus. Slow fade-in (700ms). No counts screaming for attention.

**Interaction**
- **Hover**: Slight lift (`translate-y-1.5`), Shadow deepens gently.
- **Click**: Card expands softly, Focus mode activates (dim surroundings).

⸻

## 🧘 Content Density Rules (Very Important)
- Never show more than:
  - 2 reflections per viewport
  - 1 question headline per block
- Long content opens in reading mode
- **Reading mode removes**: Sidebar, Navigation distractions, Feed noise

⸻

## 🗂️ Section Division System

Each section must feel like a chapter, not a scroll.

**Example Sections**:
- Reflections for Today
- Questions from Seekers
- Paths of Study
- Wisdom from the Community

**Each section**:
- Has its own vertical space
- Soft divider via spacing, not lines
- Clear title + short subtitle

⸻

## 🎞️ Motion & Interaction System

**Timing**
- Default transition: 700ms
- Sacred easing: `cubic-bezier(0.16, 1, 0.3, 1)`

**Motion Rules**
- No bounce, no elastic, no playful effects.
- Motion should feel like breathing, not clicking.

⸻

## ⚙️ Tailwind v4 Design Tokens (Production-Ready)

```css
--color-sacred-beige: #F9F7F2;
--color-sacred-gold: #D9A05B;
--color-sacred-text: #5C5445;
--color-sacred-muted: #8E8675;
--color-sacred-border: rgba(233,228,219,0.4);
--ease-sacred: cubic-bezier(0.16, 1, 0.3, 1);
```

⸻

## ✅ Execution Roadmap (Refined)
1. [x] **Global Foundation**: Fonts, Color tokens, Smooth scrolling, Text rendering.
2. [ ] **Header & Navigation**: Blur, 3-dot responsive collapse, Search refinement.
3. [x] **Card System**: Reflection cards, Question cards, Reading mode (Home Page Card Refactored).
4. [ ] **Section Architecture**: Chapter-like divisions, Vertical rhythm enforcement.
5. [ ] **Final Polish**: Dark mode (warm, not black), Accessibility audit, Motion refinement.

⸻

## 🕊️ Final Design Principle
*If a user scrolls slower after 10 seconds — the design is working.*

