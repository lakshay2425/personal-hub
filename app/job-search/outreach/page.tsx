"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { BulkOutreachModal, OutreachLeadDateEditor } from "@/features/job-search/components/OutreachQueueActions";
import { LeadEmailButton } from "@/features/job-search/components/LeadEmailButton";
import { LeadSocialLinks } from "@/features/job-search/components/LeadSocialLinks";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { useCompanies } from "@/features/job-search/hooks/useCompanies";
import { useLeads } from "@/features/job-search/hooks/useLeads";
import { getOutreachQueueGroups } from "@/features/job-search/lib/outreachQueue";

export default function OutreachPage() {
  const { leads, isLoading, scheduleLeads } = useLeads();
  const { companies } = useCompanies();
  const companyNames = useMemo(
    () => new Map(companies.map((company) => [company.id, company.companyName])),
    [companies],
  );
  const groups = getOutreachQueueGroups(leads);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const todayCount = groups.find((group) => group.title === "Today")?.leads.length ?? 0;
  const tomorrowCount = groups.find((group) => group.title === "Tomorrow")?.leads.length ?? 0;

  if (isLoading) return <LoadingState message="Loading outreach list..." />;

  return (
    <div>
      <PageHeader title="Outreach queue" description="Schedule and manage new-conversation outreach by day." />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Add one lead from its row, or schedule several leads together.</p>
        <button type="button" onClick={() => setIsBulkModalOpen(true)} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">Add leads</button>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mr-auto text-sm font-medium text-zinc-700 dark:text-zinc-300">Today and tomorrow: {todayCount + tomorrowCount} {todayCount + tomorrowCount === 1 ? "lead" : "leads"}</p>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800 dark:bg-blue-950/50 dark:text-blue-200">Today · {todayCount}</span>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-sm text-violet-800 dark:bg-violet-950/50 dark:text-violet-200">Tomorrow · {tomorrowCount}</span>
      </div>
      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">Your outreach queue is empty. Use “Add leads” to schedule one or more leads.</div>
      ) : groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.title);
        return (
          <section key={group.title} className="mb-7">
            <button type="button" aria-expanded={!isCollapsed} onClick={() => setCollapsedGroups((current) => { const next = new Set(current); if (next.has(group.title)) next.delete(group.title); else next.add(group.title); return next; })} className="mb-3 flex w-full items-center gap-2 text-left text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              {group.title}
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{group.leads.length}</span>
            </button>
            {!isCollapsed ? (
              <ul className="space-y-3">
                {group.leads.map((lead) => (
                  <li key={lead.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/job-search/leads?leadId=${lead.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">{lead.name}</Link>
                        <p className="mt-1 text-sm text-zinc-500">{companyNames.get(lead.companyId) ?? "Unknown company"}{lead.role ? ` · ${lead.role}` : ""}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {lead.email.trim() ? <LeadEmailButton email={lead.email} /> : null}
                        <LeadSocialLinks lead={lead} />
                        <OutreachLeadDateEditor lead={lead} scheduleLeads={scheduleLeads} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
      <BulkOutreachModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} leads={leads} companyNames={companyNames} scheduleLeads={scheduleLeads} />
      <Link href="/job-search/leads" className="mt-5 inline-block text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">Browse leads →</Link>
    </div>
  );
}
