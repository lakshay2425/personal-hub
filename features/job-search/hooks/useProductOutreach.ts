"use client";

import { useCallback, useEffect, useState } from "react";

import {
  addInteraction,
  createContactWithInteraction,
  deleteContact,
  deleteInteraction,
  getAllContactsWithInteractions,
  updateContactLabel,
  updateInteraction,
} from "../repositories/productOutreachRepository";
import type { ProductOutreachInteractionInput } from "../repositories/productOutreachRepository";
import type { ProductOutreachContactWithInteractions } from "../types";

export function useProductOutreach() {
  const [contacts, setContacts] = useState<
    ProductOutreachContactWithInteractions[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllContactsWithInteractions();
    setContacts(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAllContactsWithInteractions();
      if (!cancelled) {
        setContacts(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const addContact = useCallback(
    async (label: string, interaction: ProductOutreachInteractionInput) => {
      const id = await createContactWithInteraction(label, interaction);
      await refresh();
      return id;
    },
    [refresh],
  );

  const appendInteraction = useCallback(
    async (contactId: number, interaction: ProductOutreachInteractionInput) => {
      const id = await addInteraction(contactId, interaction);
      await refresh();
      return id;
    },
    [refresh],
  );

  const editInteraction = useCallback(
    async (id: number, data: Partial<ProductOutreachInteractionInput>) => {
      await updateInteraction(id, data);
      await refresh();
    },
    [refresh],
  );

  const removeInteraction = useCallback(
    async (id: number) => {
      await deleteInteraction(id);
      await refresh();
    },
    [refresh],
  );

  const removeContact = useCallback(
    async (id: number) => {
      await deleteContact(id);
      await refresh();
    },
    [refresh],
  );

  const editContactLabel = useCallback(
    async (id: number, label: string) => {
      await updateContactLabel(id, label);
      await refresh();
    },
    [refresh],
  );

  return {
    contacts,
    isLoading,
    refresh,
    addContact,
    appendInteraction,
    editInteraction,
    removeInteraction,
    removeContact,
    editContactLabel,
  };
}

export type { ProductOutreachInteractionInput };
