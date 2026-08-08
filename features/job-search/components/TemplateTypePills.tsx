"use client";

import { TEMPLATE_TYPE_FILTERS } from "../constants";
import type { TemplateType } from "../types";

interface TemplateTypePillsProps {
  value: TemplateType | "all";
  onChange: (filter: TemplateType | "all") => void;
}

export function TemplateTypePills({
  value,
  onChange,
}: TemplateTypePillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEMPLATE_TYPE_FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            value === filter.value
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
