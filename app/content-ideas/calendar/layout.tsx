import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Calendar",
  description:
    "Plan when to publish content ideas. Schedule dates locally — no auto-posting.",
};

export default function ContentCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
