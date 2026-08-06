import type { Metadata } from "next";

import { JobSearchShell } from "@/features/job-search/components/JobSearchShell";

export const metadata: Metadata = {
  title: "Job Search Tracker",
  description:
    "Track companies, leads, applications, and cold emails in one place — stored locally.",
};

export default function JobSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobSearchShell>{children}</JobSearchShell>;
}
