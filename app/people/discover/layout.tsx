import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "peopleDiscover",
  "/people/discover",
);

export default function DiscoverPeopleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
