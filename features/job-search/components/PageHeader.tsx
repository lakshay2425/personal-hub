"use client";

import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {action ? (
        <div className="w-full shrink-0 sm:w-auto [&_button]:w-full [&_button]:sm:w-auto [&_a]:block [&_a]:w-full [&_a]:sm:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
