"use client";

import Link from "next/link";

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

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/job-search/companies/${company.id}`}
          className="min-w-0 break-words text-base font-medium text-zinc-900 hover:underline dark:text-zinc-50"
        >
          {company.companyName}
        </Link>
        <CompanyOverflowMenu onEdit={onEdit} onDelete={onDelete} />
      </div>

      {sector || website || notes ? (
        <dl className="mt-3 space-y-2 text-sm">
          {sector ? (
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                Sector
              </dt>
              <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                {sector}
              </dd>
            </div>
          ) : null}
          {websiteUrl ? (
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                Website
              </dt>
              <dd className="mt-0.5">
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-blue-600 hover:underline dark:text-blue-400"
                >
                  {website}
                </a>
              </dd>
            </div>
          ) : null}
          {notes ? (
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                Notes
              </dt>
              <dd className="mt-0.5 line-clamp-3 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {notes}
              </dd>
            </div>
          ) : null}
        </dl>
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
    </article>
  );
}
