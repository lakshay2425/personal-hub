"use client";

import { useState } from "react";

import { CategoryPicker } from "@/features/settings/components/CategoryPicker";
import { usePriorities } from "@/features/settings/hooks/usePriorities";
import { UNASSIGNED } from "@/features/settings/types";

interface BulkActionBarProps {
  selectedCount: number;
  onApply: (category: string) => void | Promise<void>;
  onClear: () => void;
  includeNone?: boolean;
  noneLabel?: string;
  isApplying?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onApply,
  onClear,
  includeNone = false,
  noneLabel = "None",
  isApplying = false,
}: BulkActionBarProps) {
  const { activePriorities } = usePriorities();
  const [category, setCategory] = useState(includeNone ? "" : UNASSIGNED);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="sticky bottom-4 z-20 mx-auto flex max-w-lg flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg sm:flex-row sm:items-end dark:border-zinc-700 dark:bg-zinc-900">
      <p className="shrink-0 text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {selectedCount} selected
      </p>
      <div className="min-w-0 flex-1">
        <CategoryPicker
          value={category}
          onChange={setCategory}
          priorities={activePriorities}
          includeNone={includeNone}
          noneLabel={noneLabel}
          label="Assign category"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClear}
          disabled={isApplying}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => void onApply(category)}
          disabled={isApplying}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isApplying ? "Applying…" : "Apply"}
        </button>
      </div>
    </div>
  );
}
