import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outreach",
  description:
    "Track LinkedIn and X outreach leads. Link message and follow-up templates to each contact. Stored locally.",
};

export default function OutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
