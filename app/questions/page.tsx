"use client";

import { QuestionsWorkspace } from "@/features/questions/components/QuestionsWorkspace";

export default function JournalPage() {
  return (
    <QuestionsWorkspace
      projectId={null}
      title="Journal"
      description="General inbox for questions not tied to a project — stored locally in IndexedDB."
      backHref="/"
      backLabel="Home"
      emptyTitle="No journal questions yet"
      emptyDescription='Click "New Question" to capture your first inbox question.'
    />
  );
}
