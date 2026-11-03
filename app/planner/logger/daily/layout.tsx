import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "loggerDaily",
  "/planner/logger/daily",
);

export default function DailyLoggerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
