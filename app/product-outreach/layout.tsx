import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "productOutreach",
  "/product-outreach",
);

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
