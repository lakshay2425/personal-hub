# Personal Hub

A **local-first** personal toolkit for learning and career work. Capture project questions, log what you did, and track your job search — all stored in your browser. Nothing is sent to a server.

Installable as a Progressive Web App (PWA) and usable offline after the app shell has been cached.

**Live idea:** open it, use it, share the repo. No accounts, no analytics pipeline for your data.

## Features

| Tool | What it does |
|------|----------------|
| **Projects** | Inbox for questions; organize them into projects with titled answers |
| **Content Ideas** | Capture content ideas (standalone or per-project) with status and publish links |
| **Logger** | Timestamped daily entries — log multiple times per day |
| **Job Search Tracker** | Companies, leads, applications, cold emails, and a dashboard |

All feature data lives in **IndexedDB** (via [Dexie](https://dexie.org)). Separate databases keep each tool isolated.

## Tech stack

| Area | Details |
|------|---------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) |
| **Language** | TypeScript (strict) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Local storage** | IndexedDB via [Dexie](https://dexie.org) |
| **Forms / validation** | [react-hook-form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **PWA / offline** | [Serwist](https://serwist.pages.dev) (`@serwist/turbopack`) |
| **Notifications** | [react-hot-toast](https://react-hot-toast.com) |
| **Git hooks** | [Husky](https://typicode.github.io/husky/) — lint on commit, build on push |
| **CI** | GitHub Actions — lint + build on PRs / pushes to `master` |
| **Containerization** | Multi-stage Dockerfile with Next.js `output: "standalone"` |

- **Runtime:** Node.js 24  
- **Package manager:** [pnpm](https://pnpm.io) 10.x  

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> Service worker registration is disabled in development to avoid stale caches. Test install / offline behavior with a production build (`pnpm build` then `pnpm start`). HTTPS (or `localhost`) is required for PWA features.

## Available scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Project structure

```
app/                       # App Router pages, layouts, PWA glue
├── page.tsx               # Landing
├── projects/              # Projects + inbox UI
├── logger/                # Daily logger
├── job-search/            # Job search tracker routes
├── manifest.ts            # Web app manifest
├── sw.ts                  # Service worker (runtime cache + offline fallback)
├── serwist/[path]/        # Serves /serwist/sw.js
└── ~offline/              # Offline navigation fallback
components/                # App shell, sidebar, shared UI
features/
├── questions/             # Projects / questions / answers (Dexie)
├── content-ideas/         # Content ideas (shared question-hub-db)
├── logger/                # Log entries (Dexie)
└── job-search/            # Companies, leads, applications, emails (Dexie)
lib/site.ts                # Site name, description, keywords
public/icons/              # Install / maskable / Apple touch icons
```

## Privacy & data

- Data never leaves the device for storage or sync.
- Clearing site data / IndexedDB in the browser deletes your local records.
- There is no background sync and no centralized database for user content.
- The only server routes are app infrastructure (e.g. health check for Docker).
- For IndexedDB schemas, field types, and export formats, see [DATA.md](DATA.md).

## PWA overview

1. **HTTPS** — required for service workers (`localhost` is fine for local testing).
2. **Web app manifest** — [`app/manifest.ts`](app/manifest.ts) with `display: "standalone"` and icons under [`public/icons/`](public/icons/).
3. **Service worker** — Serwist builds and serves `/serwist/sw.js` from [`app/serwist/[path]/route.ts`](app/serwist/[path]/route.ts) + [`app/sw.ts`](app/sw.ts).

The service worker caches the app shell and static assets so the UI can load offline. It does **not** sync IndexedDB data anywhere.

### Offline behavior

- Visit key routes once while online so runtime caching can store them.
- After that, reloads and navigation between previously visited routes work offline.
- Uncached navigations fall back to [`app/~offline/page.tsx`](app/~offline/page.tsx).
- IndexedDB create / edit / delete continues to work offline once the JS shell is available.

### Architecture notes

**Runtime caching** (Serwist `defaultCache`) plus a small precache entry for `/~offline`, instead of full precaching of every hashed Next.js asset. Low install cost; routes become offline after first visit. A true cold start offline only guarantees the `/~offline` fallback.

**Per-build `randomUUID()`** for the offline fallback revision (instead of `git rev-parse HEAD`) so Docker Alpine builds do not need `git` installed. Each deploy still cache-busts that entry.

## Docker

```bash
docker build -t personal-hub .
docker run -p 3000:3000 personal-hub
```

The image includes a health check against `/api/health`. Serve behind HTTPS in production so install prompts and the service worker work on real devices.

## Contributing

Contributions are welcome — bug reports, docs, and pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, guidelines, and the PR process.

## License

This project is licensed under the [MIT License](LICENSE.txt).
