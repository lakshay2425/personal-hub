"use client";

import { StickyNote } from "lucide-react";

interface NotesIconProps {
  notes: string;
  onClick?: () => void;
}

export function NotesIcon({ notes, onClick }: NotesIconProps) {
  if (!notes.trim()) return null;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        aria-label="View notes"
      >
        <StickyNote className="h-4 w-4" />
      </button>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 text-zinc-400 dark:text-zinc-500"
      aria-label="Has notes"
    >
      <StickyNote className="h-4 w-4" />
    </span>
  );
}
