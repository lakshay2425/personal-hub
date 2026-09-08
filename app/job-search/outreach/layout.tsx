import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Outreach",
  description:
    "Track LinkedIn and X outreach leads at target companies. Open profiles from the overflow menu, link message and follow-up templates, and manage contacts. Stored locally.",
};

export default function OutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
