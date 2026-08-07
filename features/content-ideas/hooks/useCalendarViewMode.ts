"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { CalendarViewMode } from "../types";

const STORAGE_KEY = "content-calendar-view-mode";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): CalendarViewMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "week") return "week";
  return "month";
}

function getServerSnapshot(): CalendarViewMode {
  return "month";
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function useCalendarViewMode() {
  const viewMode = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setViewMode = useCallback((mode: CalendarViewMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    emitChange();
  }, []);

  return { viewMode, setViewMode };
}
