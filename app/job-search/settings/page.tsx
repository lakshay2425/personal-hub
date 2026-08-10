"use client";

import { PageHeader } from "@/features/job-search/components/PageHeader";
import { useJobSearchPreferences } from "@/features/job-search/hooks/useJobSearchPreferences";

export default function JobSearchSettingsPage() {
  const { showApplications, setShowApplications } = useJobSearchPreferences();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure your job search tracker"
      />

      <div className="max-w-xl rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
          <div>
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Job applications
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Enabled by default. Turn this off to hide the applications section
              across Job Search. Your application data is always kept — disabling
              this only hides it from the UI.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showApplications}
            onClick={() => setShowApplications(!showApplications)}
            className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
              showApplications
                ? "bg-zinc-900 dark:bg-zinc-50"
                : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform dark:bg-zinc-900 ${
                showApplications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
