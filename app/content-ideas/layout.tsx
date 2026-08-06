import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Ideas",
  description:
    "Capture standalone content ideas with status tracking and published links.",
};

export default function ContentIdeasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
