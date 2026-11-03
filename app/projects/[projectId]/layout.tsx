import { createSectionMetadata } from "@/lib/og/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return createSectionMetadata(
    "projectDetail",
    `/projects/${encodeURIComponent(projectId)}`,
  );
}

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
