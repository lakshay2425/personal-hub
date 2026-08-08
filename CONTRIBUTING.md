# Contributing to Personal Hub

Thanks for wanting to contribute. This project is a local-first personal toolkit — keep that spirit in mind: privacy by default, no server-side user data, and a calm UI.

## Ways to help

- Report bugs or suggest features via [GitHub Issues](https://github.com/lakshay2425/personal-hub/issues)
- Improve docs (README, comments, this guide)
- Fix bugs or add features via pull requests

## Development setup

### Prerequisites

- **Node.js 24**
- **pnpm 10.x** ([install](https://pnpm.io/installation))

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Development server |
| `pnpm lint` | ESLint (also runs on pre-commit) |
| `pnpm build` | Production build (also runs on pre-push) |
| `pnpm start` | Serve a production build |

Service workers are disabled in development. To test PWA / offline behavior:

```bash
pnpm build && pnpm start
```

## Project layout

```
app/                 # Next.js App Router pages, layout, PWA (manifest, SW)
components/          # Shared shell / UI primitives
features/
  questions/         # Projects + inbox (Dexie)
  content-ideas/     # Content ideas + calendar (shared question-hub-db)
  planner/           # Weekly task planner (shared question-hub-db)
  logger/            # Daily log entries (Dexie)
  job-search/        # Job search tracker — companies, leads, templates, template FK links (Dexie v4)
lib/                 # Site-wide constants
public/              # Static assets and PWA icons
```

Feature code stays under `features/<name>/` (components, hooks, repositories, schemas). Prefer that pattern for new tools.

## Coding guidelines

- **TypeScript** — keep strict typing; avoid `any` unless there is a clear reason.
- **Local-first** — user data belongs in IndexedDB (Dexie). Do not add server persistence for personal data.
- **UI** — match existing Tailwind / zinc light-dark patterns; keep pages readable and uncluttered.
- **Scope** — keep PRs focused. Prefer small, reviewable changes over large mixed diffs.
- **No secrets** — never commit `.env` files, API keys, or personal data dumps.

## Pull request process

1. Fork the repo (or create a branch if you have write access).
2. Create a branch from `master`, e.g. `fix/inbox-empty-state` or `feat/export-backup`.
3. Make your changes. Run locally:
   ```bash
   pnpm lint
   pnpm build
   ```
4. Open a PR against `master` with:
   - A clear title and short summary of *why* the change exists
   - Steps to test / reproduce
   - Screenshots for UI changes when helpful
5. CI must pass (lint + build on Node 24). Address review feedback if requested.

Husky hooks run `pnpm lint` on commit and `pnpm build` on push. Fix failures locally before pushing again.

## Issue reports

Good bug reports include:

- What you expected vs what happened
- Steps to reproduce
- Browser / OS (and whether you were online or offline)
- Whether DevTools shows IndexedDB errors or console stack traces

Feature ideas are welcome — especially ones that stay local-first and do not require accounts or a backend.

## Code of conduct

Be respectful and constructive. Assume good intent. Harassment or personal attacks are not acceptable.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE.txt).
