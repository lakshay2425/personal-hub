"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { StatsCard } from "@/features/job-search/components/StatsCard";
import { TimeFilterPills } from "@/features/job-search/components/TimeFilterPills";
import { useDashboard } from "@/features/job-search/hooks/useDashboard";
import type { TimeFilter } from "@/features/job-search/types";

const sectionClass = "mb-10";
const gridClass = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

export default function DashboardPage() {
  const [filter, setFilter] = useState<TimeFilter>("last30");
  const { stats, followUps, staleOutreach, isLoading } = useDashboard(filter);
  if (isLoading) return <LoadingState message="Loading dashboard..." />;
  return <div>
    <PageHeader title="Dashboard" description="Actionable outreach and application activity" />
    <div className="mb-8"><TimeFilterPills value={filter} onChange={setFilter} /></div>

    <DashboardSection title="LinkedIn Outreach Stats" className={sectionClass}>
      <div className={gridClass}>
        <StatsCard label="Requests Sent — Not Accepted" value={stats.linkedinNew} href="/job-search/leads?channel=LinkedIn&status=New" />
        <StatsCard label="Messages Sent — No Reply" value={stats.linkedinContacted} href="/job-search/leads?channel=LinkedIn&status=Contacted" />
        <StatsCard label="Messages Sent — Replied" value={stats.linkedinReplied} href="/job-search/leads?channel=LinkedIn&status=Replied" />
      </div>
    </DashboardSection>

    <DashboardSection title="Email Outreach Stats" className={sectionClass}>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard label="Emails Sent — No Reply" value={stats.emailNoReply} href="/job-search/cold-emails?status=Sent" />
        <StatsCard label="Emails Sent — Replied" value={stats.emailReplied} href="/job-search/cold-emails?status=Replied" />
      </div>
    </DashboardSection>

    <DashboardSection title="Applications Stats" className={sectionClass}>
      <div className={gridClass}>
        <StatsCard label="Applied — No Update" value={stats.applicationsApplied} href="/job-search/applications?status=Applied" />
        <StatsCard label="Interview Stage" value={stats.interviews} href="/job-search/applications?status=Interview" />
        <StatsCard label="Offers" value={stats.offers} href="/job-search/applications?status=Offer" />
      </div>
    </DashboardSection>

    <DashboardSection title="Follow-ups Due Today" className={sectionClass}>
      {followUps.length === 0 ? <EmptyState title="No follow-ups due today." description="You have no outreach scheduled for today." /> : <DashboardList items={followUps.map((item) => ({ ...item, detail: `${item.channel} · ${item.type}` }))} />}
    </DashboardSection>

    <DashboardSection title="Stale Outreach">
      {staleOutreach.length === 0 ? <EmptyState title="No stale outreach. You're on top of things." description="All active outreach has been touched recently." /> : <DashboardList items={staleOutreach.map((item) => ({ ...item, detail: `${item.channel} · ${item.daysSinceLastTouchpoint} days since last touchpoint` }))} />}
    </DashboardSection>
  </div>;
}

function DashboardSection({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return <section className={className}><h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>{children}</section>;
}

function DashboardList({ items }: { items: Array<{ id: number; name: string; companyName: string; detail: string; href: string }> }) {
  return <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">{items.map((item) => <li key={`${item.id}-${item.detail}`}><Link href={item.href} className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"><span className="min-w-0"><span className="block break-words font-medium text-zinc-900 dark:text-zinc-50">{item.name}</span><span className="block break-words text-sm text-zinc-500">{item.companyName} · {item.detail}</span></span><span className="text-zinc-400">→</span></Link></li>)}</ul>;
}
