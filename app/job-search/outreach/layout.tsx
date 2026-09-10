import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata("leads", "/job-search/outreach");

export default function OutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
