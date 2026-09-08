import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata("contentIdeas", "/content-ideas");

export default function ContentIdeasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
