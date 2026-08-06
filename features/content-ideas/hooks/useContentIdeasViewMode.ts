"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { ContentIdeasViewMode } from "../types";

const STORAGE_KEY = "content-ideas-view-mode";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): ContentIdeasViewMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "cards") return "cards";
  if (stored === "list") return "list";
  return "table";
}

function getServerSnapshot(): ContentIdeasViewMode {
  return "table";
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function useContentIdeasViewMode() {
  const viewMode = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setViewMode = useCallback((mode: ContentIdeasViewMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    emitChange();
  }, []);

  return { viewMode, setViewMode };
}
