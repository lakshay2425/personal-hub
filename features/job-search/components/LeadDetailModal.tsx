"use client";

import Link from "next/link";

import { Modal } from "@/components/ui/Modal";

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

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadWithTouchpoints | null;
  company?: Company;
  templateMap: Map<number, Template>;
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

export function LeadDetailModal({
  isOpen,
  onClose,
  lead,
  company,
  templateMap,
  onViewCompany,
  onEditLead,
  onDeleteLead,
  onAddTouchpoint,
  onConfirmFollowUp1,
  onConfirmFollowUp2,
  onEditTouchpoint,
  onDeleteTouchpoint,
}: LeadDetailModalProps) {
  if (!lead) return null;

  const profiles = backfillLeadProfileFields(lead);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lead.name} size="lg">
      <div className="space-y-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={lead.status} />
            <ChannelBadge channel={lead.channel} />
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">Company</span>
              <div className="mt-0.5">
                <LeadCompanyButton company={company} onView={onViewCompany} />
              </div>
            </div>
            {lead.role ? (
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Role</span>
                <p className="mt-0.5 text-zinc-900 dark:text-zinc-50">
                  {lead.role}
                </p>
              </div>
            ) : null}
            {lead.type ? (
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Type</span>
                <p className="mt-0.5 text-zinc-900 dark:text-zinc-50">
                  {lead.type}
                </p>
              </div>
            ) : null}
            <div>
              <span className="text-zinc-500 dark:text-zinc-400">Email</span>
              <div className="mt-0.5">
                <LeadEmailButton email={lead.email} />
              </div>
            </div>
            {profiles.linkedin ? (
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">
                  LinkedIn
                </span>
                <p className="mt-0.5">
                  <Link
                    href={profiles.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    Profile
                  </Link>
                </p>
              </div>
            ) : null}
            {profiles.xProfile ? (
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">X</span>
                <p className="mt-0.5">
                  <Link
                    href={profiles.xProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    Profile
                  </Link>
                </p>
              </div>
            ) : null}
          </div>

          {(lead.firstFollowUpDate || lead.secondFollowUpDate) && (
            <div className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
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

          {lead.notes ? (
            <div className="mt-4">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Notes
              </span>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {lead.notes}
              </p>
            </div>
          ) : null}
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

        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Touchpoints
          </h3>
          {lead.touchpoints.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No touchpoints yet. Add one to log outreach.
            </p>
          ) : (
            <div className="space-y-3">
              {lead.touchpoints.map((touchpoint) => (
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
        </div>
      </div>
    </Modal>
  );
}
