# 🌙 Moonlit Violet Vault

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)

**A personal media management sanctuary for movies, TV series, books, and recipes.**
*Built as a portfolio piece — clean architecture, cute violet aesthetics, smart data pipelines all entirely within Next.js.*

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Setup](#-setup)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎬 **Movie Tracker** | Browse, filter and rate your movie collection |
| 📺 **Series Tracker** | Track ongoing and completed TV series with episode-level precision |
| 📚 **Book Vault** | Import from Goodreads CSV with full metadata enrichment |
| 🍳 **Recipe Vault** | Track recipes, ingredients, and instructions (paste URLs directly!) |
| 📊 **Vault Wrapped** | Spotify-style animated analytics & presentation of your media consumption |
| 🪄 **In-App Import** | Upload Goodreads CSVs directly in the browser with real-time progress |
| 🔍 **Smart Match Fixer** | Manually fix bad API matches with Google Books + OpenLibrary fallbacks |
| 📸 **Magic AI Scanner** | Upload a book spine photo → AI extracts media titles automatically via Gemini |
| ⭐ **Favorites Carousel** | Highlight your favorite items in a sleek horizontal swipeable carousel |
| 📱 **Progressive Web App** | Install natively on iOS, Android, and Desktop with offline support |
| ⚡ **Command Palette** | Press `Ctrl+K` for global instant search and navigation |
| 🤏 **Native Gestures** | Horizontal list layout with iOS-style swipe actions (Swipe to delete/progress) |
| 🌙 **Violet Aesthetic** | Soft violet/lilac/lunar dark-mode design with glassmorphism and Markdown support |
| 🔒 **Private Vault** | Google OAuth + email whitelist — only you can enter |

---

## 🛠 Tech Stack

### Frontend & Backend (Next.js App Router)
- **[Next.js 16](https://nextjs.org/)** (React Server Components, Server Actions, Route Handlers)
- **[React 19](https://react.dev/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)** — CSS-first theme with `@theme` block
- **TypeScript 5** with strict mode
- **Bricolage Grotesque** + **Geist** display & body fonts

### External APIs & Integrations
- **[TMDB API](https://developer.themoviedb.org/)** — movie & series metadata
- **[Google Books API](https://developers.google.com/books)** & **[OpenLibrary](https://openlibrary.org/)** — book metadata and covers
- **[Google Gemini Vision](https://ai.google.dev/)** — AI OCR title extraction from images
- **[Supabase](https://supabase.com/)** — PostgreSQL Database, Authentication, and `@supabase/ssr`

---

## 🏛 Architecture

This project follows **Clean Architecture** principles, strictly separating concerns across layers entirely within Next.js:

```text
┌───────────────────────────────────────────────────────┐
│                    UI Layer (app/)                    │
│   Pages (RSC) → use Server Components by default      │
│   'use client' only for interactive leaf components   │
└──────────────────────┬────────────────────────────────┘
                       │ mutations call
┌──────────────────────▼────────────────────────────────┐
│             Server Actions (lib/actions/)             │
│   Form handling, OCR processing, CSV parsing          │
└──────────────────────┬────────────────────────────────┘
                       │ logic calls
┌──────────────────────▼────────────────────────────────┐
│              Services Layer (lib/services/)           │
│   Business logic: filtering, stats, aggregation       │
│   Zero direct database imports                        │
└──────────────────────┬────────────────────────────────┘
                       │ data calls
┌──────────────────────▼────────────────────────────────┐
│           Repository Layer (lib/repositories/)        │
│   Single source of truth for all DB queries           │
│   Returns typed MediaItem objects                     │
└──────────────────────┬────────────────────────────────┘
                       │ db calls
┌──────────────────────▼────────────────────────────────┐
│          Supabase Client Layer (lib/supabase/)        │
│   server.ts  — RSC & Route Handlers (cookie-aware)    │
│   client.ts  — Client Components (browser singleton)  │
└───────────────────────────────────────────────────────┘
```

**Rules:**
- Pages are thin — they call services and pass data to components
- Components never import Supabase directly
- `'use client'` is used only when browser APIs or state are genuinely needed
- Auth is enforced at two levels: `proxy.ts` middleware (all routes) + Supabase RLS (database)

---

## 🎨 Design System

The **Moonlit Violet Vault** aesthetic is defined entirely in `globals.css` using Tailwind v4's CSS-first `@theme` block.

- **Glassmorphism** — `.glass-card` utility: `backdrop-filter: blur(12px)` with semi-transparent backgrounds
- **Violet radial glow** — ambient background glow via `radial-gradient` on `body`
- **Soft shadows** — `--shadow-card`, `--shadow-glow-*` custom shadow tokens

---

## 🚀 Setup

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com/) project
- API keys for [TMDB](https://developer.themoviedb.org/), [Google Books](https://developers.google.com/books/docs/v1/using#APIKey), and [Google AI Studio (Gemini)](https://aistudio.google.com/)

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the example environment file and fill in your keys:

```bash
cp .env.example .env
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com/)
2. In **SQL Editor**, run the migration script located in `supabase/migrations/`
3. In **Authentication → Providers**, enable **Google** OAuth
4. Add your Supabase URL and keys to `.env`

### 4. Configure Google OAuth & Whitelist

In [Supabase Auth Settings](https://supabase.com/dashboard/project/_/auth/providers):
- Add your Google OAuth client ID and secret
- Set redirect URL to your project domain or localhost

In `.env`, set `ALLOWED_EMAIL=your.email@gmail.com` to lock the vault to yourself.

### 5. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 📁 Project Structure

```text
moonlit-violet-vault/
├── src/
│   ├── app/
│   │   ├── (vault)/          # Protected route group (dashboard + galleries)
│   │   ├── auth/callback/    # OAuth callback Route Handler
│   │   └── login/            # Public login page
│   ├── components/           # UI, Media, Layout, and Auth components
│   ├── lib/
│   │   ├── actions/          # Server Actions (mutations, OCR, imports)
│   │   ├── repositories/     # Database access (mediaRepository.ts)
│   │   ├── services/         # Business logic (mediaService.ts)
│   │   ├── supabase/         # Supabase clients & types
│   │   └── utils/            # formatters.ts
│   └── proxy.ts              # Auth + email whitelist enforcement
├── supabase/migrations/      # SQL schema
└── docs/                     # Generated TypeDoc site
```

---

## 📚 Documentation

The entire codebase is strictly documented using JSDoc (with `@file` headers on every file). You can generate a beautiful static HTML site to browse the architecture:

```bash
npm run docs          # Generates docs in the /docs folder
```
*Open `docs/index.html` in your browser to view the interactive codebase documentation.*

---

## 🧹 Code Quality

```bash
npm run lint          # ESLint
npm run type-check    # TypeScript strict mode
npm run format        # Prettier (auto-fix)
npm run format:check  # Prettier (CI check)
```

---

## 📄 License

MIT — feel free to fork and build your own vault 🌙

## 🗃️ Database Migrations

This project uses Supabase migrations for schema versioning. The migrations are executed sequentially:

### 001_initial_schema.sql
Initial Database Schema. Configures the base media_items table, custom enums (media_type, media_status), UUID generation, Row Level Security (RLS) policies, and timestamp update triggers.

### 002_add_progress_tracking.sql
Adds progress tracking columns to media_items. Specifically adds is_favorite, pages_read, total_pages, episodes_seen, and reading_time_minutes to support fine-grained progress logging.

### 003_add_season_progress.sql
Adds season-level tracking for TV series. Adds the seasons_seen integer column to track how many complete seasons a user has finished.

### 004_add_last_synced_at.sql
Adds the last_synced_at timestamp column. This tracks when a media item (usually an ongoing TV series) was last updated from external APIs (like TMDB).

### 005_add_series_status.sql
Adds the series_status string column. Used to track whether a TV series is Returning Series, Ended, or Canceled from TMDB.

### 006_add_reading_journal.sql
Adds the reading_journal JSONB column. Stores an array of journal entries (dates and notes) for logging daily thoughts while reading a book.

### 007_add_tags_and_sort_order.sql
Adds custom categorization and ordering. Introduces the tags text array for custom labeling, and sort_order integer for manual drag-and-drop ordering.

### 008_add_recipes.sql
Expands the vault to support Recipes. Updates the media_type enum to include recipe, adds cooking statuses to media_status, and adds ingredients and instructions JSONB arrays.

### 009_add_performance_indexes.sql
Database Optimization. Creates B-Tree and GIN indexes on frequently queried columns (user_id, type, status) to optimize read performance for large vaults.

