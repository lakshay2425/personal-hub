"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { DEFAULT_SNOOZE_PRESETS, normalizeSnoozePresets } from "../lib/snoozeUtils";
import type { SnoozePreset } from "../types";

const STORAGE_KEY = "job-search-snooze-presets";
const DEFAULT_SNAPSHOT = JSON.stringify(DEFAULT_SNOOZE_PRESETS);
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_SNAPSHOT;
}

function getServerSnapshot(): string {
  return DEFAULT_SNAPSHOT;
}

function emitChange() {
  for (const listener of listeners) listener();
}

export function useSnoozePresets() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const presets = useMemo(() => {
    try {
      return normalizeSnoozePresets(JSON.parse(snapshot));
    } catch {
      return [...DEFAULT_SNOOZE_PRESETS];
    }
  }, [snapshot]);

  const savePresets = useCallback((next: SnoozePreset[]) => {
    const normalized = normalizeSnoozePresets(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    emitChange();
  }, []);

  return { presets, savePresets };
}
