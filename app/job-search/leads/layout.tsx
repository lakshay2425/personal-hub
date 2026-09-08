import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata("leads", "/job-search/leads");

export default function LeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
