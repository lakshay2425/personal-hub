import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-20 dark:bg-black">
      <main className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          {SITE_NAME}
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Local-first tools for your learning and career — stored entirely in
          your browser.
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
          Your data stays on this device using IndexedDB. Nothing is sent to a
          server.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/projects"
            className="group flex flex-col items-start rounded-xl border border-zinc-200 bg-white p-6 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80"
          >
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Projects
            </span>
            <span className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Capture questions in an inbox and organize them into projects with
              titled answers.
            </span>
            <span className="mt-4 text-sm font-medium text-zinc-900 group-hover:underline dark:text-zinc-50">
              Open Projects →
            </span>
          </Link>
          <Link
            href="/logger"
            className="group flex flex-col items-start rounded-xl border border-zinc-200 bg-white p-6 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80"
          >
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Logger
            </span>
            <span className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Log what you did as separate entries — multiple times per day.
            </span>
            <span className="mt-4 text-sm font-medium text-zinc-900 group-hover:underline dark:text-zinc-50">
              Open Logger →
            </span>
          </Link>
          <Link
            href="/job-search"
            className="group flex flex-col items-start rounded-xl border border-zinc-200 bg-white p-6 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80 sm:col-span-2 lg:col-span-1"
          >
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Job Search Tracker
            </span>
            <span className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Track companies, leads, applications, and cold emails in one
              place.
            </span>
            <span className="mt-4 text-sm font-medium text-zinc-900 group-hover:underline dark:text-zinc-50">
              Open Tracker →
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
