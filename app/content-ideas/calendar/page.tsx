"use client";

import { ContentCalendarWorkspace } from "@/features/content-ideas/components/calendar/ContentCalendarWorkspace";

export default function ContentCalendarPage() {
  return (
    <div className="mx-auto min-h-full w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <ContentCalendarWorkspace />
    </div>
  );
}
