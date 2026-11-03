"use client";

import Link from "next/link";

import { getLeadSocialProfiles } from "../lib/leadProfileUtils";
import type { Lead } from "../types";

interface LeadSocialLinksProps {
  lead: Lead;
}

export function LeadSocialLinks({ lead }: LeadSocialLinksProps) {
  const profiles = getLeadSocialProfiles(lead);

  return (
    <span className="inline-flex items-center gap-1.5">
      {profiles.linkedin ? (
        <Link
          href={profiles.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open LinkedIn profile in a new tab"
          title="Open LinkedIn profile"
          className="inline-flex size-7 items-center justify-center rounded-md bg-[#0A66C2] text-xs font-bold text-white transition-opacity hover:opacity-80"
        >
          in
        </Link>
      ) : null}
      {profiles.xProfile ? (
        <Link
          href={profiles.xProfile}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open X profile in a new tab"
          title="Open X profile"
          className="inline-flex size-7 items-center justify-center rounded-md bg-black text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-3.5 fill-current"
          >
            <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.6 22H2.5l7.3-8.4L1.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
          </svg>
        </Link>
      ) : null}
    </span>
  );
}
