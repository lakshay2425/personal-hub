"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { StatsCard } from "@/features/job-search/components/StatsCard";
import { TimeFilterPills } from "@/features/job-search/components/TimeFilterPills";
import { useDashboard } from "@/features/job-search/hooks/useDashboard";
import type { TimeFilter } from "@/features/job-search/types";
import { getWeeklyGoalProgress, type WeeklyGoalProgress } from "@/features/job-search/repositories/weeklyTargetsRepository";
import { formatWeekRange } from "@/features/job-search/lib/dateUtils";

const sectionClass = "mb-10";
const gridClass = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

function outreachHref(
  channel: string,
  types: string[],
  responseStatus: string,
  snoozeFilter?: "active" | "snoozed",
) {
  const query = new URLSearchParams({
    view: "byTouchpoint",
    touchpointChannel: channel,
    touchpointStatus: "Sent",
    touchpointResponse: responseStatus,
  });
  for (const type of types) query.append("touchpointType", type);
  if (snoozeFilter) query.set("snoozeFilter", snoozeFilter);
  const route = channel === "Email" ? "/job-search/cold-emails" : "/job-search/leads";
  return `${route}?${query.toString()}`;
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<TimeFilter>("last30");
  const { stats, followUps, staleOutreach, isLoading } = useDashboard(filter);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoalProgress[]>([]);
  const [weekStart, setWeekStart] = useState("");
  useEffect(() => {
    let active = true;
    void getWeeklyGoalProgress().then(({ goals, weekStart: start }) => {
      if (active) {
        setWeeklyGoals(goals);
        setWeekStart(start);
      }
    });
    return () => { active = false; };
  }, []);
  if (isLoading) return <LoadingState message="Loading dashboard..." />;
  return <div>
    <PageHeader title="Dashboard" description="Actionable outreach and application activity" />
    <div className="mb-8"><TimeFilterPills value={filter} onChange={setFilter} /></div>

    {weeklyGoals.length > 0 ? <DashboardSection title={`Weekly targets · ${formatWeekRange(weekStart)}`} className={sectionClass}>
      <div className="grid gap-4 sm:grid-cols-2">
        {weeklyGoals.map((goal) => {
          const remaining = Math.max(0, goal.target - goal.count);
          const today = new Date();
          const daysLeft = Math.max(1, 7 - ((today.getDay() + 6) % 7));
          const percent = Math.min(100, Math.round((goal.count / goal.target) * 100));
          return <div key={goal.id} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{goal.label}</h3>
              <span className="text-sm text-zinc-500">{goal.count} / {goal.target}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${goal.label} weekly progress`}>
              <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-zinc-500">{percent}% · {remaining === 0 ? "Target reached" : `${remaining} remaining · ${Math.ceil(remaining / daysLeft)} per day to stay on pace`}</p>
          </div>;
        })}
      </div>
    </DashboardSection> : <DashboardSection title="Weekly targets" className={sectionClass}>
      <Link href="/job-search/settings" className="block rounded-xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-500 hover:border-zinc-500 dark:border-zinc-700">Set weekly targets for applications and outreach →</Link>
    </DashboardSection>}

    <DashboardSection title="LinkedIn Outreach Stats" className={sectionClass}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ConnectionRequestStatsCard
          label="Connection Requests — Not Accepted"
          notSnoozed={stats.linkedinConnectionNotAcceptedNotSnoozed}
          snoozed={stats.linkedinConnectionNotAcceptedSnoozed}
          notSnoozedHref={outreachHref("LinkedIn", ["Connection Request"], "Not accepted", "active")}
          snoozedHref={outreachHref("LinkedIn", ["Connection Request"], "Not accepted", "snoozed")}
        />
        <StatsCard label="Messages Sent — No Reply" value={stats.linkedinMessagesNoReply} href={outreachHref("LinkedIn", ["Follow-up", "Message"], "Not responded")} />
        <StatsCard label="Messages Sent — Replied" value={stats.linkedinMessagesReplied} href={outreachHref("LinkedIn", ["Message", "Follow-up"], "Replied")} />
        <ConnectionRequestStatsCard
          label="Connection Requests — Accepted"
          notSnoozed={stats.linkedinConnectionAcceptedNotSnoozed}
          snoozed={stats.linkedinConnectionAcceptedSnoozed}
          notSnoozedHref={outreachHref("LinkedIn", ["Connection Request"], "Accepted", "active")}
          snoozedHref={outreachHref("LinkedIn", ["Connection Request"], "Accepted", "snoozed")}
        />
      </div>
    </DashboardSection>

    <DashboardSection title="Email Outreach Stats" className={sectionClass}>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard label="Emails Sent — No Reply" value={stats.emailNoReply} href={outreachHref("Email", ["Message", "Follow-up", "First Follow-up", "Second Follow-up"], "Not responded")} />
        <StatsCard label="Emails Sent — Replied" value={stats.emailReplied} href={outreachHref("Email", ["Message", "First Follow-up", "Second Follow-up"], "Replied")} />
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

function ConnectionRequestStatsCard({
  label,
  notSnoozed,
  snoozed,
  notSnoozedHref,
  snoozedHref,
}: {
  label: string;
  notSnoozed: number;
  snoozed: number;
  notSnoozedHref: string;
  snoozedHref: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href={notSnoozedHref}
          aria-label={`${notSnoozed} not snoozed leads for ${label}`}
          className="rounded-lg border border-zinc-200 p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        >
          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
            Not snoozed leads
          </span>
          <span className="mt-1 block text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {notSnoozed}
          </span>
        </Link>
        <Link
          href={snoozedHref}
          aria-label={`${snoozed} snoozed leads for ${label}`}
          className="rounded-lg border border-zinc-200 p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        >
          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
            Snoozed leads
          </span>
          <span className="mt-1 block text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {snoozed}
          </span>
        </Link>
      </div>
    </div>
  );
}
