"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getActivePriorities,
  getPriorities,
  getPriorityColor,
} from "../lib/prioritiesRepository";
import {
  UNASSIGNED,
  type PrioritiesSettings,
  type PriorityArea,
} from "../types";

export function usePriorities() {
  const [settings, setSettings] = useState<PrioritiesSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getPriorities();
        if (!cancelled) {
          setSettings(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load priorities",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refresh = useCallback(async () => {
    setReloadToken((token) => token + 1);
  }, []);

  const activePriorities: PriorityArea[] = settings
    ? getActivePriorities(settings)
    : [];

  const getColor = useCallback(
    (category: string): string | null => {
      if (!settings) return null;
      return getPriorityColor(settings, category);
    },
    [settings],
  );

  const getDisplayName = useCallback((category: string): string => {
    if (category === UNASSIGNED) {
      return "Unassigned";
    }
    return category;
  }, []);

  return {
    settings,
    activePriorities,
    isLoading,
    error,
    refresh,
    getColor,
    getDisplayName,
    UNASSIGNED,
  };
}
