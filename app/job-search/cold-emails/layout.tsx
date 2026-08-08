import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cold Emails",
  description:
    "Track cold email outreach and link Cold Email and follow-up templates to each send. Stored locally.",
};

export default function ColdEmailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
