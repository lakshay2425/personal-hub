import type { Metadata } from "next";

import { OutreachShell } from "@/features/job-search/components/OutreachShell";

export const metadata: Metadata = {
  title: "Outreach",
  description:
    "Track job outreach and product outreach contacts. Job outreach covers LinkedIn and X at target companies; product outreach logs cross-platform interaction history. Stored locally.",
};

export default function OutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OutreachShell>{children}</OutreachShell>;
}
