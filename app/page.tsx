import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

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
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-24 pb-16 sm:pt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center"
        >
          <div className="h-64 w-[36rem] max-w-full rounded-full bg-gradient-to-tr from-indigo-200 via-sky-200 to-emerald-200 opacity-40 blur-3xl dark:from-indigo-900 dark:via-sky-900 dark:to-emerald-900 dark:opacity-30" />
        </div>

        <div className="mx-auto w-full max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Local-first · No account · Free
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            {SITE_NAME}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A calm, local-first toolkit for your learning and career. Capture
            questions, log your progress, and track your job search — all stored
            entirely in your browser.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get started
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Explore the tools
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section id="features" className="px-4 py-8 scroll-mt-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group flex flex-col items-start rounded-2xl border border-zinc-200 bg-white p-6 text-left transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
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
      <section className="px-4 py-16">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              Yours, and only yours
            </h2>
            <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
              No backend, no analytics, no strings attached. Everything runs and
              stays on your device.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
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
      <section className="px-4 pb-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900 sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              Ready when you are
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Open a tool and start right away — there is nothing to set up and
              nothing to sign into.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Open Projects
              </Link>
              <Link
                href="/logger"
                className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Open Logger
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 px-4 py-8 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-sm text-zinc-500 dark:text-zinc-500 sm:flex-row">
          <span>
            {SITE_NAME} · Local-first, stored in your browser via IndexedDB.
          </span>
          <span>No data ever leaves this device.</span>
        </div>
      </footer>
    </div>
  );
}
