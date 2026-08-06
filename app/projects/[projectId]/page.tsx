"use client";

import Link from "next/link";
import { use } from "react";

import { QuestionsWorkspace } from "@/features/questions/components/QuestionsWorkspace";
import { useProject } from "@/features/questions/hooks/useProjects";

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = use(params);
  const { project, isLoading, error } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href="/projects"
          className="mb-4 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300"
        >
          &larr; Projects
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error ?? "Project not found"}
        </div>
      </div>
    );
  }

  return (
    <QuestionsWorkspace
      projectId={project.id}
      title={project.name}
      description={
        project.description ??
        "Project questions and titled answers — stored locally in IndexedDB."
      }
      backHref="/projects"
      backLabel="Projects"
      emptyTitle="No questions in this project yet"
      emptyDescription='Click "New Question" to add the first question to this project.'
    />
  );
}
