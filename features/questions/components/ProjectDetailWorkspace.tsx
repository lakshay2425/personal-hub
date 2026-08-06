"use client";

import Link from "next/link";
import { useState } from "react";

import { ContentIdeasWorkspace } from "@/features/content-ideas/components/ContentIdeasWorkspace";

import type { Project } from "../types";
import { QuestionsWorkspace } from "./QuestionsWorkspace";

type ProjectTab = "questions" | "content-ideas";

const TABS: { id: ProjectTab; label: string }[] = [
  { id: "questions", label: "Questions" },
  { id: "content-ideas", label: "Content Ideas" },
];

interface ProjectDetailWorkspaceProps {
  project: Project;
}

export function ProjectDetailWorkspace({ project }: ProjectDetailWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ProjectTab>("questions");

  const description =
    project.description ??
    "Project questions and titled answers — stored locally in IndexedDB.";

  return (
    <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <Link
          href="/projects"
          className="mb-2 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300"
        >
          &larr; Projects
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {project.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>

        <nav
          aria-label="Project sections"
          className="mt-4 flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/50"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "questions" ? (
        <QuestionsWorkspace
          embedded
          projectId={project.id}
          title={project.name}
          description={description}
          backHref="/projects"
          backLabel="Projects"
          emptyTitle="No questions in this project yet"
          emptyDescription='Click "New Question" to add the first question to this project.'
        />
      ) : (
        <ContentIdeasWorkspace
          embedded
          projectId={project.id}
          title="Content Ideas"
          description="Content ideas for this project."
          emptyTitle="No content ideas in this project yet"
          emptyDescription='Click "Add Idea" to capture your first content idea for this project.'
        />
      )}
    </div>
  );
}
