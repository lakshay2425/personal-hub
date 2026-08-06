import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Capture questions in an inbox and organize them into projects with titled answers.",
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
