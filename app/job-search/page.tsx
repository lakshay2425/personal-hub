"use client";

import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { StatsCard } from "@/features/job-search/components/StatsCard";
import { StatusBadge } from "@/features/job-search/components/StatusBadge";
import { TimeFilterPills } from "@/features/job-search/components/TimeFilterPills";
import { useDashboard } from "@/features/job-search/hooks/useDashboard";
import { useCompanies } from "@/features/job-search/hooks/useCompanies";
import { useLeads } from "@/features/job-search/hooks/useLeads";
import { formatDate, formatTimestamp } from "@/features/job-search/lib/dateUtils";
import type { TimeFilter } from "@/features/job-search/types";

function getCompanyName(
  companyId: number,
  companies: { id?: number; companyName: string }[],
) {
  return companies.find((c) => c.id === companyId)?.companyName ?? "Unknown";
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<TimeFilter>("last30");
  const {
    stats,
    recentCompanies,
    recentLeads,
    recentApplications,
    recentColdEmails,
    followUps,
    isLoading,
  } = useDashboard(filter);
  const { companies } = useCompanies();
  const { leads } = useLeads();

  if (isLoading) return <LoadingState message="Loading dashboard..." />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your job search activity"
      />

      <div className="mb-8">
        <TimeFilterPills value={filter} onChange={setFilter} />
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Total Companies" value={stats.totalCompanies} />
        <StatsCard label="Total Leads" value={stats.totalLeads} />
        <StatsCard label="Applications" value={stats.totalApplications} />
        <StatsCard label="Interviews" value={stats.interviews} />
        <StatsCard label="Offers" value={stats.offers} />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Today&apos;s Follow-ups
        </h2>
        {followUps.length === 0 ? (
          <EmptyState
            title="No follow-ups today"
            description="You're all caught up for today."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Company
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Lead Name
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Role
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Follow-up Type
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {followUps.map((item, idx) => (
                  <tr key={`${item.entityType}-${item.entityId}-${item.followUpType}-${idx}`}>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                      {item.companyName}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {item.leadName}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {item.role || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.followUpType} variant="info" />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={
                          item.entityType === "lead"
                            ? "/job-search/leads"
                            : "/job-search/cold-emails"
                        }
                        className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mb-10 grid gap-8 lg:grid-cols-3">
        <RecentSection title="Recently Added Companies">
          {recentCompanies.length === 0 ? (
            <EmptyState
              title="No companies yet"
              description="Add your first company to get started."
              action={
                <Link
                  href="/job-search/companies"
                  className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                >
                  Go to Companies →
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {recentCompanies.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/job-search/companies/${c.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {c.companyName}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {formatTimestamp(c.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </RecentSection>

        <RecentSection title="Recently Added Leads">
          {recentLeads.length === 0 ? (
            <EmptyState
              title="No leads yet"
              description="Add leads to track your network."
            />
          ) : (
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {recentLeads.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {l.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {getCompanyName(l.companyId, companies)}
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </RecentSection>

        <RecentSection title="Recently Applied Jobs">
          {recentApplications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Track your job applications here."
            />
          ) : (
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {recentApplications.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {a.role}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {getCompanyName(a.companyId, companies)} ·{" "}
                      {formatDate(a.appliedDate)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </RecentSection>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Recent Cold Emails
        </h2>
        {recentColdEmails.length === 0 ? (
          <EmptyState
            title="No cold emails yet"
            description="Track your outreach emails here."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Company
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Lead
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Sent Date
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recentColdEmails.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                      {getCompanyName(e.companyId, companies)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {leads.find((l) => l.id === e.leadId)?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {formatDate(e.sentDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function RecentSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      {children}
    </div>
  );
}
