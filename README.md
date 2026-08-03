# gastos-app

A personal expense tracker PWA: mobile-first quick expense entry, with a full analytics dashboard on desktop. Built for daily personal use, not just a portfolio demo.

## Stack

- **React + Vite** — app shell and dev tooling
- **Tailwind CSS** — utility-first styling, class-based dark mode
- **Supabase** — auth, database and storage (free tier)
- **react-i18next** — internationalization (Spanish / English), with a persisted manual language selector
- **Lucide React** — icons
- **Recharts** — charts (donut and line charts for the analytics dashboard)
- **Vercel** — target deployment platform

## Project structure

```
src/
├── components/
│   ├── mobile/
│   ├── desktop/
│   └── shared/
├── layouts/
│   ├── MobileLayout.jsx
│   └── DesktopLayout.jsx
├── hooks/
├── lib/
│   ├── supabaseClient.js
│   └── i18n.js
├── locales/
│   ├── es.json
│   └── en.json
├── pages/
└── App.jsx
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run the dev server

```bash
npm run dev
```

## Status

This is currently just the project skeleton (routing/layout detection, i18n, dark mode, Tailwind design tokens, Supabase client wiring). No business logic yet — no database schema, no expense form, no real charts, no category logic.
