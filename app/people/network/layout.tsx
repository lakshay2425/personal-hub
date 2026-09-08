import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "peopleNetwork",
  "/people/network",
);

export default function NetworkPeopleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
