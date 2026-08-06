"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createApplication,
  deleteApplication,
  getAllApplications,
  updateApplication,
} from "../repositories/applicationsRepository";
import type { Application } from "../types";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllApplications();
    setApplications(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAllApplications();
      if (!cancelled) {
        setApplications(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const addApplication = useCallback(
    async (data: Omit<Application, "id" | "createdAt">) => {
      const id = await createApplication(data);
      await refresh();
      return id;
    },
    [refresh],
  );

  const editApplication = useCallback(
    async (
      id: number,
      data: Partial<Omit<Application, "id" | "createdAt">>,
    ) => {
      await updateApplication(id, data);
      await refresh();
    },
    [refresh],
  );

  const removeApplication = useCallback(
    async (id: number) => {
      await deleteApplication(id);
      await refresh();
    },
    [refresh],
  );

  return {
    applications,
    isLoading,
    addApplication,
    editApplication,
    removeApplication,
    refresh,
  };
}
