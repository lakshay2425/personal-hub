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

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPriorities();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load priorities");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
    refresh: load,
    getColor,
    getDisplayName,
    UNASSIGNED,
  };
}
