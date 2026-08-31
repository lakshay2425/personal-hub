import type { Metadata } from "next";

import { PlannerShell } from "@/features/planner/components/PlannerShell";

export const metadata: Metadata = {
  title: "Planner",
  description:
    "Plan your week, log your progress, and track activity by priority.",
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlannerShell>{children}</PlannerShell>;
}
