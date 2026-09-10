"use client";

import { ExportButton } from "@/components/ExportButton";
import { ImportButton } from "@/components/ImportButton";

type DataBackupSectionProps<T> = {
  title?: string;
  description?: string;
  filenamePrefix: string;
  onExport: () => Promise<unknown>;
  onValidate: (data: unknown) => T;
  onImport: (data: T) => Promise<void>;
  onImported?: () => void;
  className?: string;
};

export function DataBackupSection<T>({
  title = "Data backup",
  description = "Export your data as JSON or import a previously exported backup. Import replaces all existing data in this module.",
  filenamePrefix,
  onExport,
  onValidate,
  onImport,
  onImported,
  className = "mt-6",
}: DataBackupSectionProps<T>) {
  const buttonClassName =
    "w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800";

  return (
    <div
      className={`${className} max-w-xl rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900`}
    >
      <div className="border-b border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-2 p-4 sm:flex-row sm:p-6">
        <ExportButton
          onExport={onExport}
          filenamePrefix={filenamePrefix}
          className={buttonClassName}
        />
        <ImportButton
          onValidate={onValidate}
          onImport={onImport}
          onImported={onImported}
          className={buttonClassName}
        />
      </div>
    </div>
  );
}
