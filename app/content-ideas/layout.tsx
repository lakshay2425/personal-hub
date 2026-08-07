import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Ideas",
  description:
    "Capture standalone content ideas with status tracking, published links, and calendar scheduling.",
};

export default function ContentIdeasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
