import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "plannerDashboard",
  "/planner/dashboard",
);

export default function PlannerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
