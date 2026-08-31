"use client";

import { UNASSIGNED, type PriorityArea } from "../types";

interface CategoryPickerProps {
  value: string;
  onChange: (value: string) => void;
  priorities: PriorityArea[];
  includeNone?: boolean;
  noneLabel?: string;
  id?: string;
  label?: string;
}

export function CategoryPicker({
  value,
  onChange,
  priorities,
  includeNone = false,
  noneLabel = "None",
  id = "category",
  label = "Category",
}: CategoryPickerProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      >
        {includeNone ? (
          <option value="">{noneLabel}</option>
        ) : null}
        <option value={UNASSIGNED}>Unassigned</option>
        {priorities.map((priority) => (
          <option key={priority.name} value={priority.name}>
            {priority.name}
          </option>
        ))}
      </select>
    </div>
  );
}
