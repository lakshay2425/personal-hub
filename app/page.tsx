import Link from "next/link";

import { AppLogo } from "@/components/AppLogo";
import { SITE_GITHUB_URL, SITE_NAME } from "@/lib/site";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/content-ideas", label: "Content Ideas" },
  { href: "/logger", label: "Logger" },
  { href: "/job-search", label: "Job Search" },
] as const;

const buttonPrimaryClassName =
  "inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200";

const buttonSecondaryClassName =
  "inline-flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:w-auto dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

const FEATURES = [
  {
    href: "/projects",
    title: "Projects",
    description:
      "Capture questions in an inbox and organize them into projects with titled answers.",
    cta: "Open Projects",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l1.122 1.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 8v8.25A2.25 2.25 0 0118 18.5H6a2.25 2.25 0 01-2.25-2.25V6z"
        />
      </svg>
    ),
  },
  {
    href: "/content-ideas",
    title: "Content Ideas",
    description:
      "Capture standalone content ideas with status tracking and published links.",
    cta: "Open Content Ideas",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    ),
  },
  {
    href: "/logger",
    title: "Logger",
    description:
      "Log what you did as separate entries — multiple times per day, all timestamped.",
    cta: "Open Logger",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.75v5.25l3 1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    href: "/job-search",
    title: "Job Search Tracker",
    description:
      "Track companies, leads, applications, and cold emails all in one place.",
    cta: "Open Tracker",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.1A2.25 2.25 0 0118 20.5H6a2.25 2.25 0 01-2.25-2.25v-4.1m16.5 0a2.25 2.25 0 00.659-1.591V9.75A2.25 2.25 0 0018.75 7.5H5.25A2.25 2.25 0 003 9.75v2.809c0 .597.237 1.17.659 1.591m16.5 0a2.25 2.25 0 01-.659.482 24.3 24.3 0 01-8.34 1.487 24.3 24.3 0 01-8.16-1.407 2.25 2.25 0 01-.5-.562m16.5 0V9.75m-16.5 4.4V9.75m0 0V6a2.25 2.25 0 012.25-2.25h9A2.25 2.25 0 0116.5 6v3.75m-9 0V6h9v3.75"
        />
      </svg>
    ),
  },
] as const;

const BENEFITS = [
  {
    title: "Private by default",
    description:
      "Your data lives in your browser's IndexedDB. Nothing ever leaves your device.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a2.25 2.25 0 012.25 2.25v6A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75v-6a2.25 2.25 0 012.25-2.25z"
        />
      </svg>
    ),
  },
  {
    title: "Works offline",
    description:
      "Installable as a PWA. Open it, use it, and keep going even without a connection.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5.25 17h13.5A2.25 2.25 0 0021 14.75V6.25A2.25 2.25 0 0018.75 4H5.25A2.25 2.25 0 003 6.25v8.5A2.25 2.25 0 005.25 17z"
        />
      </svg>
    ),
  },
  {
    title: "No sign-up",
    description:
      "No accounts, no passwords, no tracking. Just open the app and start working.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Fast & lightweight",
    description:
      "No server round-trips. Everything reads and writes instantly on your machine.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/90">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50"
          >
            <AppLogo className="h-8 w-8" priority />
            <span className="truncate">{SITE_NAME}</span>
          </Link>

          <nav
            aria-label="Main"
            className="hidden items-center gap-1 sm:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={SITE_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              GitHub
            </a>
          </nav>

          <details className="group relative sm:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-200 p-2 text-zinc-700 marker:content-none dark:border-zinc-700 dark:text-zinc-300">
              <span className="sr-only">Open menu</span>
              <svg
                className="h-5 w-5 group-open:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className="hidden h-5 w-5 group-open:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={SITE_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                GitHub
              </a>
            </nav>
          </details>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-12 pb-12 sm:pt-16 sm:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center"
        >
          <div className="h-64 w-[36rem] max-w-full rounded-full bg-gradient-to-tr from-indigo-200 via-sky-200 to-emerald-200 opacity-40 blur-3xl dark:from-indigo-900 dark:via-sky-900 dark:to-emerald-900 dark:opacity-30" />
        </div>

        <div className="mx-auto w-full max-w-3xl text-center">
          <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              Local-first
            </span>
            <span className="hidden text-zinc-300 sm:inline dark:text-zinc-600">
              ·
            </span>
            <span>No account</span>
            <span className="hidden text-zinc-300 sm:inline dark:text-zinc-600">
              ·
            </span>
            <span>Free</span>
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-balance text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
            {SITE_NAME}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-pretty text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-400">
            A calm, local-first toolkit for your learning and career. Capture
            questions, log your progress, and track your job search — all stored
            entirely in your browser.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/projects" className={buttonPrimaryClassName}>
              Get started
            </Link>
            <Link href="#features" className={buttonSecondaryClassName}>
              Explore the tools
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section id="features" className="scroll-mt-16 px-4 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group flex min-w-0 flex-col items-start rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <span className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {feature.icon}
                </span>
                <span className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {feature.title}
                </span>
                <span className="mt-2 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </span>
                <span className="mt-4 text-sm font-medium text-zinc-900 group-hover:underline dark:text-zinc-50">
                  {feature.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-semibold tracking-tight text-balance text-zinc-900 sm:text-2xl lg:text-3xl dark:text-zinc-50">
              Yours, and only yours
            </h2>
            <p className="mt-3 text-sm leading-6 text-pretty text-zinc-600 sm:text-base sm:leading-7 dark:text-zinc-400">
              No backend, no analytics, no strings attached. Everything runs and
              stays on your device.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="flex min-w-0 items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:gap-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="mt-0.5 inline-flex shrink-0 rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  {benefit.icon}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:pb-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-10 text-center sm:rounded-3xl sm:px-12 sm:py-12 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold tracking-tight text-balance text-zinc-900 sm:text-2xl lg:text-3xl dark:text-zinc-50">
              Ready when you are
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-pretty text-zinc-600 sm:text-base sm:leading-7 dark:text-zinc-400">
              Open a tool and start right away — there is nothing to set up and
              nothing to sign into.
            </p>
            <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <Link href="/projects" className={buttonPrimaryClassName}>
                Open Projects
              </Link>
              <Link href="/logger" className={buttonSecondaryClassName}>
                Open Logger
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 px-4 py-8 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center text-xs text-zinc-500 sm:text-sm dark:text-zinc-500">
          <div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row sm:text-left">
            <span className="max-w-sm text-pretty sm:max-w-none">
              {SITE_NAME} · Local-first, stored in your browser via IndexedDB.
            </span>
            <span className="shrink-0">No data ever leaves this device.</span>
          </div>
          <a
            href={SITE_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            View source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
