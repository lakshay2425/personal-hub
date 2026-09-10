"use client";

import type { Company, LeadWithTouchpoints } from "../types";
import { ChannelBadge } from "./ChannelBadge";
import { StatusBadge } from "./StatusBadge";

interface LeadListRowProps {
  lead: LeadWithTouchpoints;
  company?: Company;
  onClick: () => void;
}

export function LeadListRow({ lead, company, onClick }: LeadListRowProps) {
  const touchpointCount = lead.touchpoints.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {lead.name}
          </span>
          <StatusBadge status={lead.status} />
          <ChannelBadge channel={lead.channel} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{company?.companyName ?? "Unknown company"}</span>
          {lead.role ? <span>{lead.role}</span> : null}
          {lead.type ? <span>{lead.type}</span> : null}
        </div>
      </div>
      <div className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
        {touchpointCount === 0
          ? "No touchpoints"
          : `${touchpointCount} touchpoint${touchpointCount === 1 ? "" : "s"}`}
      </div>
    </button>
  );
}
