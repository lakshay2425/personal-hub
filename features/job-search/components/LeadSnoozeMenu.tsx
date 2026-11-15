"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { SnoozePreset } from "../types";

interface LeadSnoozeMenuProps {
  leadName: string;
  isSnoozed: boolean;
  defaultPreset: SnoozePreset;
  onSnooze: () => void;
  onSnoozeDefault: () => void;
  onUnsnooze: () => void;
}

export function LeadSnoozeMenu({
  leadName,
  isSnoozed,
  defaultPreset,
  onSnooze,
  onSnoozeDefault,
  onUnsnooze,
}: LeadSnoozeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const runAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Actions for ${leadName}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 min-w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {isSnoozed ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onUnsnooze)}
              className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Unsnooze
            </button>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => runAction(onSnoozeDefault)}
                className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Snooze {defaultPreset.label}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => runAction(onSnooze)}
                className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Choose snooze date...
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
