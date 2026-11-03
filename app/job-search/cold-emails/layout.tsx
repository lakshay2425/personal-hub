import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "legacyColdEmails",
  "/job-search/leads",
);

export default function ColdEmailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
