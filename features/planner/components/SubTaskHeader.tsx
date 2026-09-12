"use client";

import type { ReactNode } from "react";

interface SubTaskHeaderProps {
  title: string;
  textClassName: string;
  hasChildren: boolean;
  descendantCount: number;
  onTitleClick?: () => void;
  meta?: ReactNode;
  completed?: boolean;
}

export function SubTaskHeader({
  title,
  textClassName,
  hasChildren,
  descendantCount,
  onTitleClick,
  meta,
  completed = false,
}: SubTaskHeaderProps) {
  const titleClassName = completed ? `${textClassName} line-through` : textClassName;

  if (!hasChildren) {
    return (
      <div className="min-w-0 flex-1">
        <p
          className={`break-words text-zinc-900 dark:text-zinc-50 ${titleClassName}`}
        >
          {title}
        </p>
        {meta ? <div className="mt-1">{meta}</div> : null}
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <button
        type="button"
        onClick={onTitleClick}
        className={`w-full text-left break-words text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300 ${titleClassName}`}
      >
        {title}
      </button>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={onTitleClick}
          className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          View {descendantCount} sub-task{descendantCount === 1 ? "" : "s"}
        </button>
        {meta}
      </div>
    </div>
  );
}
