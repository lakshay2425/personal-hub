# Question Hub

A local-first Next.js app for capturing questions and tracking answered vs unanswered status. All question data lives in the browser via IndexedDB — there is no centralized database.

The app is a Progressive Web App (PWA): it can be installed to a device and used offline after the app shell has been cached.

## Tech stack

| Area | Details |
|------|---------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) |
| **Language** | TypeScript (strict mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Local storage** | IndexedDB via [`idb`](https://github.com/jakearchibald/idb) |
| **PWA / offline** | [Serwist](https://serwist.pages.dev) (`@serwist/turbopack`) |
| **Notifications** | [react-hot-toast](https://react-hot-toast.com) |
| **Git hooks** | [Husky](https://typicode.github.io/husky/) — lint on commit, build on push |
| **CI** | GitHub Actions — lint + build on every PR/push to `master` |
| **Containerization** | Multi-stage Dockerfile with `output: "standalone"` |

- **Runtime:** Node.js 24
- **Package manager:** [pnpm](https://pnpm.io) 10.x

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> Service worker registration is disabled in development to avoid stale caches. Test install/offline behavior with a production build (`pnpm build` then `pnpm start`). HTTPS (or `localhost`) is required for PWA features.

## Available scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## PWA overview

Three pieces make Question Hub installable and offline-capable:

1. **HTTPS** — required by browsers for service workers (localhost counts for local testing).
2. **Web app manifest** — [`app/manifest.ts`](app/manifest.ts) with `display: "standalone"` and install icons under [`public/icons/`](public/icons/).
3. **Service worker** — Serwist builds and serves `/serwist/sw.js` from [`app/serwist/[path]/route.ts`](app/serwist/[path]/route.ts) + [`app/sw.ts`](app/sw.ts).

There is **no background sync** and **no server database**. Question CRUD stays in IndexedDB only. The service worker caches the app shell and static assets so the UI can load offline; it does not sync data anywhere.

### Offline behavior

- Visit `/` and `/questions` once while online so runtime caching can store them.
- After that, reloads and navigation between those routes work offline.
- Uncached navigations fall back to [`app/~offline/page.tsx`](app/~offline/page.tsx).
- IndexedDB create/edit/toggle/delete continues to work offline once the JS app shell is available.

## Architecture decisions

### Runtime caching instead of full precaching

Question Hub uses Serwist’s recommended `defaultCache` **runtime caching**, plus a small **precache** entry only for `/~offline`.

| Approach | What it does | Why we chose / skipped it |
|----------|--------------|---------------------------|
| **Runtime cache (chosen)** | Caches documents, RSC payloads, JS/CSS, fonts, and images as the user requests them | Fits a small App Router app well: low install cost, no need to enumerate every hashed `/_next/static` asset, and routes become offline after first visit |
| **Full precache (not chosen)** | Downloads and stores the entire app shell (and usually every route) at service-worker install time | Heavier first install, more brittle with Next.js hashed assets and RSC payloads, and unnecessary when IndexedDB already owns the data layer |

**Tradeoff:** a true cold start while offline (never visited before, or cache cleared) only guarantees the `/~offline` fallback. That is expected with runtime caching, not a bug. After one online session, previously visited pages and assets remain available offline.

### Per-build `randomUUID()` instead of git commit hash for precache revision

Serwist’s docs often version extra precache entries with `git rev-parse HEAD`. We use `randomUUID()` in [`app/serwist/[path]/route.ts`](app/serwist/[path]/route.ts) instead.

| Approach | Pros | Cons |
|----------|------|------|
| **`randomUUID()` (chosen)** | Works in Docker Alpine without installing `git`; still cache-busts `/~offline` on every build | Revision is not tied to a commit SHA; two builds of the same commit get different revisions |
| **Git commit hash (not chosen)** | Deterministic per commit; easier to correlate cache versions with deploys | Requires `git` in the Docker builder image (`node:24-alpine` does not include it by default) |

**Tradeoff:** accepting a random revision keeps the Docker image lean and avoids silent/fallback git failures in CI. Functionally, each deploy still invalidates the offline fallback precache entry, which is what matters for this single-instance app.

## Docker deployment

```bash
docker build -t question-hub .
docker run -p 3000:3000 question-hub
```

Serve the container behind HTTPS in production so install prompts and the service worker work on real devices.

## Project structure (PWA-relevant)

```
app/
├── layout.tsx                 # Metadata, theme colors, Serwist provider
├── manifest.ts                # Web app manifest (standalone)
├── sw.ts                      # Service worker (runtime cache + offline fallback)
├── serwist/[path]/route.ts    # Builds/serves /serwist/sw.js
├── ~offline/page.tsx          # Offline navigation fallback
├── providers/serwist-provider.tsx
├── page.tsx                   # Landing
└── questions/page.tsx         # Main IndexedDB-backed UI
public/icons/                  # Install / maskable / Apple touch icons
features/questions/            # IndexedDB repository + UI
```

## License

Private — use and modify freely for your own projects.
