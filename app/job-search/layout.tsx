import type { Metadata } from "next";

import { JobSearchShell } from "@/features/job-search/components/JobSearchShell";

export const metadata: Metadata = {
  title: "Job Search Tracker",
  description:
    "Track companies, leads, applications, cold emails, and outreach templates — link templates to each outreach and follow-up. Stored locally.",
};

export default function JobSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobSearchShell>{children}</JobSearchShell>;
}
