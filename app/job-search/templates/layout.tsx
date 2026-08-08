import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outreach Templates",
  description:
    "Reusable cold email, LinkedIn, X DM, and follow-up message templates — copy and customize before sending. Stored locally.",
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
