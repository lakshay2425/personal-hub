import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "leads",
  "/job-search/cold-emails",
);

export default function ColdEmailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
