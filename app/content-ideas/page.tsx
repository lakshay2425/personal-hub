"use client";

import { ContentIdeasWorkspace } from "@/features/content-ideas/components/ContentIdeasWorkspace";

export default function ContentIdeasPage() {
  return (
    <div className="mx-auto min-h-full w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <ContentIdeasWorkspace
        projectId={null}
        title="Content Ideas"
        description="Standalone content ideas not tied to any project — stored locally in IndexedDB."
        emptyDescription="Capture your first standalone content idea to get started."
      />
    </div>
  );
}
