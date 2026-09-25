"use client";

import { ExternalLink, StickyNote } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { Modal } from "@/components/ui/Modal";

import { normalizeProfileUrl } from "../lib/leadProfileUtils";
import type { CompanyWithCounts } from "../types";
import { CompanyOverflowMenu } from "./CompanyOverflowMenu";

interface CompanyCardProps {
  company: CompanyWithCounts;
  showApplications: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function CompanyCard({
  company,
  showApplications,
  onEdit,
  onDelete,
}: CompanyCardProps) {
  const sector = company.sector.trim();
  const website = company.website.trim();
  const notes = company.notes.trim();
  const websiteUrl = website ? normalizeProfileUrl(website) : "";
  const [notesOpen, setNotesOpen] = useState(false);

  const copyWebsiteLink = async () => {
    if (!websiteUrl) return;
    try {
      await navigator.clipboard.writeText(websiteUrl);
      toast.success("Website link copied");
    } catch {
      toast.error("Could not copy the website link");
    }
  };

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/job-search/companies/${company.id}`}
          className="min-w-0 break-words text-base font-medium text-zinc-900 hover:underline dark:text-zinc-50"
        >
          {company.companyName}
        </Link>
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
          <CompanyOverflowMenu
            onEdit={onEdit}
            onDelete={onDelete}
            onCopyLink={websiteUrl ? copyWebsiteLink : undefined}
          />
        </div>
      </div>

      {sector ? (
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{sector}</p>
      ) : null}

      {websiteUrl ? (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Visit website
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          {company.leadsCount}{" "}
          {company.leadsCount === 1 ? "lead" : "leads"}
        </span>
        {showApplications ? (
          <span>
            {company.applicationsCount}{" "}
            {company.applicationsCount === 1 ? "app" : "apps"}
          </span>
        ) : null}
      </div>

      <Modal
        isOpen={notesOpen}
        onClose={() => setNotesOpen(false)}
        title={`${company.companyName} notes`}
        size="sm"
      >
        <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {notes}
        </p>
      </Modal>
    </article>
  );
}
