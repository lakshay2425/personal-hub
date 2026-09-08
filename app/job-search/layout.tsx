import { createSectionMetadata } from "@/lib/og/metadata";

import { JobSearchShell } from "@/features/job-search/components/JobSearchShell";

export const metadata = createSectionMetadata("jobSearch", "/job-search");

export default function JobSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobSearchShell>{children}</JobSearchShell>;
}
