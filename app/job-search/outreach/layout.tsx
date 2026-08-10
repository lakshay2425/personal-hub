import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outreach",
  description:
    "Track LinkedIn and X outreach leads. Open profiles from the overflow menu, link message and follow-up templates, and manage contacts. Stored locally.",
};

export default function OutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
