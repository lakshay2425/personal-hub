"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createTemplate,
  deleteTemplate,
  getAllTemplates,
  updateTemplate,
} from "../repositories/templatesRepository";
import type { Template } from "../types";

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllTemplates();
    setTemplates(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAllTemplates();
      if (!cancelled) {
        setTemplates(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const addTemplate = useCallback(
    async (data: Omit<Template, "id" | "createdAt" | "updatedAt">) => {
      const id = await createTemplate(data);
      await refresh();
      return id;
    },
    [refresh],
  );

  const editTemplate = useCallback(
    async (
      id: number,
      data: Partial<Omit<Template, "id" | "createdAt">>,
    ) => {
      await updateTemplate(id, data);
      await refresh();
    },
    [refresh],
  );

  const removeTemplate = useCallback(
    async (id: number) => {
      await deleteTemplate(id);
      await refresh();
    },
    [refresh],
  );

  return {
    templates,
    isLoading,
    addTemplate,
    editTemplate,
    removeTemplate,
    refresh,
  };
}
