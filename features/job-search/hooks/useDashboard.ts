"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getDashboardRecent,
  getDashboardStats,
  getTodayFollowUps,
} from "../repositories/dashboardRepository";
import type {
  Application,
  Company,
  DashboardStats,
  FollowUpItem,
  Lead,
  LeadTouchpoint,
  TimeFilter,
} from "../types";

export function useDashboard(filter: TimeFilter) {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    totalLeads: 0,
    totalApplications: 0,
    interviews: 0,
    offers: 0,
  });
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>(
    [],
  );
  const [recentTouchpoints, setRecentTouchpoints] = useState<
    (LeadTouchpoint & { lead?: Lead })[]
  >([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const [statsData, recent, todayFollowUps] = await Promise.all([
      getDashboardStats(filter),
      getDashboardRecent(),
      getTodayFollowUps(),
    ]);
    setStats(statsData);
    setRecentCompanies(recent.companies);
    setRecentLeads(recent.leads);
    setRecentApplications(recent.applications);
    setRecentTouchpoints(recent.recentTouchpoints);
    setFollowUps(todayFollowUps);
    setIsLoading(false);
  }, [filter]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const [statsData, recent, todayFollowUps] = await Promise.all([
        getDashboardStats(filter),
        getDashboardRecent(),
        getTodayFollowUps(),
      ]);
      if (!cancelled) {
        setStats(statsData);
        setRecentCompanies(recent.companies);
        setRecentLeads(recent.leads);
        setRecentApplications(recent.applications);
        setRecentTouchpoints(recent.recentTouchpoints);
        setFollowUps(todayFollowUps);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  return {
    stats,
    recentCompanies,
    recentLeads,
    recentApplications,
    recentTouchpoints,
    followUps,
    isLoading,
    refresh,
  };
}
