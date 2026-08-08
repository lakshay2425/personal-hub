import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planner",
  description:
    "Monday-based weekly task planner with priority badges, backlog, and automatic Logger entries when you complete tasks.",
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
