"use client";

import type { Company } from "../types";

interface LeadCompanyButtonProps {
  company: Company | undefined;
  onView: (company: Company) => void;
}

export function LeadCompanyButton({
  company,
  onView,
}: LeadCompanyButtonProps) {
  if (!company) {
    return <span className="text-zinc-400">—</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onView(company)}
      title="View company info"
      className="max-w-full truncate text-left text-zinc-700 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
    >
      {company.companyName}
    </button>
  );
}
