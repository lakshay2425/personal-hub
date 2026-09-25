"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getDashboardRecent,
  getDashboardStats,
} from "../repositories/dashboardRepository";
import type {
  Application,
  Company,
  DashboardStats,
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
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const [statsData, recent] = await Promise.all([
      getDashboardStats(filter),
      getDashboardRecent(),
    ]);
    setStats(statsData);
    setRecentCompanies(recent.companies);
    setRecentLeads(recent.leads);
    setRecentApplications(recent.applications);
    setRecentTouchpoints(recent.recentTouchpoints);
    setIsLoading(false);
  }, [filter]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const [statsData, recent] = await Promise.all([
        getDashboardStats(filter),
        getDashboardRecent(),
      ]);
      if (!cancelled) {
        setStats(statsData);
        setRecentCompanies(recent.companies);
        setRecentLeads(recent.leads);
        setRecentApplications(recent.applications);
        setRecentTouchpoints(recent.recentTouchpoints);
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
    isLoading,
    refresh,
  };
}
