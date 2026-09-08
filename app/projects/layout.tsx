import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata("projects", "/projects");

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
