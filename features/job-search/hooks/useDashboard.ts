"use client";

import { useCallback, useEffect, useState } from "react";
import { getDashboardCalendarItems, getDashboardStats } from "../repositories/dashboardRepository";
import type { DashboardCalendarItem, DashboardStats, TimeFilter } from "../types";

const EMPTY_STATS: DashboardStats = { totalTouchpoints: 0, linkedinTouchpoints: 0, xTouchpoints: 0, emailTouchpoints: 0, linkedinMessageDrafts: 0, emailDrafts: 0, linkedinConnectionNotAccepted: 0, linkedinConnectionNotAcceptedNotSnoozed: 0, linkedinConnectionNotAcceptedSnoozed: 0, linkedinMessagesNoReply: 0, linkedinMessagesReplied: 0, linkedinConnectionAccepted: 0, linkedinConnectionAcceptedNotSnoozed: 0, linkedinConnectionAcceptedSnoozed: 0, emailNoReply: 0, emailReplied: 0, applicationsApplied: 0, interviews: 0, applicationsRejected: 0, offers: 0 };

export function useDashboard(filter: TimeFilter) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [calendarItems, setCalendarItems] = useState<DashboardCalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const load = useCallback(async () => {
    setIsLoading(true);
    const [statsData, items] = await Promise.all([getDashboardStats(filter), getDashboardCalendarItems()]);
    setStats(statsData); setCalendarItems(items); setIsLoading(false);
  }, [filter]);
  useEffect(() => {
    // Dashboard data is an external IndexedDB source; refresh when the selected range changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  return { stats, calendarItems, isLoading, refresh: load };
}
