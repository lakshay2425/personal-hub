"use client";

import { Modal } from "@/components/ui/Modal";

import { getLeadSocialProfiles } from "../lib/leadProfileUtils";
import type { Company, LeadWithTouchpoints, Template } from "../types";
import { AlumniBadge } from "./AlumniBadge";
import { LeadCompanyButton } from "./LeadCompanyButton";
import { LeadEmailButton } from "./LeadEmailButton";
import { LeadSocialLinks } from "./LeadSocialLinks";
import { LeadTouchpointRow } from "./LeadTouchpointRow";
import { mobileActionClass } from "./MobileListCard";

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
  onEditTouchpoint,
  onDeleteTouchpoint,
}: LeadDetailModalProps) {
  if (!lead) return null;
  const profiles = getLeadSocialProfiles(lead);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lead.name} size="lg">
      <div className="space-y-6">
        <div>
          {lead.isAlumni === true ? (
            <div className="mb-3">
              <AlumniBadge />
            </div>
          ) : null}
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
            {lead.email.trim() ? (
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Email</span>
                <div className="mt-0.5">
                  <LeadEmailButton email={lead.email} />
                </div>
              </div>
            ) : null}
            {profiles.linkedin || profiles.xProfile ? (
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">
                  Social profiles
                </span>
                <div className="mt-1">
                  <LeadSocialLinks lead={lead} />
                </div>
              </div>
            ) : null}
          </div>

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
