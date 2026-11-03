import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "loggerSettings",
  "/planner/logger/settings",
);

export default function LoggerSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
