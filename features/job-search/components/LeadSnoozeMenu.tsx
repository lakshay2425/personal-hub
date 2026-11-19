"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { SnoozePreset } from "../types";
import { localDateKey } from "../lib/outreachQueue";

interface LeadSnoozeMenuProps {
  leadName: string;
  isSnoozed: boolean;
  defaultPreset: SnoozePreset;
  onSnooze: () => void;
  onSnoozeDefault: () => void;
  onUnsnooze: () => void;
  outreachDate?: string;
  onScheduleOutreach?: (date: string) => void;
  onRemoveOutreach?: () => void;
}

export function LeadSnoozeMenu({
  leadName,
  isSnoozed,
  defaultPreset,
  onSnooze,
  onSnoozeDefault,
  onUnsnooze,
  outreachDate,
  onScheduleOutreach,
  onRemoveOutreach,
}: LeadSnoozeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChoosingOutreachDate, setIsChoosingOutreachDate] = useState(false);
  const [selectedOutreachDate, setSelectedOutreachDate] = useState("");
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
          {onScheduleOutreach ? (
            outreachDate ? (
              <button type="button" role="menuitem" onClick={() => runAction(() => onRemoveOutreach?.())} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                Remove from outreach ({outreachDate})
              </button>
            ) : isChoosingOutreachDate ? (
              <div className="border-t border-zinc-200 p-3 dark:border-zinc-700">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">Reach out on</label>
                <input type="date" min={localDateKey(new Date())} value={selectedOutreachDate} onChange={(event) => setSelectedOutreachDate(event.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50" />
                <button type="button" disabled={!selectedOutreachDate} onClick={() => runAction(() => onScheduleOutreach(selectedOutreachDate))} className="mt-2 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900">Add to outreach</button>
              </div>
            ) : (
              <button type="button" role="menuitem" onClick={() => { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); setSelectedOutreachDate(`${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,"0")}-${String(tomorrow.getDate()).padStart(2,"0")}`); setIsChoosingOutreachDate(true); }} className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Move to outreach…
              </button>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
