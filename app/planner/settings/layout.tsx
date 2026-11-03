import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "plannerSettings",
  "/planner/settings",
);

export default function PlannerSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
