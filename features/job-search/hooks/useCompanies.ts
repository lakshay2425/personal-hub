"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getCompaniesWithCounts,
  getCompanyById,
  getUniqueSectors,
  updateCompany,
} from "../repositories/companiesRepository";
import { getLeadsByCompanyId } from "../repositories/leadsRepository";
import { getApplicationsByCompanyId } from "../repositories/applicationsRepository";
import { getTouchpointsByLeadId } from "../repositories/leadTouchpointsRepository";
import type {
  Application,
  Company,
  CompanyWithCounts,
  Lead,
  LeadTouchpoint,
} from "../types";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesWithCounts, setCompaniesWithCounts] = useState<
    CompanyWithCounts[]
  >([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [all, withCounts, uniqueSectors] = await Promise.all([
      getAllCompanies(),
      getCompaniesWithCounts(),
      getUniqueSectors(),
    ]);
    setCompanies(all);
    setCompaniesWithCounts(withCounts);
    setSectors(uniqueSectors);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [all, withCounts, uniqueSectors] = await Promise.all([
        getAllCompanies(),
        getCompaniesWithCounts(),
        getUniqueSectors(),
      ]);
      if (!cancelled) {
        setCompanies(all);
        setCompaniesWithCounts(withCounts);
        setSectors(uniqueSectors);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const addCompany = useCallback(
    async (data: Omit<Company, "id" | "createdAt" | "updatedAt">) => {
      const id = await createCompany(data);
      await refresh();
      const created = await getCompanyById(id);
      if (!created) {
        throw new Error("Failed to create company");
      }
      return created;
    },
    [refresh],
  );

  const editCompany = useCallback(
    async (id: number, data: Partial<Omit<Company, "id" | "createdAt">>) => {
      await updateCompany(id, data);
      await refresh();
    },
    [refresh],
  );

  const removeCompany = useCallback(
    async (id: number) => {
      await deleteCompany(id);
      await refresh();
    },
    [refresh],
  );

  return {
    companies,
    companiesWithCounts,
    sectors,
    isLoading,
    addCompany,
    editCompany,
    removeCompany,
    refresh,
  };
}

export function useCompany(id: number) {
  const [company, setCompany] = useState<Company | undefined>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [touchpointsByLeadId, setTouchpointsByLeadId] = useState<
    Map<number, LeadTouchpoint[]>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [c, l, a] = await Promise.all([
      getCompanyById(id),
      getLeadsByCompanyId(id),
      getApplicationsByCompanyId(id),
    ]);

    const touchpointEntries = await Promise.all(
      l.map(async (lead) => {
        if (!lead.id) return [0, [] as LeadTouchpoint[]] as const;
        const touchpoints = await getTouchpointsByLeadId(lead.id);
        return [lead.id, touchpoints] as const;
      }),
    );

    setCompany(c);
    setLeads(l);
    setApplications(a);
    setTouchpointsByLeadId(new Map(touchpointEntries));
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [c, l, a] = await Promise.all([
        getCompanyById(id),
        getLeadsByCompanyId(id),
        getApplicationsByCompanyId(id),
      ]);

      const touchpointEntries = await Promise.all(
        l.map(async (lead) => {
          if (!lead.id) return [0, [] as LeadTouchpoint[]] as const;
          const touchpoints = await getTouchpointsByLeadId(lead.id);
          return [lead.id, touchpoints] as const;
        }),
      );

      if (!cancelled) {
        setCompany(c);
        setLeads(l);
        setApplications(a);
        setTouchpointsByLeadId(new Map(touchpointEntries));
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return {
    company,
    leads,
    applications,
    touchpointsByLeadId,
    isLoading,
    refresh,
  };
}
