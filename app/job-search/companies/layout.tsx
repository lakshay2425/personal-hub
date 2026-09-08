import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "companies",
  "/job-search/companies",
);

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
