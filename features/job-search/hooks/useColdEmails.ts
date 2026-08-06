"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createColdEmail,
  deleteColdEmail,
  getAllColdEmails,
  updateColdEmail,
} from "../repositories/coldEmailsRepository";
import type { ColdEmail } from "../types";

export function useColdEmails() {
  const [coldEmails, setColdEmails] = useState<ColdEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllColdEmails();
    setColdEmails(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAllColdEmails();
      if (!cancelled) {
        setColdEmails(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const addColdEmail = useCallback(
    async (data: Omit<ColdEmail, "id" | "createdAt">) => {
      const id = await createColdEmail(data);
      await refresh();
      return id;
    },
    [refresh],
  );

  const editColdEmail = useCallback(
    async (id: number, data: Partial<Omit<ColdEmail, "id" | "createdAt">>) => {
      await updateColdEmail(id, data);
      await refresh();
    },
    [refresh],
  );

  const removeColdEmail = useCallback(
    async (id: number) => {
      await deleteColdEmail(id);
      await refresh();
    },
    [refresh],
  );

  return {
    coldEmails,
    isLoading,
    addColdEmail,
    editColdEmail,
    removeColdEmail,
    refresh,
  };
}
