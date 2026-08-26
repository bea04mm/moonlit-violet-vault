# 🌙 Moonlit Violet Vault

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)
![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**A personal media management sanctuary for movies, TV series, and books.**
*Built as a portfolio piece — clean architecture, cute violet aesthetics, smart data pipelines.*

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Design System](#-design-system) · [Setup](#-setup) · [Data Pipeline](#-data-pipeline)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎬 **Movie Tracker** | Browse, filter and rate your movie collection |
| 📺 **Series Tracker** | Track ongoing and completed TV series |
| 📚 **Book Vault** | Import from Goodreads CSV with full metadata enrichment |
| 📸 **Screenshot OCR** | Drop an Instagram screenshot → AI extracts media titles automatically |
| 🌙 **Violet Aesthetic** | Soft violet/lilac/lunar dark-mode design with glassmorphism |
| 🔒 **Private Vault** | Google OAuth + email whitelist — only you can enter |
| 🐳 **Docker Ready** | Consistent dev & production environments |

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** (App Router, React Server Components)
- **[React 19](https://react.dev/)** with Server Actions
- **[Tailwind CSS v4](https://tailwindcss.com/)** — CSS-first theme with `@theme` block
- **[Supabase JS](https://supabase.com/docs/reference/javascript)** (`@supabase/ssr` for proper RSC cookie handling)
- **TypeScript 5** with strict mode
- **Bricolage Grotesque** + **Geist** display & body fonts

### Backend / Data Pipeline
- **Python 3.12** — modular CLI pipeline
- **[TMDB API](https://developer.themoviedb.org/)** — movie & series metadata
- **[Google Books API](https://developers.google.com/books)** — book metadata and covers
- **[Google Gemini Vision](https://ai.google.dev/)** / **[OpenAI GPT-4o Vision](https://platform.openai.com/)** — OCR title extraction from screenshots
- **Pandas** — Goodreads CSV processing
- **[Supabase Python](https://supabase.com/docs/reference/python/)** — database writes

### Infrastructure
- **[Supabase](https://supabase.com/)** (PostgreSQL + Auth + Row Level Security)
- **[Docker](https://docker.com/)** + Docker Compose
- **[Vercel](https://vercel.com/)** — frontend deployment
- **ESLint + Prettier** — automated code quality

---

## 🏛 Architecture

This project follows **Clean Architecture** principles, strictly separating concerns across layers:

```
┌───────────────────────────────────────────────────────┐
│                    UI Layer (app/)                    │
│   Pages (RSC) → use Server Components by default      │
│   'use client' only for interactive leaf components   │
└──────────────────────┬────────────────────────────────┘
                       │ calls
┌──────────────────────▼────────────────────────────────┐
│              Services Layer (lib/services/)           │
│   Business logic: filtering, stats, aggregation       │
│   Zero direct database imports                        │
└──────────────────────┬────────────────────────────────┘
                       │ calls
┌──────────────────────▼────────────────────────────────┐
│           Repository Layer (lib/repositories/)        │
│   Single source of truth for all DB queries           │
│   Returns typed MediaItem objects                     │
└──────────────────────┬────────────────────────────────┘
                       │ calls
┌──────────────────────▼────────────────────────────────┐
│          Supabase Client Layer (lib/supabase/)        │
│   server.ts  — RSC & Route Handlers (cookie-aware)    │
│   client.ts  — Client Components (browser singleton)  │
└───────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
components/
├── ui/           Primitive design-token components (Badge, Skeleton)
├── media/        Domain-specific components (MediaCard, MediaGrid)
├── layout/       App shell components (Navbar)
└── auth/         Auth-specific components (LoginButton, SignOutButton)
```

**Rules:**
- Pages are thin — they call services and pass data to components
- Components never import Supabase directly
- `'use client'` is used only when browser APIs or state are genuinely needed
- Auth is enforced at two levels: middleware (all routes) + Supabase RLS (database)

---

## 🎨 Design System

The **Moonlit Violet Vault** aesthetic is defined entirely in `globals.css` using Tailwind v4's CSS-first `@theme` block.

### Colour Palette

| Token | Value | Purpose |
|---|---|---|
| `--color-violet-500` | `#9d4dff` | Primary actions, glows, borders |
| `--color-lunar-950` | `#110e1f` | Page background |
| `--color-lunar-900` | `#1e1833` | Card backgrounds |
| `--color-blossom-400` | `#ff70ae` | Accent highlights, errors |
| `--color-starlight-400` | `#ffd966` | Star ratings |

### Key Design Principles
- **Glassmorphism** — `.glass-card` utility: `backdrop-filter: blur(12px)` with semi-transparent backgrounds
- **Violet radial glow** — ambient background glow via `radial-gradient` on `body`
- **Soft shadows** — `--shadow-card`, `--shadow-glow-*` custom shadow tokens
- **Micro-animations** — `float`, `shimmer`, `fadeIn`, `slideUp`, `glowPulse` keyframes
- **Rounded everything** — `rounded-2xl` / `rounded-3xl` everywhere

### Typography
- **Display** — Bricolage Grotesque (headings, titles)
- **Body** — Geist Sans (UI text)
- **Mono** — Geist Mono (code, IDs)

---

## 🚀 Setup

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker Desktop (optional, for containerised dev)
- A [Supabase](https://supabase.com/) project
- API keys for [TMDB](https://developer.themoviedb.org/), [Google Books](https://developers.google.com/books/docs/v1/using#APIKey), and [Google AI Studio](https://aistudio.google.com/) or [OpenAI](https://platform.openai.com/)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/moonlit-violet-vault.git
cd moonlit-violet-vault
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual keys
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com/)
2. In **SQL Editor**, run the migration:
   ```sql
   -- Copy and run supabase/migrations/001_initial_schema.sql
   ```
3. In **Authentication → Providers**, enable **Google** OAuth
4. Add your Supabase URL and keys to `.env`

### 4. Configure Google OAuth

In [Supabase Auth Settings](https://supabase.com/dashboard/project/_/auth/providers):
- Enable Google provider
- Add your Google OAuth client ID and secret
- Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

In `.env`, set `ALLOWED_EMAIL=your.email@gmail.com`

### 5. Run locally

```bash
npm run dev
# → http://localhost:3000
```

### 6. Run with Docker

```bash
# Frontend only
docker compose up frontend

# Run the data pipeline
docker compose --profile pipeline run pipeline --help
docker compose --profile pipeline run pipeline goodreads --file /data/library.csv
```

---

## 🔬 Data Pipeline

The Python pipeline lives in `data_pipeline/` and has three commands:

### Import from Goodreads

Export your library from Goodreads: *My Books → Export library* (downloads `library.csv`)

```bash
cd data_pipeline
pip install -r requirements.txt
python main.py goodreads --file path/to/library.csv
```

### Extract titles from screenshots (OCR)

Drop a screenshot (Instagram post, Letterboxd screencap, etc.):

```bash
python main.py ocr --image path/to/screenshot.jpg --type movie
```

The pipeline will:
1. Send the image to **Gemini Vision** (or GPT-4o)
2. Extract all visible media titles
3. Search TMDB/Google Books for metadata
4. Save enriched items to your Supabase vault

### Re-enrich an existing item

```bash
python main.py enrich --id <uuid-of-item>
```

### Switch VLM provider

```bash
# In .env:
VLM_PROVIDER=openai  # or gemini (default)
```

---

## 📁 Project Structure

```
moonlit-violet-vault/
├── src/
│   ├── app/
│   │   ├── (vault)/          # Protected route group (dashboard + galleries)
│   │   ├── auth/callback/    # OAuth callback Route Handler
│   │   └── login/            # Public login page
│   ├── components/
│   │   ├── auth/             # LoginButton, SignOutButton
│   │   ├── media/            # MediaCard, MediaGrid
│   │   ├── layout/           # Navbar
│   │   └── ui/               # Badge, Skeleton
│   ├── lib/
│   │   ├── supabase/         # server.ts, client.ts, database.types.ts
│   │   ├── repositories/     # mediaRepository.ts
│   │   ├── services/         # mediaService.ts
│   │   └── utils/            # formatters.ts
│   └── middleware.ts          # Auth + email whitelist enforcement
├── data_pipeline/
│   ├── ingestion/            # goodreads_parser.py, ocr_extractor.py
│   ├── enrichment/           # tmdb_client.py, google_books_client.py
│   ├── storage/              # supabase_repo.py
│   └── main.py               # CLI orchestrator
├── supabase/migrations/      # SQL schema
├── docker/                   # Dockerfiles
└── docker-compose.yml
```

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
