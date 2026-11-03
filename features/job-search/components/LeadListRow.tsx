"use client";

import type { Company, LeadWithTouchpoints } from "../types";
import { AlumniBadge } from "./AlumniBadge";
import { LeadEmailButton } from "./LeadEmailButton";
import { LeadSocialLinks } from "./LeadSocialLinks";

interface LeadListRowProps {
  lead: LeadWithTouchpoints;
  company?: Company;
  onClick: () => void;
}

export function LeadListRow({ lead, company, onClick }: LeadListRowProps) {
  const touchpointCount = lead.touchpoints.length;

  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onClick}
        className="min-w-0 flex-1 text-left"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {lead.name}
            </span>
            {lead.isAlumni === true ? <AlumniBadge /> : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{company?.companyName ?? "Unknown company"}</span>
            {lead.role ? <span>{lead.role}</span> : null}
          </div>
        </div>
        <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {touchpointCount === 0
            ? "No touchpoints"
            : `${touchpointCount} touchpoint${touchpointCount === 1 ? "" : "s"}`}
        </div>
      </button>
      <div className="flex shrink-0 items-center gap-3">
        {lead.email.trim() ? <LeadEmailButton email={lead.email} /> : null}
        <LeadSocialLinks lead={lead} />
      </div>
    </div>
  );
}
