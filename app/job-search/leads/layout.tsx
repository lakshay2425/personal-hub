import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads",
  description:
    "Track email and other leads at target companies. Copy emails to clipboard, view company info in a modal, and link follow-up templates to email outreach. Stored locally.",
};

export default function LeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
