import { createSectionMetadata } from "@/lib/og/metadata";

import { PeopleShell } from "@/features/people/components/PeopleShell";

export const metadata = createSectionMetadata(
  "peopleDiscover",
  "/people/discover",
);

export default function PeopleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PeopleShell>{children}</PeopleShell>;
}
