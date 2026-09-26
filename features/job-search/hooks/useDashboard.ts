"use client";

import { useCallback, useEffect, useState } from "react";
import { getDashboardLists, getDashboardStats } from "../repositories/dashboardRepository";
import type { DashboardFollowUpItem, DashboardStaleOutreachItem, DashboardStats, TimeFilter } from "../types";

const EMPTY_STATS: DashboardStats = { linkedinConnectionNotAccepted: 0, linkedinMessagesNoReply: 0, linkedinMessagesReplied: 0, linkedinConnectionAccepted: 0, emailNoReply: 0, emailReplied: 0, applicationsApplied: 0, interviews: 0, offers: 0 };

export function useDashboard(filter: TimeFilter) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [followUps, setFollowUps] = useState<DashboardFollowUpItem[]>([]);
  const [staleOutreach, setStaleOutreach] = useState<DashboardStaleOutreachItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const load = useCallback(async () => {
    setIsLoading(true);
    const [statsData, lists] = await Promise.all([getDashboardStats(filter), getDashboardLists()]);
    setStats(statsData); setFollowUps(lists.followUps); setStaleOutreach(lists.staleOutreach); setIsLoading(false);
  }, [filter]);
  useEffect(() => {
    // Dashboard data is an external IndexedDB source; refresh when the selected range changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  return { stats, followUps, staleOutreach, isLoading, refresh: load };
}
