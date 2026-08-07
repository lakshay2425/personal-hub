"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { buildExportFilename, downloadJson } from "@/lib/export/downloadJson";

type ExportButtonProps = {
  onExport: () => Promise<unknown>;
  filenamePrefix: string;
  label?: string;
  className?: string;
};

export function ExportButton({
  onExport,
  filenamePrefix,
  label = "Export",
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await onExport();
      downloadJson(data, buildExportFilename(filenamePrefix));
      toast.success("Data exported");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className={
        className ??
        "w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }
    >
      {isExporting ? "Exporting…" : label}
    </button>
  );
}
