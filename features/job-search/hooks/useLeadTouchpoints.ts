"use client";

import { useCallback, useEffect, useState } from "react";

import {
  addTouchpoint,
  confirmFollowUpSent,
  deleteTouchpoint,
  getAllLeadsWithTouchpoints,
  getTouchpointsByLeadId,
  updateTouchpoint,
} from "../repositories/leadTouchpointsRepository";
import type { LeadTouchpointInput } from "../repositories/leadTouchpointsRepository";
import type { LeadWithTouchpoints } from "../types";

export function useLeadTouchpoints() {
  const [leadsWithTouchpoints, setLeadsWithTouchpoints] = useState<
    LeadWithTouchpoints[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllLeadsWithTouchpoints();
    setLeadsWithTouchpoints(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAllLeadsWithTouchpoints();
      if (!cancelled) {
        setLeadsWithTouchpoints(data);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const appendTouchpoint = useCallback(
    async (leadId: number, input: LeadTouchpointInput) => {
      const id = await addTouchpoint(leadId, input);
      await refresh();
      return id;
    },
    [refresh],
  );

  const editTouchpoint = useCallback(
    async (id: number, data: Partial<LeadTouchpointInput>) => {
      await updateTouchpoint(id, data);
      await refresh();
    },
    [refresh],
  );

  const removeTouchpoint = useCallback(
    async (id: number) => {
      await deleteTouchpoint(id);
      await refresh();
    },
    [refresh],
  );

  const confirmFollowUp = useCallback(
    async (
      leadId: number,
      which: 1 | 2,
      payload?: Partial<LeadTouchpointInput>,
    ) => {
      const id = await confirmFollowUpSent(leadId, which, payload);
      await refresh();
      return id;
    },
    [refresh],
  );

  const loadTouchpointsForLead = useCallback(async (leadId: number) => {
    return getTouchpointsByLeadId(leadId);
  }, []);

  return {
    leadsWithTouchpoints,
    isLoading,
    refresh,
    appendTouchpoint,
    editTouchpoint,
    removeTouchpoint,
    confirmFollowUp,
    loadTouchpointsForLead,
  };
}

export type { LeadTouchpointInput };
