# 🌙 Moonlit Violet Vault

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)

**A personal media management sanctuary for movies, TV series, franchises, books, and recipes.**  
_Built with clean architecture, cute violet aesthetics, and smart AI data pipelines — all entirely within Next.js._

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Setup](#-setup) · [Project Structure](#-project-structure) · [Database Migrations](#-database-migrations)

</div>

---

## ✨ Features

| Feature                         | Description                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 🪐 **Franchise Sagas**          | Chronological viewing checklists for Marvel, DC, and custom sagas with Gemini AI sync & vault linking   |
| 🎬 **Movie Tracker**            | Browse, rate, and filter movies with collapsible tag/genre trays, director tracking & TMDB refresh      |
| 📺 **Series Tracker**           | Track ongoing and completed TV series with episode-level precision, creator credits & auto-syncing     |
| 📚 **Book Vault**               | Import from Goodreads CSV with full metadata enrichment & live reading stopwatch                        |
| 🍳 **Recipe Vault**             | Track recipes, ingredients, and instructions (paste URLs directly!)                                     |
| 📊 **Vault Wrapped**            | Spotify-style animated analytics & presentation of your media consumption                               |
| 🪄 **In-App Import**            | Upload Goodreads CSVs directly in the browser with real-time progress                                   |
| 🔍 **Smart Match Fixer**        | Manually fix bad API matches with Google Books + OpenLibrary fallbacks                                  |
| 📸 **Magic AI Scanner**         | Upload media covers or spine photos → multi-model Gemini OCR extracts titles automatically              |
| ⭐ **Favorites Carousel**       | Highlight your favorite items in a sleek horizontal swipeable carousel                                  |
| 📱 **Progressive Web App**      | Install natively on iOS, Android, and Desktop with offline support                                      |
| ⚡ **Command Palette**          | Press `Ctrl+K` for global instant search and quick navigation across all galleries                      |
| 🏷️ **Clean Tag & Genre Filtering** | Collapsible tag bar aggregating both custom tags and official genres without clutter                |
| 🤏 **Native Gestures**          | Horizontal list layout with iOS-style swipe actions (Swipe to delete/progress)                          |
| 🌙 **Dual Theme Aesthetic**     | Moonlit Violet Dark Craft mode & Warm Paper Craft Light mode with seamless theme toggling               |
| 🔒 **Private Vault**            | Google OAuth + email whitelist — only you can enter                                                     |

---

## 🛠 Tech Stack

### Frontend & Backend (Next.js App Router)

- **[Next.js 16](https://nextjs.org/)** (React Server Components, Server Actions, Route Handlers, Turbopack)
- **[React 19](https://react.dev/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)** — CSS-first theme with `@theme` block
- **[Material UI v9](https://mui.com/)** — `@mui/material`, `@mui/x-date-pickers`, `@mui/icons-material` with unified theme bindings
- **[Recharts](https://recharts.org/)** — interactive distribution and status overview charts
- **[Framer Motion](https://www.framer.com/motion/)** — swipe gestures, animations, and transitions
- **TypeScript 5** with strict mode
- **Bricolage Grotesque** + **Geist** display & body fonts

### External APIs & Integrations

- **[TMDB API](https://developer.themoviedb.org/)** — movie & TV series metadata, director/creator credits, high-res posters, and episode airing status
- **[Google Books API](https://developers.google.com/books)** & **[OpenLibrary](https://openlibrary.org/)** — book metadata, ISBN resolution, and covers
- **[Google Gemini Vision & Generative Models](https://ai.google.dev/)** (`gemini-3.8-flash` fallback chain) — AI OCR title extraction and generative franchise slate generation
- **[Supabase](https://supabase.com/)** — PostgreSQL Database, Authentication, Row Level Security, and `@supabase/ssr`

---

## 🏛 Architecture

This project follows **Clean Architecture** principles, strictly separating concerns across layers entirely within Next.js:

```text
┌────────────────────────────────────────────────────────┐
│                    UI Layer (app/)                     │
│   Pages (RSC) → use Server Components by default       │
│   'use client' only for interactive leaf components    │
└──────────────────────┬─────────────────────────────────┘
                       │ mutations call
┌──────────────────────▼─────────────────────────────────┐
│             Server Actions (lib/actions/)              │
│   Form handling, OCR processing, franchise syncing     │
└──────────────────────┬─────────────────────────────────┘
                       │ logic calls
┌──────────────────────▼─────────────────────────────────┐
│              Services Layer (lib/services/)            │
│   Business logic: filtering, stats, aggregation        │
│   Zero direct database imports                         │
└──────────────────────┬─────────────────────────────────┘
                       │ data calls
┌──────────────────────▼─────────────────────────────────┐
│           Repository Layer (lib/repositories/)         │
│   Single source of truth for all DB queries            │
│   Returns typed MediaItem objects                      │
└──────────────────────┬─────────────────────────────────┘
                       │ db calls
┌──────────────────────▼─────────────────────────────────┐
│          Supabase Client Layer (lib/supabase/)         │
│   server.ts  — RSC & Route Handlers (cookie-aware)     │
│   client.ts  — Client Components (browser singleton)   │
└────────────────────────────────────────────────────────┘
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
- **Unified Headers** — Consistent `PageHeader` with violet gradient typography and signature handwriting accents across all vaults

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

Key environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project access
- `ALLOWED_EMAIL` — Whitelisted email for Google OAuth vault lock
- `TMDB_API_KEY` — Movie, TV series, director credits, and artwork sync
- `GEMINI_API_KEY` — Image OCR book spine parsing & AI franchise slate generation
- `CRON_SECRET` — Authorization token for background sync endpoints

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com/)
2. In **SQL Editor**, run the migration scripts located sequentially in `supabase/migrations/`
3. In **Authentication → Providers**, enable **Google** OAuth
4. Add your Supabase URL and keys to `.env`

### 4. Configure Google OAuth & Whitelist

In [Supabase Auth Settings](https://supabase.com/dashboard/project/_/auth/providers):

- Add your Google OAuth client ID and secret
- Set redirect URL to your project domain or `http://localhost:3000/auth/callback`

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
│   │   ├── (vault)/             # Protected route group
│   │   │   ├── franchises/      # Franchise hub & chronological viewing checklists
│   │   │   ├── movies/          # Movie gallery, director credits, and refresh
│   │   │   ├── series/          # TV series gallery and season progress trackers
│   │   │   ├── books/           # Bookshelf and reading session stopwatch
│   │   │   ├── recipes/         # Recipe vault and cooking guides
│   │   │   └── analytics/       # Vault Wrapped charts and insights
│   │   ├── api/
│   │   │   └── cron/sync-series # Automated background sync for series & movies
│   │   ├── auth/callback/       # OAuth callback Route Handler
│   │   └── login/               # Public login page
│   ├── components/              # UI, Media, Franchises, Layout, and Auth components
│   │   ├── franchises/          # Checklists, AI generation modals, and index views
│   │   ├── media/               # MediaDetail, TabbedDashboard, SwipeableItem
│   │   └── layout/              # Navbar, CommandPalette, PageHeader, ThemeToggle
│   ├── data/
│   │   └── franchises/          # Master viewing checklists (MCU, DC) & markdown parsers
│   ├── lib/
│   │   ├── actions/             # Server Actions (franchiseAiActions, mediaActions, ocrActions)
│   │   ├── repositories/        # Database access (mediaRepository.ts)
│   │   ├── services/            # Business logic (mediaService.ts)
│   │   ├── supabase/            # Supabase clients & typed database schemas
│   │   └── utils/               # formatters.ts
│   └── proxy.ts                 # Auth + email whitelist enforcement
├── supabase/migrations/         # SQL schemas (001_initial_schema through 010_create_franchises_table)
└── docs/                        # Generated TypeDoc documentation site
```

---

## 🔄 Background Sync & Automation

The Vault automatically keeps media metadata fresh:

- **Automated Series & Movie Sync**: [`/api/cron/sync-series`](file:///c:/Users/Utilizador/Documents/moonlit-violet-vault/src/app/api/cron/sync-series/route.ts) periodically refreshes TV air dates, next episodes, season progress, and movie director credits via TMDB.
- **Client Heartbeat Trigger**: `AutoSyncTrigger` fires a low-overhead background ping a few seconds after initial vault load.
- **On-Demand Single Refresh**: Refresh individual movies or series directly from their detail pages at any time.

---

## 📚 Documentation

The entire codebase is strictly documented using TSDoc / JSDoc standards. You can generate a static HTML site to browse the architecture:

```bash
npm run docs          # Generates docs in the /docs folder
```

_Open `docs/index.html` in your browser to view the interactive codebase documentation._

---

## 🧹 Code Quality

```bash
npm run lint          # ESLint
npm run type-check    # TypeScript strict mode
npm run format        # Prettier (auto-fix)
npm run format:check  # Prettier (CI check)
```

---

## 🗃️ Database Migrations

This project uses Supabase migrations for schema versioning. The migrations are executed sequentially:

### `001_initial_schema.sql`
Initial Database Schema. Configures the base `media_items` table, custom enums (`media_type`, `media_status`, `ingestion_source`), UUID generation, Row Level Security (RLS) policies, and timestamp update triggers.

### `002_add_progress_tracking.sql`
Adds progress tracking columns to `media_items`: `is_favorite`, `pages_read`, `total_pages`, `episodes_seen`, and `reading_time_minutes`.

### `003_add_season_progress.sql`
Adds season-level tracking for TV series (`seasons_seen` integer column).

### `004_add_last_synced_at.sql`
Adds the `last_synced_at` timestamp column to track external API synchronization status.

### `005_add_series_status.sql`
Adds the `series_status` string column to track whether a TV show is Returning, Ended, or Canceled.

### `006_add_reading_journal.sql`
Adds the `reading_journal` JSONB column for logging daily thoughts while reading.

### `007_add_tags_and_sort_order.sql`
Adds custom categorization and ordering: `tags` text array and `sort_order` integer.

### `008_add_recipes.sql`
Expands the vault to support Recipes: adds `recipe` to `media_type`, adds cooking statuses, ingredients, and instructions.

### `009_add_performance_indexes.sql`
Database Optimization: creates B-Tree and GIN indexes on frequently queried columns (`user_id`, `type`, `status`, `date_added`, `is_favorite`).

### `010_create_franchises_table.sql`
Custom Franchises & Sagas Schema: creates the `franchises` table for storing user-created cinematic universes and dynamic viewing checklists with RLS policies and auto-updated timestamps.

---

## 📄 License

MIT — feel free to fork and build your own vault 🌙
