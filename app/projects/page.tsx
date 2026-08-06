"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/features/questions/components/ConfirmDialog";
import { ProjectFormModal } from "@/features/questions/components/ProjectFormModal";
import { useProjects } from "@/features/questions/hooks/useProjects";
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
  } = useProjects();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
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

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingProject) return;

    setIsDeleting(true);
    try {
      await deleteProject(deletingProject.id);
      toast.success("Project deleted");
      setDeletingProject(null);
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteProject, deletingProject]);

  return (
    <div className="mx-auto min-h-full w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="mb-2 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300"
          >
            &larr; Home
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Projects
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Organize related questions into collections with titled answers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Project
        </button>
      </div>

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
                    className="text-sm font-medium text-zinc-900 transition-colors hover:underline dark:text-zinc-50"
                  >
                    {project.name}
                  </Link>
                  {project.description ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {project.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
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
                    onClick={() => setDeletingProject(project)}
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

      <ConfirmDialog
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete project?"
        message="This project and all of its questions and answers will be permanently removed."
      />
    </div>
  );
}
