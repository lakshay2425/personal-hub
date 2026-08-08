import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outreach Templates",
  description:
    "Reusable cold email, LinkedIn, X DM, and follow-up templates — link them to cold emails and outreach leads. Copy and customize before sending. Stored locally.",
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
