import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "peopleSettings",
  "/people/settings",
);

export default function PeopleSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
