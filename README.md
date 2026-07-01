# Next.js Boilerplate

A production-ready Next.js starter template designed to be cloned and customized for new projects — so you skip repetitive setup and start building features immediately.

## What's included

| Area | Details |
|------|---------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) |
| **Language** | TypeScript (strict mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Data fetching** | [TanStack Query v5](https://tanstack.com/query) |
| **HTTP client** | Pre-configured Axios instance with credentials support |
| **Authentication** | Google OAuth (auth-code flow) via an external auth service |
<!-- | **Database (ready)** | [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL scripts (add your schema when needed) | -->
| **JWT (ready)** | [`jose`](https://github.com/panva/jose) included for token verification |
| **Notifications** | [react-hot-toast](https://react-hot-toast.com) |
| **Git hooks** | [Husky](https://typicode.github.io/husky/) — lint on commit, build on push |
| **CI** | GitHub Actions — lint + build on every PR/push to `master` |
| **Containerization** | Multi-stage Dockerfile with standalone output |

---

## Tech stack

- **Runtime:** Node.js 24
- **Package manager:** [pnpm](https://pnpm.io) 10.x
- **Linting:** ESLint 9 with `eslint-config-next`
- **Fonts:** Geist Sans & Geist Mono via `next/font`

---

## Project structure

```
nextjs_boilerplate/
├── app/
│   ├── context/
│   │   └── AuthContext.tsx       # Auth state + localStorage persistence
│   ├── lib/
│   │   └── axiosInstance.ts      # Shared Axios client
│   ├── providers/
│   │   └── tanstack_query.tsx    # TanStack Query provider
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── features/
│   └── auth/
│       ├── components/
│       │   ├── AuthLoadingOverlay.tsx
│       │   └── GetStartedButton.tsx   # Drop-in Google login button
│       ├── hooks/
│       │   └── useGoogleOAuth.ts      # Google OAuth hook
│       └── service/
│           └── authApi.ts             # Auth service API calls
├── .github/workflows/
│   └── ci.yml                    # CI pipeline
├── .husky/
│   ├── pre-commit                # Runs lint
│   └── pre-push                  # Runs build
├── .env.sample                   # Environment variable template
├── Dockerfile                    # Production Docker build
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

The codebase follows a **feature-based** layout: shared app shell under `app/`, domain logic under `features/`.

---

## Prerequisites

- **Node.js** 24+
- **pnpm** 10+ (`corepack enable pnpm`)
- A **Google Cloud OAuth client** (Web application type)
- An **external auth service** that handles Google callback and session cookies (see [Authentication](#authentication))

---

## Getting started

### 1. Clone the repository

```bash
git clone <your-repo-url> my-new-project
cd my-new-project
```

### 2. Install dependencies

```bash
pnpm install
```

Husky is set up automatically via the `prepare` script.

### 3. Configure environment variables

Copy the sample file and fill in your values:

```bash
cp .env.sample .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL of this Next.js app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_AUTH_URL` | Yes | Base URL of your external auth service |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 client ID |
| `NEXT_PUBLIC_BUSINESS_NAME` | Yes | Business/app identifier sent to the auth service during login |
| `DATABASE_URL` | When using DB | PostgreSQL connection string for Drizzle |
| `JWT_PUBLIC_KEY` | When verifying JWTs | Public key for JWT verification (via `jose`) |

> Use `.env.local` for local development. Never commit secrets — `.env` is gitignored.

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Wire up providers (required for auth)

The auth modules are ready but not mounted in `app/layout.tsx` by default. Wrap your app with the providers your project needs:

```tsx
// app/layout.tsx (example)
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/app/context/AuthContext";
import { TanStackProvider } from "@/app/providers/tanstack_query";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <TanStackProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-center" />
            </AuthProvider>
          </TanStackProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
```

Then use the pre-built login button anywhere:

```tsx
import GetStartedButton from "@/features/auth/components/GetStartedButton";

<GetStartedButton className="your-button-classes">
  Continue with Google
</GetStartedButton>
```

Or consume auth state directly:

```tsx
import { useAuth } from "@/app/context/AuthContext";

const { isAuthenticated, user, logout } = useAuth();
```

---

## Authentication

This boilerplate uses **Google OAuth** with the **authorization code flow** (`@react-oauth/google`). It does **not** embed auth logic in Next.js API routes — instead, it delegates to an external auth service.

### Flow

```
User clicks login
    → Google OAuth popup (auth-code flow)
    → Authorization code returned to client
    → Client calls auth service: GET {AUTH_URL}/auth/google/callback?code=...&businessName=...
    → Auth service sets session cookie (httpOnly)
    → Client stores user profile in localStorage
    → User is redirected (default: /ideas — customize in useGoogleOAuth.ts)
```

### Auth service endpoints expected

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/auth/google/callback` | Exchange Google code for session + return `userInfo` |
| `POST` | `/users/logout` | Clear session cookie |

The callback response shape:

```ts
{
  userInfo: {
    profileImage: string | null;
    username: string;
    name: string;
    email: string;
  }
}
```

### Google Cloud Console setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com).
2. Enable the **Google Identity** / OAuth APIs.
3. Create an **OAuth 2.0 Client ID** (Web application).
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - Your production domain
5. Add authorized redirect URIs as required by your auth service.
6. Copy the **Client ID** into `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

### Session handling

- **Cookies:** `axiosInstance` is configured with `withCredentials: true`, so session cookies from the auth service are sent automatically on cross-origin requests (ensure CORS is configured on the auth service).
- **Client state:** User profile is persisted in `localStorage` under the key `userInfo` for instant UI hydration.

---

## Axios instance

The shared HTTP client lives at `app/lib/axiosInstance.ts`:

```ts
import { axiosInstance } from "@/app/lib/axiosInstance";

const { data } = await axiosInstance.get("/api/some-endpoint");
```

Defaults:

- `baseURL` → `NEXT_PUBLIC_APP_URL`
- `withCredentials: true` → sends cookies with requests
- `Content-Type: application/json`

For calls to the external auth service, see `features/auth/service/authApi.ts` for the pattern (uses the full auth service URL).

---

## Database (Drizzle ORM)

Drizzle ORM and PostgreSQL driver are pre-installed. Scripts are ready in `package.json`:

```bash
pnpm db:generate   # Generate migrations from schema
pnpm db:migrate    # Run migrations
```

To use Drizzle in a new project:

1. Add your schema (e.g. `db/schema.ts`).
2. Add a `drizzle.config.ts` pointing at `DATABASE_URL`.
3. Set `DATABASE_URL` in `.env`.
4. Run `pnpm db:generate` and `pnpm db:migrate`.

---

## Git hooks (Husky)

| Hook | Command | When |
|------|---------|------|
| **pre-commit** | `pnpm run lint` | Before every commit |
| **pre-push** | `pnpm run build` | Before every push |

Hooks are installed automatically when you run `pnpm install` (via the `prepare` script).

To bypass temporarily (use sparingly):

```bash
git commit -m "wip" --no-verify
git push --no-verify
```

---

## CI pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push and pull requests to `master`:

1. Checkout code
2. Set up pnpm 10.15.0 + Node.js 24
3. `pnpm install --frozen-lockfile`
4. `pnpm run lint`
5. `pnpm run build`

### Optional: GitHub Secrets for build

If your build requires environment variables, uncomment the `env` block in `ci.yml` and add these secrets in your repository settings:

- `NEXT_PUBLIC_AUTH_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_BUSINESS_NAME`
- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `JWT_PUBLIC_KEY`

### Optional: Coolify deployment

A commented webhook step is included for triggering [Coolify](https://coolify.io) deployments on push to `master`. Uncomment and set `COOLIFY_WEBHOOK_URL` when ready.

---

## Docker deployment

Build and run a production container:

```bash
docker build \
  --build-arg NEXT_PUBLIC_AUTH_URL=https://auth.example.com \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id \
  --build-arg NEXT_PUBLIC_BUSINESS_NAME=YourApp \
  --build-arg NEXT_PUBLIC_APP_URL=https://app.example.com \
  -t nextjs-app .

docker run -p 3000:3000 nextjs-app
```

> **Note:** Enable standalone output in `next.config.ts` for the Docker build to work:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

The Dockerfile uses a multi-stage build (deps → builder → runner) with a non-root `nextjs` user on port 3000.

---

## Available scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply Drizzle migrations |

---

## Customizing for a new project

After cloning, typical first steps:

1. Rename the project in `package.json`.
2. Update `metadata` in `app/layout.tsx` (title, description).
3. Copy `.env.sample` → `.env.local` and fill in values.
4. Wire providers in `app/layout.tsx` (see [Getting started](#5-wire-up-providers-required-for-auth)).
5. Replace `app/page.tsx` with your landing page.
6. Update the post-login redirect in `features/auth/hooks/useGoogleOAuth.ts` (currently `/ideas`).
7. Add Drizzle schema and config if you need a database.
8. Enable `output: "standalone"` in `next.config.ts` if deploying with Docker.
9. Uncomment CI secrets / Coolify webhook when deploying.

---

## Path aliases

TypeScript path alias `@/*` maps to the project root:

```ts
import { useAuth } from "@/app/context/AuthContext";
import { authApi } from "@/features/auth/service/authApi";
```

---

## License

Private — use and modify freely for your own projects.
