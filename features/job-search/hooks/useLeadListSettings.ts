"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getListSettings,
  saveListSettings,
} from "../repositories/listSettingsRepository";
import type { JobSearchListSettings } from "../types";

export function useLeadListSettings() {
  const [settings, setSettings] = useState<JobSearchListSettings | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getListSettings();
    setSettings(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getListSettings();
      if (!cancelled) {
        setSettings(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(
    async (next: JobSearchListSettings) => {
      const saved = await saveListSettings(next);
      setSettings(saved);
      return saved;
    },
    [],
  );

  return { settings, isLoading, refresh, updateSettings };
}
