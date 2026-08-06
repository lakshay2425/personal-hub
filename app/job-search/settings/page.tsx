"use client";

import { useTheme } from "@/app/providers/theme-provider";
import { PageHeader } from "@/features/job-search/components/PageHeader";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure your Job Search Tracker"
      />

      <div className="max-w-lg space-y-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Appearance
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Switch between light and dark mode.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Dark mode
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={theme === "dark"}
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                theme === "dark" ? "bg-zinc-900 dark:bg-zinc-50" : "bg-zinc-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform dark:bg-zinc-900 ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Data Storage
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            All job search data is stored locally in your browser using a
            separate IndexedDB database (<code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">job-search-tracker-db</code>).
            It is completely independent from the Questions section, which uses
            its own database (<code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">question-hub-db</code>).
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Nothing is sent to a server. Clearing browser data will delete your
            records.
          </p>
        </section>
      </div>
    </div>
  );
}
