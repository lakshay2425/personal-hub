"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createDiscoverPerson,
  deleteDiscoverPerson,
  getAllDiscoverPeople,
  updateDiscoverPerson,
  updateDiscoverPersonStatus,
} from "../repositories/discoverRepository";
import type { DiscoverPerson, DiscoverPersonInput, DiscoverStatus } from "../types";

export function useDiscoverPeople() {
  const [people, setPeople] = useState<DiscoverPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllDiscoverPeople();
    setPeople(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAllDiscoverPeople();
      if (!cancelled) {
        setPeople(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const addPerson = useCallback(
    async (data: DiscoverPersonInput) => {
      const id = await createDiscoverPerson(data);
      await refresh();
      return id;
    },
    [refresh],
  );

  const editPerson = useCallback(
    async (id: number, data: Partial<DiscoverPersonInput>) => {
      await updateDiscoverPerson(id, data);
      await refresh();
    },
    [refresh],
  );

  const changeStatus = useCallback(
    async (id: number, status: DiscoverStatus) => {
      await updateDiscoverPersonStatus(id, status);
      await refresh();
    },
    [refresh],
  );

  const removePerson = useCallback(
    async (id: number) => {
      await deleteDiscoverPerson(id);
      await refresh();
    },
    [refresh],
  );

  return {
    people,
    isLoading,
    refresh,
    addPerson,
    editPerson,
    changeStatus,
    removePerson,
  };
}
