import { createSectionMetadata } from "@/lib/og/metadata";

export const metadata = createSectionMetadata(
  "contentCalendar",
  "/content-ideas/calendar",
);

export default function ContentCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
