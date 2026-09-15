"use client";

import { Filter } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CONTENT_IDEA_STATUSES, CONTENT_IDEA_TYPES } from "../constants";
import type { ContentIdeaStatus, ContentIdeaType } from "../types";

interface ContentIdeasFiltersProps {
  statusFilter: ContentIdeaStatus | "";
  contentTypeFilter: ContentIdeaType | "";
  onStatusChange: (status: ContentIdeaStatus | "") => void;
  onContentTypeChange: (type: ContentIdeaType | "") => void;
}

const selectClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50";

export function ContentIdeasFilters({
  statusFilter,
  contentTypeFilter,
  onStatusChange,
  onContentTypeChange,
}: ContentIdeasFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const hasActiveFilter = Boolean(statusFilter || contentTypeFilter);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div ref={panelRef} className="relative w-full sm:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            hasActiveFilter
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filters
          {hasActiveFilter ? (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs dark:bg-zinc-900/20">
              Active
            </span>
          ) : null}
        </button>

        {isOpen ? (
          <div
            className="absolute left-0 right-0 z-20 mt-2 space-y-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  onStatusChange(event.target.value as ContentIdeaStatus | "")
                }
                className={selectClassName}
              >
                <option value="">All statuses</option>
                {CONTENT_IDEA_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Type
              </span>
              <select
                value={contentTypeFilter}
                onChange={(event) =>
                  onContentTypeChange(event.target.value as ContentIdeaType | "")
                }
                className={selectClassName}
              >
                <option value="">All types</option>
                {CONTENT_IDEA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </div>

      <select
        value={statusFilter}
        onChange={(event) =>
          onStatusChange(event.target.value as ContentIdeaStatus | "")
        }
        className={`hidden sm:block sm:w-auto ${selectClassName}`}
      >
        <option value="">All statuses</option>
        {CONTENT_IDEA_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <select
        value={contentTypeFilter}
        onChange={(event) =>
          onContentTypeChange(event.target.value as ContentIdeaType | "")
        }
        className={`hidden sm:block sm:w-auto ${selectClassName}`}
      >
        <option value="">All types</option>
        {CONTENT_IDEA_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </>
  );
}
