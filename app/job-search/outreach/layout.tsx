import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "outreach",
  "/job-search/leads",
);

export default function OutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
