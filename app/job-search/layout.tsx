import type { Metadata } from "next";

import { JobSearchShell } from "@/features/job-search/components/JobSearchShell";

export const metadata: Metadata = {
  title: "Job Search Tracker",
  description:
    "Track companies, leads, applications, cold emails, and outreach templates — copy lead emails, view company info, open LinkedIn/X profiles, and link templates to each touchpoint. Stored locally.",
};

export default function JobSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobSearchShell>{children}</JobSearchShell>;
}
