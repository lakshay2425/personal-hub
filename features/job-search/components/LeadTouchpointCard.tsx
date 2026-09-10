"use client";

import Link from "next/link";

import { backfillLeadProfileFields } from "../lib/leadProfileUtils";
import { formatDate } from "../lib/dateUtils";
import { getTemplateTitle } from "../lib/templateUtils";
import type { Company, LeadWithTouchpoints, Template } from "../types";
import { ChannelBadge } from "./ChannelBadge";
import { LeadCompanyButton } from "./LeadCompanyButton";
import { LeadEmailButton } from "./LeadEmailButton";
import { LeadTouchpointRow } from "./LeadTouchpointRow";
import { mobileActionClass } from "./MobileListCard";
import { StatusBadge } from "./StatusBadge";

interface LeadTouchpointCardProps {
  lead: LeadWithTouchpoints;
  company?: Company;
  templateMap: Map<number, Template>;
  visibleTouchpoints?: LeadWithTouchpoints["touchpoints"];
  onViewCompany: (company: Company) => void;
  onEditLead: () => void;
  onDeleteLead: () => void;
  onAddTouchpoint: () => void;
  onConfirmFollowUp1?: () => void;
  onConfirmFollowUp2?: () => void;
  onEditTouchpoint: (
    touchpoint: LeadWithTouchpoints["touchpoints"][number],
  ) => void;
  onDeleteTouchpoint: (
    touchpoint: LeadWithTouchpoints["touchpoints"][number],
  ) => void;
}

export function LeadTouchpointCard({
  lead,
  company,
  templateMap,
  visibleTouchpoints,
  onViewCompany,
  onEditLead,
  onDeleteLead,
  onAddTouchpoint,
  onConfirmFollowUp1,
  onConfirmFollowUp2,
  onEditTouchpoint,
  onDeleteTouchpoint,
}: LeadTouchpointCardProps) {
  const profiles = backfillLeadProfileFields(lead);
  const touchpoints = visibleTouchpoints ?? lead.touchpoints;

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {lead.name}
            </h3>
            <StatusBadge status={lead.status} />
            <ChannelBadge channel={lead.channel} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <LeadCompanyButton company={company} onView={onViewCompany} />
            {lead.role ? <span>{lead.role}</span> : null}
            {lead.type ? <span>{lead.type}</span> : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <LeadEmailButton email={lead.email} />
            {profiles.linkedin ? (
              <Link
                href={profiles.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:underline dark:text-zinc-400"
              >
                LinkedIn
              </Link>
            ) : null}
            {profiles.xProfile ? (
              <Link
                href={profiles.xProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:underline dark:text-zinc-400"
              >
                X
              </Link>
            ) : null}
          </div>
          {(lead.firstFollowUpDate || lead.secondFollowUpDate) && (
            <div className="mt-2 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              {lead.firstFollowUpDate ? (
                <p>
                  Follow-up 1 planned: {formatDate(lead.firstFollowUpDate)}
                  {lead.followUpTemplateId
                    ? ` · ${getTemplateTitle(templateMap, lead.followUpTemplateId)}`
                    : ""}
                </p>
              ) : null}
              {lead.secondFollowUpDate ? (
                <p>
                  Follow-up 2 planned: {formatDate(lead.secondFollowUpDate)}
                  {lead.followUpTemplateId
                    ? ` · ${getTemplateTitle(templateMap, lead.followUpTemplateId)}`
                    : ""}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEditLead}
            className={mobileActionClass.edit}
          >
            Edit lead
          </button>
          <button
            type="button"
            onClick={onAddTouchpoint}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add touchpoint
          </button>
          {lead.firstFollowUpDate && onConfirmFollowUp1 ? (
            <button
              type="button"
              onClick={onConfirmFollowUp1}
              className={mobileActionClass.edit}
            >
              Confirm follow-up 1
            </button>
          ) : null}
          {lead.secondFollowUpDate && onConfirmFollowUp2 ? (
            <button
              type="button"
              onClick={onConfirmFollowUp2}
              className={mobileActionClass.edit}
            >
              Confirm follow-up 2
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDeleteLead}
            className={mobileActionClass.delete}
          >
            Delete lead
          </button>
        </div>
      </div>

      {touchpoints.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {visibleTouchpoints
            ? "No touchpoints in the selected week."
            : "No touchpoints yet. Add one to log outreach."}
        </p>
      ) : (
        <div className="space-y-3">
          {touchpoints.map((touchpoint) => (
            <LeadTouchpointRow
              key={touchpoint.id}
              touchpoint={touchpoint}
              templateMap={templateMap}
              onEdit={() => onEditTouchpoint(touchpoint)}
              onDelete={() => onDeleteTouchpoint(touchpoint)}
            />
          ))}
        </div>
      )}
    </article>
  );
}
