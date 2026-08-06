import type { Metadata } from "next";

import { JobSearchShell } from "@/features/job-search/components/JobSearchShell";

export const metadata: Metadata = {
  title: "Job Search Tracker",
};

export default function JobSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobSearchShell>{children}</JobSearchShell>;
}
