import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-20 dark:bg-black">
      <main className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          You&apos;re offline
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          This page wasn&apos;t cached yet. Open Question Hub once while online,
          then questions and previously visited pages will work offline.
        </p>
        <div className="mt-8">
          <Link
            href="/projects"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go to Projects
          </Link>
        </div>
      </main>
    </div>
  );
}
