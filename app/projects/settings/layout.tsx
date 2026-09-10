import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata("projects", "/projects/settings");

export default function ProjectsSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
