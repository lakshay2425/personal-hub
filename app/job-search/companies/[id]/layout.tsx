import { createSectionMetadata } from "@/lib/og/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return createSectionMetadata(
    "companyDetail",
    `/job-search/companies/${encodeURIComponent(id)}`,
  );
}

export default function CompanyDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
