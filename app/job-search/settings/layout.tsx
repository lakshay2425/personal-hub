import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "jobSearchSettings",
  "/job-search/settings",
);

export default function JobSearchSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
