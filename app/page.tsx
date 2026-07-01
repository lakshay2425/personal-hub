import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-20 dark:bg-black">
      <main className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Question Hub
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Capture questions, track what&apos;s answered and what&apos;s still
          open — all stored locally in your browser.
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
          Your data stays on this device using IndexedDB. Nothing is sent to a
          server.
        </p>
        <div className="mt-10">
          <Link
            href="/questions"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go to Questions
          </Link>
        </div>
      </main>
    </div>
  );
}
