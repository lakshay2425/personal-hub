import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "applications",
  "/job-search/applications",
);

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
