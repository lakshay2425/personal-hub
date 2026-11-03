import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "projectSettings",
  "/projects/settings",
);

export default function ProjectsSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
