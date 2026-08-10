"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "job-search-show-applications";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "false") return false;
  return true;
}

function getServerSnapshot(): boolean {
  return true;
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function useJobSearchPreferences() {
  const showApplications = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setShowApplications = useCallback((enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
    emitChange();
  }, []);

  return { showApplications, setShowApplications };
}
