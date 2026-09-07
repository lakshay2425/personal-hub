import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Outreach",
  description:
    "Log cross-platform product outreach with a timeline of interactions per contact across Instagram, LinkedIn, X, and email. Stored locally.",
};

export default function ProductOutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
