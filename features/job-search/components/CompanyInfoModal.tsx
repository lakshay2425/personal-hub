"use client";

import type { ReactNode } from "react";

import { Modal } from "@/components/ui/Modal";

import { formatTimestamp } from "../lib/dateUtils";
import { normalizeProfileUrl } from "../lib/leadProfileUtils";
import type { Company } from "../types";

interface CompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{value}</dd>
    </div>
  );
}

export function CompanyInfoModal({
  isOpen,
  onClose,
  company,
}: CompanyInfoModalProps) {
  if (!company) return null;

  const website = company.website.trim();
  const websiteUrl = website ? normalizeProfileUrl(website) : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company.companyName}
      size="md"
    >
      <dl className="space-y-4">
        <InfoRow
          label="Sector"
          value={company.sector.trim() || "—"}
        />
        <InfoRow
          label="Website"
          value={
            websiteUrl ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-blue-600 hover:underline dark:text-blue-400"
              >
                {website}
              </a>
            ) : (
              "—"
            )
          }
        />
        <InfoRow
          label="Notes"
          value={
            company.notes.trim() ? (
              <span className="whitespace-pre-wrap">{company.notes}</span>
            ) : (
              "—"
            )
          }
        />
        <InfoRow
          label="Created"
          value={formatTimestamp(company.createdAt)}
        />
      </dl>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
