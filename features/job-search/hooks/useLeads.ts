"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createLead,
  createLeads,
  deleteLead,
  deleteLeads,
  getAllLeads,
  updateLead,
} from "../repositories/leadsRepository";
import type { Lead } from "../types";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllLeads();
    setLeads(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAllLeads();
      if (!cancelled) {
        setLeads(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const addLead = useCallback(
    async (data: Omit<Lead, "id" | "createdAt">) => {
      const id = await createLead(data);
      await refresh();
      return id;
    },
    [refresh],
  );

  const addLeads = useCallback(
    async (
      data: Omit<Lead, "id" | "createdAt">[],
      options?: { allowNameDuplicates?: boolean },
    ) => {
      const ids = await createLeads(data, options);
      await refresh();
      return ids;
    },
    [refresh],
  );

  const editLead = useCallback(
    async (id: number, data: Partial<Omit<Lead, "id" | "createdAt">>) => {
      await updateLead(id, data);
      await refresh();
    },
    [refresh],
  );

  const removeLead = useCallback(
    async (id: number) => {
      await deleteLead(id);
      await refresh();
    },
    [refresh],
  );

  const removeLeads = useCallback(
    async (ids: number[]) => {
      await deleteLeads(ids);
      await refresh();
    },
    [refresh],
  );

  return {
    leads,
    isLoading,
    addLead,
    addLeads,
    editLead,
    removeLead,
    removeLeads,
    refresh,
  };
}
