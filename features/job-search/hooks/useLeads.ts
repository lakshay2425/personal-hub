"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createLead,
  deleteLead,
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

  return { leads, isLoading, addLead, editLead, removeLead, refresh };
}
