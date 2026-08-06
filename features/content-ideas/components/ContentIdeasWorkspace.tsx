"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";

import { CONTENT_IDEA_STATUSES } from "../constants";
import { useContentIdeas } from "../hooks/useContentIdeas";
import { useContentIdeasViewMode } from "../hooks/useContentIdeasViewMode";
import type { ContentIdea, ContentIdeaStatus } from "../types";
import { ContentIdeasCards } from "./ContentIdeasCards";
import { ContentIdeasTable } from "./ContentIdeasTable";
import {
  ContentIdeasViewToggle,
} from "./ContentIdeasViewToggle";
import { ContentIdeaFormModal } from "./forms/ContentIdeaFormModal";

interface ContentIdeasWorkspaceProps {
  projectId: string | null;
  title: string;
  description: string;
  addButtonLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  embedded?: boolean;
}

export function ContentIdeasWorkspace({
  projectId,
  title,
  description,
  addButtonLabel = "Add Idea",
  emptyTitle = "No content ideas yet",
  emptyDescription = "Capture your first content idea to get started.",
  embedded = false,
}: ContentIdeasWorkspaceProps) {
  const { ideas, isLoading, error, addIdea, editIdea, removeIdea } =
    useContentIdeas({ projectId });
  const { viewMode, setViewMode } = useContentIdeasViewMode();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentIdeaStatus | "">("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);
  const [deletingIdea, setDeletingIdea] = useState<ContentIdea | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    let result = [...ideas];

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((idea) =>
        idea.title.toLowerCase().includes(lower),
      );
    }

    if (statusFilter) {
      result = result.filter((idea) => idea.status === statusFilter);
    }

    return result;
  }, [ideas, search, statusFilter]);

  const openCreateForm = () => {
    setEditingIdea(null);
    setIsFormOpen(true);
  };

  const handleEdit = (idea: ContentIdea) => {
    setEditingIdea(idea);
    setIsFormOpen(true);
  };

  const handleSubmit = async (
    input: Parameters<typeof addIdea>[0],
    previousStatus?: ContentIdeaStatus,
  ) => {
    try {
      if (editingIdea?.id) {
        await editIdea(editingIdea.id, input, previousStatus);
        toast.success("Content idea updated");
      } else {
        await addIdea(input);
        toast.success("Content idea created");
      }
    } catch {
      toast.error("Failed to save content idea");
      throw new Error("save failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingIdea?.id) return;

    setIsDeleting(true);
    try {
      await removeIdea(deletingIdea.id);
      toast.success("Content idea deleted");
      setDeletingIdea(null);
    } catch {
      toast.error("Failed to delete content idea");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading content ideas..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      {embedded ? (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {addButtonLabel}
          </button>
        </div>
      ) : (
        <PageHeader
          title={title}
          description={description}
          action={
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {addButtonLabel}
            </button>
          }
        />
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:min-w-[200px] sm:flex-1 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as ContentIdeaStatus | "")
          }
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All statuses</option>
          {CONTENT_IDEA_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <ContentIdeasViewToggle
          value={viewMode}
          onChange={setViewMode}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {addButtonLabel}
            </button>
          }
        />
      ) : viewMode === "cards" ? (
        <ContentIdeasCards
          ideas={filtered}
          onEdit={handleEdit}
          onDelete={setDeletingIdea}
        />
      ) : (
        <ContentIdeasTable
          ideas={filtered}
          onEdit={handleEdit}
          onDelete={setDeletingIdea}
        />
      )}

      <ContentIdeaFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingIdea(null);
        }}
        onSubmit={handleSubmit}
        idea={editingIdea}
        projectId={projectId}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingIdea)}
        onClose={() => setDeletingIdea(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete content idea?"
        message="This content idea will be permanently removed."
      />
    </div>
  );
}
