"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createLogEntry as createLogEntryRepo,
  deleteLogEntry as deleteLogEntryRepo,
  getAllLogEntries,
  updateLogEntry as updateLogEntryRepo,
} from "../lib/loggerRepository";
import type { LogEntry } from "../types";

export function useLogEntries() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllLogEntries();
      setEntries(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load log entries",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const data = await getAllLogEntries();
        if (!cancelled) {
          setEntries(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load log entries",
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
  }, []);

  const createEntry = useCallback(async (date: string, text: string) => {
    const created = await createLogEntryRepo(date, text);
    setEntries((prev) =>
      [created, ...prev].sort((a, b) => b.createdAt - a.createdAt),
    );
    return created;
  }, []);

  const updateEntry = useCallback(
    async (id: string, date: string, text: string) => {
      const updated = await updateLogEntryRepo(id, date, text);
      setEntries((prev) =>
        prev
          .map((entry) => (entry.id === id ? updated : entry))
          .sort((a, b) => b.createdAt - a.createdAt),
      );
      return updated;
    },
    [],
  );

  const deleteEntry = useCallback(async (id: string) => {
    await deleteLogEntryRepo(id);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  return {
    entries,
    isLoading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refresh,
  };
}
