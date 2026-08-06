"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getLogEntriesByDate,
  updateLogEntry as updateLogEntryRepo,
  deleteLogEntry as deleteLogEntryRepo,
} from "../lib/loggerRepository";
import type { LogEntry } from "../types";

export function useLogEntriesByDate(date: string) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const data = await getLogEntriesByDate(date);
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
  }, [date]);

  const updateEntry = useCallback(
    async (id: string, entryDate: string, text: string) => {
      const updated = await updateLogEntryRepo(id, entryDate, text);
      setEntries((prev) => {
        if (entryDate !== date) {
          return prev.filter((entry) => entry.id !== id);
        }
        return prev
          .map((entry) => (entry.id === id ? updated : entry))
          .sort((a, b) => b.createdAt - a.createdAt);
      });
      return updated;
    },
    [date],
  );

  const deleteEntry = useCallback(async (id: string) => {
    await deleteLogEntryRepo(id);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  return {
    entries,
    isLoading,
    error,
    updateEntry,
    deleteEntry,
  };
}
