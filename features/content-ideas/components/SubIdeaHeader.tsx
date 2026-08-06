"use client";

import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface SubIdeaHeaderProps {
  title: string;
  textClassName: string;
  hasChildren: boolean;
  isChildrenCollapsed: boolean;
  descendantCount: number;
  onToggleChildrenCollapse: () => void;
  meta?: ReactNode;
}

export function SubIdeaHeader({
  title,
  textClassName,
  hasChildren,
  isChildrenCollapsed,
  descendantCount,
  onToggleChildrenCollapse,
  meta,
}: SubIdeaHeaderProps) {
  if (!hasChildren) {
    return (
      <div className="min-w-0 flex-1">
        <p className={`text-zinc-900 dark:text-zinc-50 ${textClassName}`}>
          {title}
        </p>
        {meta ? <div className="mt-1">{meta}</div> : null}
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          onClick={onToggleChildrenCollapse}
          aria-expanded={!isChildrenCollapsed}
          aria-label={
            isChildrenCollapsed ? "Show sub-ideas" : "Hide sub-ideas"
          }
          className="mt-0.5 shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              isChildrenCollapsed ? "" : "rotate-90"
            }`}
          />
        </button>
        <p className={`min-w-0 flex-1 text-zinc-900 dark:text-zinc-50 ${textClassName}`}>
          {title}
        </p>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-6">
        <button
          type="button"
          onClick={onToggleChildrenCollapse}
          className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {isChildrenCollapsed
            ? `Show ${descendantCount} sub-idea${descendantCount === 1 ? "" : "s"}`
            : `Hide ${descendantCount} sub-idea${descendantCount === 1 ? "" : "s"}`}
        </button>
        {meta}
      </div>
    </div>
  );
}
