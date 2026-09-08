import { createSectionMetadata } from "@/lib/og/metadata";

import { PlannerShell } from "@/features/planner/components/PlannerShell";

export const metadata = createSectionMetadata("planner", "/planner");

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlannerShell>{children}</PlannerShell>;
}
