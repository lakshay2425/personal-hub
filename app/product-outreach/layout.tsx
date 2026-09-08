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
  return (
    <main className="mx-auto min-h-full w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {children}
    </main>
  );
}
