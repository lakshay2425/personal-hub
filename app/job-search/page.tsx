"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { StatsCard } from "@/features/job-search/components/StatsCard";
import { TimeFilterPills } from "@/features/job-search/components/TimeFilterPills";
import { useDashboard } from "@/features/job-search/hooks/useDashboard";
import type { TimeFilter } from "@/features/job-search/types";
import { getWeeklyGoalProgress, type WeeklyGoalProgress } from "@/features/job-search/repositories/weeklyTargetsRepository";
import { formatWeekRange } from "@/features/job-search/lib/dateUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const sectionClass = "mb-10";

function outreachHref(
  channel: string,
  types: string[],
  responseStatus: string,
  snoozeFilter?: "active" | "snoozed",
  status = "Sent",
) {
  const query = new URLSearchParams({
    view: "byTouchpoint",
    touchpointChannel: channel,
    touchpointStatus: status,
  });
  if (responseStatus) query.set("touchpointResponse", responseStatus);
  for (const type of types) query.append("touchpointType", type);
  if (snoozeFilter) query.set("snoozeFilter", snoozeFilter);
  const route = channel === "Email" ? "/job-search/cold-emails" : "/job-search/leads";
  return `${route}?${query.toString()}`;
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<TimeFilter>("last30");
  const { stats, calendarItems, isLoading } = useDashboard(filter);
  const [calendarFilter, setCalendarFilter] = useState<"all" | "followUp" | "newConversation">("all");
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoalProgress[]>([]);
  const [weekStart, setWeekStart] = useState("");
  const [followUpWeek, setFollowUpWeek] = useState(() => {
    const day = new Date();
    day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
    day.setHours(0, 0, 0, 0);
    return day;
  });
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

    <DashboardSection title="Touchpoint Activity" className={sectionClass}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Touchpoints" value={stats.totalTouchpoints} />
        <StatsCard label="LinkedIn Touchpoints" value={stats.linkedinTouchpoints} href={outreachHref("LinkedIn", [], "", undefined, "")} />
        <StatsCard label="X Touchpoints" value={stats.xTouchpoints} />
        <StatsCard label="Email Touchpoints" value={stats.emailTouchpoints} href={outreachHref("Email", [], "", undefined, "")} />
      </div>
    </DashboardSection>

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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ConnectionRequestStatsCard
          label="Connection Requests — Not Accepted"
          notSnoozed={stats.linkedinConnectionNotAcceptedNotSnoozed}
          snoozed={stats.linkedinConnectionNotAcceptedSnoozed}
          notSnoozedHref={outreachHref("LinkedIn", ["Connection Request"], "Not accepted", "active")}
          snoozedHref={outreachHref("LinkedIn", ["Connection Request"], "Not accepted", "snoozed")}
        />
        <StatsCard label="Message Drafts Saved" value={stats.linkedinMessageDrafts} href={outreachHref("LinkedIn", ["Message Draft"], "", undefined, "Draft")} />
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard label="Emails Sent — No Reply" value={stats.emailNoReply} href={outreachHref("Email", ["Message", "Follow-up", "First Follow-up", "Second Follow-up"], "Not responded")} />
        <StatsCard label="Emails Sent — Replied" value={stats.emailReplied} href={outreachHref("Email", ["Message", "First Follow-up", "Second Follow-up"], "Replied")} />
        <StatsCard label="Email Drafts Saved" value={stats.emailDrafts} href={outreachHref("Email", [], "", undefined, "Draft")} />
      </div>
    </DashboardSection>

    <DashboardSection title="Applications Stats" className={sectionClass}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Applied — No Update" value={stats.applicationsApplied} href="/job-search/applications?status=Applied" />
        <StatsCard label="Interview Stage" value={stats.interviews} href="/job-search/applications?status=Interview" />
        <StatsCard label="Rejected" value={stats.applicationsRejected} href="/job-search/applications?status=Rejected" />
        <StatsCard label="Offers" value={stats.offers} href="/job-search/applications?status=Offer" />
      </div>
    </DashboardSection>

    <DashboardSection title="Follow-up calendar" className={sectionClass}>
      <div className="mb-3 flex flex-wrap gap-2">
        {([{ value: "all", label: "All scheduled" }, { value: "followUp", label: "Follow-ups" }, { value: "newConversation", label: "New conversations" }] as const).map((option) => <button key={option.value} type="button" aria-pressed={calendarFilter === option.value} onClick={() => setCalendarFilter(option.value)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${calendarFilter === option.value ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"}`}>{option.label}</button>)}
      </div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{followUpWeek.toLocaleDateString(undefined, { month: "long", day: "numeric" })} – {new Date(followUpWeek.getTime() + 6 * 86400000).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</div>
        <div className="flex gap-1">
          <button aria-label="Previous week" onClick={() => setFollowUpWeek(new Date(followUpWeek.getTime() - 7 * 86400000))} className="rounded-lg border border-zinc-300 p-2 dark:border-zinc-700"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); d.setHours(0,0,0,0); setFollowUpWeek(d); }} className="rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700">This week</button>
          <button aria-label="Next week" onClick={() => setFollowUpWeek(new Date(followUpWeek.getTime() + 7 * 86400000))} className="rounded-lg border border-zinc-300 p-2 dark:border-zinc-700"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {Array.from({ length: 7 }, (_, index) => {
          const day = new Date(followUpWeek.getTime() + index * 86400000);
          const dateKey = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`;
          const items = calendarItems.filter((item) => item.date === dateKey && (calendarFilter === "all" || item.kind === calendarFilter));
          const today = new Date(); today.setHours(0,0,0,0);
          const overdue = day < today;
          return <div key={dateKey} className={`min-h-32 rounded-xl border p-3 ${overdue ? "border-amber-300 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>
            <div className="mb-2 text-xs font-semibold uppercase text-zinc-500">{day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}{overdue ? " · Missed" : ""}</div>
            {items.length ? <div className="space-y-1">{items.map((item) => <Link key={`${item.kind}-${item.id}`} href={item.href} className={`block rounded-md px-2 py-1.5 text-xs ${item.kind === "followUp" ? "border border-red-300 bg-red-50 text-red-950 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100 dark:hover:bg-red-900/60" : "bg-blue-50 text-blue-900 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-200 dark:hover:bg-blue-900/60"}`}><span className="block font-bold">{item.kind === "followUp" ? "FOLLOW-UP · HIGH PRIORITY" : "NEW CONVERSATION"}</span><span className="block font-medium">{item.name}</span><span>{item.companyName} · {item.channel}</span></Link>)}</div> : <p className="text-xs text-zinc-400">No scheduled items</p>}
          </div>;
        })}
      </div>
    </DashboardSection>

  </div>;
}

function DashboardSection({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return <section className={className}><h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>{children}</section>;
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
