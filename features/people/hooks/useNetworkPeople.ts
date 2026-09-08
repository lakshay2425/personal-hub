"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createNetworkPerson,
  deleteNetworkPerson,
  getAllNetworkPeople,
  updateNetworkPerson,
} from "../repositories/networkRepository";
import type { NetworkPerson, NetworkPersonInput } from "../types";

export function useNetworkPeople() {
  const [people, setPeople] = useState<NetworkPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllNetworkPeople();
    setPeople(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAllNetworkPeople();
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
    async (data: NetworkPersonInput) => {
      const id = await createNetworkPerson(data);
      await refresh();
      return id;
    },
    [refresh],
  );

  const editPerson = useCallback(
    async (id: number, data: Partial<NetworkPersonInput>) => {
      await updateNetworkPerson(id, data);
      await refresh();
    },
    [refresh],
  );

  const removePerson = useCallback(
    async (id: number) => {
      await deleteNetworkPerson(id);
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
    removePerson,
  };
}
