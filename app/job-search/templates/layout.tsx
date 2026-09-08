import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "templates",
  "/job-search/templates",
);

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
