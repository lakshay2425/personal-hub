"use client";

import { StickyNote } from "lucide-react";

interface NotesIconProps {
  notes: string;
}

export function NotesIcon({ notes }: NotesIconProps) {
  if (!notes.trim()) return null;

  return (
    <span
      title={notes}
      className="inline-flex shrink-0 text-zinc-400 dark:text-zinc-500"
      aria-label="Has notes"
    >
      <StickyNote className="h-4 w-4" />
    </span>
  );
}
