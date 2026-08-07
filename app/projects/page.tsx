"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ExportButton } from "@/components/ExportButton";
import { ImportButton } from "@/components/ImportButton";
import { ProjectDeleteDialog } from "@/features/content-ideas/components/ProjectDeleteDialog";
import { countContentIdeasByProjectId } from "@/features/content-ideas/lib/contentIdeasRepository";
import { InboxSection } from "@/features/questions/components/InboxSection";
import { ProjectFormModal } from "@/features/questions/components/ProjectFormModal";
import { useProjects } from "@/features/questions/hooks/useProjects";
import { exportProjectsData } from "@/features/questions/lib/exportRepository";
import {
  importProjectsData,
  validateProjectsBackup,
} from "@/features/questions/lib/importRepository";
import type { ProjectFormValues } from "@/features/questions/schema";
import type { Project } from "@/features/questions/types";

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refresh,
  } = useProjects();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [contentIdeasCount, setContentIdeasCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = useCallback(
    async (values: ProjectFormValues) => {
      try {
        if (editingProject) {
          await updateProject(editingProject.id, {
            name: values.name,
            description: values.description,
          });
          toast.success("Project updated");
        } else {
          await createProject({
            name: values.name,
            description: values.description,
          });
          toast.success("Project created");
        }
        handleCloseForm();
      } catch {
        toast.error(
          editingProject ? "Failed to update project" : "Failed to create project",
        );
      }
    },
    [createProject, editingProject, updateProject],
  );

  const handleOpenDelete = useCallback(async (project: Project) => {
    setDeletingProject(project);
    try {
      const count = await countContentIdeasByProjectId(project.id);
      setContentIdeasCount(count);
    } catch {
      setContentIdeasCount(0);
    }
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeletingProject(null);
    setContentIdeasCount(0);
  }, []);

  const handleDeleteProject = useCallback(
    async (deleteContentIdeas: boolean) => {
      if (!deletingProject) return;

      setIsDeleting(true);
      try {
        await deleteProject(deletingProject.id, { deleteContentIdeas });
        toast.success("Project deleted");
        handleCloseDelete();
      } catch {
        toast.error("Failed to delete project");
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteProject, deletingProject, handleCloseDelete],
  );

  return (
    <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Projects
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Capture questions in the inbox, then organize them into projects.
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <ExportButton
            onExport={exportProjectsData}
            filenamePrefix="question-hub-projects"
          />
          <ImportButton
            onValidate={validateProjectsBackup}
            onImport={importProjectsData}
            onImported={refresh}
          />
          <button
            type="button"
            onClick={handleOpenCreate}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            New Project
          </button>
        </div>
      </div>

      <InboxSection projects={projects} />

      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Your Projects
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            No projects yet
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create a project like &quot;iOS Resource Hub&quot; to group related
            questions.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/projects/${project.id}`}
                    className="break-words text-sm font-medium text-zinc-900 transition-colors hover:underline dark:text-zinc-50"
                  >
                    {project.name}
                  </Link>
                  {project.description ? (
                    <p className="mt-1 break-words text-sm text-zinc-600 dark:text-zinc-400">
                      {project.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(project)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleOpenDelete(project)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        project={editingProject}
      />

      <ProjectDeleteDialog
        isOpen={Boolean(deletingProject)}
        onClose={handleCloseDelete}
        onDeleteWithIdeas={() => void handleDeleteProject(true)}
        onDeleteKeepIdeas={() => void handleDeleteProject(false)}
        contentIdeasCount={contentIdeasCount}
        isLoading={isDeleting}
      />
    </div>
  );
}
