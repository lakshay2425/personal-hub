import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata("logger", "/planner/logger");

export default function LoggerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
