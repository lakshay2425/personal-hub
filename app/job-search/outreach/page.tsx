"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCompanies } from "@/features/job-search/hooks/useCompanies";
import { useLeads } from "@/features/job-search/hooks/useLeads";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { getOutreachQueueGroups } from "@/features/job-search/lib/outreachQueue";

export default function OutreachPage() {
  const { leads, isLoading } = useLeads();
  const { companies } = useCompanies();
  const companyNames = useMemo(() => new Map(companies.map((company) => [company.id, company.companyName])), [companies]);
  const groups = getOutreachQueueGroups(leads);

  if (isLoading) return <LoadingState message="Loading outreach list..." />;
  return <div>
    <PageHeader title="Outreach queue" description="People scheduled for a specific day appear here. Use the lead’s three-dot menu to add, reschedule, or remove them." />
    {groups.length === 0 ? <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">Your outreach queue is empty. Open a lead’s three-dot menu and choose “Move to outreach…” to set a date.</div> : groups.map((group) => <section key={group.title} className="mb-7"><h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{group.title}</h2><ul className="space-y-3">{group.leads.map((lead) => <li key={lead.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><Link href={`/job-search/leads?leadId=${lead.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">{lead.name}</Link><p className="mt-1 text-sm text-zinc-500">{companyNames.get(lead.companyId) ?? "Unknown company"}{lead.role ? ` · ${lead.role}` : ""}</p><p className="mt-1 text-sm text-zinc-500">{lead.email || lead.linkedin || lead.xProfile || "No email or profile saved"}</p></li>)}</ul></section>)}
    <Link href="/job-search/leads" className="mt-5 inline-block text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">Browse leads →</Link>
  </div>;
}
