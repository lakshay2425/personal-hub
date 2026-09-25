"use client";

import { ExternalLink, StickyNote } from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import { formatDate } from "../lib/dateUtils";
import { normalizeProfileUrl } from "../lib/leadProfileUtils";
import type { Application } from "../types";
import { CompanyOverflowMenu } from "./CompanyOverflowMenu";
import { StatusBadge } from "./StatusBadge";

interface ApplicationCardProps {
  application: Application;
  companyName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ApplicationCard({
  application,
  companyName,
  onEdit,
  onDelete,
}: ApplicationCardProps) {
  const portal = application.portal.trim();
  const jobLink = application.jobLink.trim();
  const notes = application.notes.trim();
  const appliedDate = application.appliedDate.trim();
  const jobUrl = jobLink ? normalizeProfileUrl(jobLink) : "";
  const [notesOpen, setNotesOpen] = useState(false);
  const showActions = Boolean(onEdit && onDelete);

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-base font-medium text-zinc-900 dark:text-zinc-50">
              {application.role}
            </h3>
            <StatusBadge status={application.status} />
          </div>
          {companyName ? (
            <p className="mt-1 break-words text-sm text-zinc-500 dark:text-zinc-400">
              {companyName}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center">
          {notes ? (
            <button
              type="button"
              onClick={() => setNotesOpen(true)}
              aria-label="View notes"
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <StickyNote className="h-4 w-4" />
            </button>
          ) : null}
          {showActions && onEdit && onDelete ? (
            <CompanyOverflowMenu
              label="Application options"
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : null}
        </div>
      </div>

      {portal || appliedDate ? (
        <dl className="mt-3 space-y-2 text-sm">
          {portal ? (
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                Portal
              </dt>
              <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                {portal}
              </dd>
            </div>
          ) : null}
          {appliedDate ? (
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                Applied
              </dt>
              <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                {formatDate(appliedDate)}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {jobUrl ? (
        <div className="mt-3 flex justify-end">
          <a
            href={jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Show Application
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}

      <Modal
        isOpen={notesOpen}
        onClose={() => setNotesOpen(false)}
        title={`${application.role} notes`}
        size="sm"
      >
        <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {notes}
        </p>
      </Modal>
    </article>
  );
}
