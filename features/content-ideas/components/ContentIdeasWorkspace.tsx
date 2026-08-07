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
import { countDescendantsInList } from "../lib/contentIdeaTree";
import type { ContentIdea, ContentIdeaStatus, ContentIdeaTreeNode } from "../types";
import { ContentIdeasCards } from "./ContentIdeasCards";
import { ContentIdeasTable } from "./ContentIdeasTable";
import { ContentIdeasViewToggle } from "./ContentIdeasViewToggle";
import { SortableContentIdeaList } from "./SortableContentIdeaList";
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
  const {
    ideas,
    isLoading,
    error,
    addIdea,
    editIdea,
    removeIdea,
    moveToParent,
    reorderIdeas,
  } = useContentIdeas({ projectId });
  const { viewMode, setViewMode } = useContentIdeasViewMode();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentIdeaStatus | "">("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);
  const [subIdeaParent, setSubIdeaParent] = useState<ContentIdeaTreeNode | null>(null);
  const [deletingIdea, setDeletingIdea] = useState<ContentIdea | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [collapsedIdeaIds, setCollapsedIdeaIds] = useState<Set<number>>(new Set());
  const [movingUnderId, setMovingUnderId] = useState<number | null>(null);

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

  const hasActiveFilter = Boolean(search.trim() || statusFilter);
  const showEmpty = viewMode === "list" ? ideas.length === 0 : filtered.length === 0;

  const openCreateForm = () => {
    setEditingIdea(null);
    setSubIdeaParent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (idea: ContentIdea) => {
    setEditingIdea(idea);
    setSubIdeaParent(null);
    setIsFormOpen(true);
  };

  const handleAddSubIdea = (parent: ContentIdeaTreeNode) => {
    setEditingIdea(null);
    setSubIdeaParent(parent);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIdea(null);
    setSubIdeaParent(null);
  };

  const handleSubmit = async (
    input: Parameters<typeof addIdea>[0],
    previousStatus?: ContentIdeaStatus,
  ) => {
    try {
      if (editingIdea?.id) {
        await editIdea(editingIdea.id, input, previousStatus);
        toast.success("Content idea updated");
      } else if (subIdeaParent?.id) {
        await addIdea(input, subIdeaParent.id);
        setCollapsedIdeaIds((current) => {
          const next = new Set(current);
          next.delete(subIdeaParent.id!);
          return next;
        });
        toast.success("Sub-idea created");
      } else {
        await addIdea(input);
        toast.success("Content idea created");
      }
      handleCloseForm();
    } catch {
      toast.error(
        editingIdea
          ? "Failed to update content idea"
          : subIdeaParent
            ? "Failed to create sub-idea"
            : "Failed to create content idea",
      );
      throw new Error("save failed");
    }
  };

  const handleMoveToParent = async (ideaId: number, parentId: number | null) => {
    setMovingUnderId(ideaId);
    try {
      await moveToParent(ideaId, parentId);
      if (parentId) {
        setCollapsedIdeaIds((current) => {
          const next = new Set(current);
          next.delete(parentId);
          return next;
        });
      }
      toast.success("Content idea moved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to move content idea",
      );
    } finally {
      setMovingUnderId(null);
    }
  };

  const handleToggleChildrenCollapse = (ideaId: number) => {
    setCollapsedIdeaIds((current) => {
      const next = new Set(current);
      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
      }
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deletingIdea?.id) return;

    setIsDeleting(true);
    try {
      await removeIdea(deletingIdea.id);
      setCollapsedIdeaIds((current) => {
        const next = new Set(current);
        next.delete(deletingIdea.id!);
        return next;
      });
      toast.success("Content idea deleted");
      setDeletingIdea(null);
    } catch {
      toast.error("Failed to delete content idea");
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteSubCount = deletingIdea?.id
    ? countDescendantsInList(deletingIdea.id, ideas)
    : 0;

  const deleteMessage =
    deleteSubCount > 0
      ? `This content idea will be permanently removed. This will also delete ${deleteSubCount} sub-idea${deleteSubCount === 1 ? "" : "s"}.`
      : "This content idea will be permanently removed.";

  const formTitle = editingIdea
    ? "Edit Content Idea"
    : subIdeaParent
      ? "New Sub-idea"
      : "Add Content Idea";

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
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
        <ContentIdeasViewToggle value={viewMode} onChange={setViewMode} className="w-full sm:w-auto" />
      </div>

      {viewMode === "list" && hasActiveFilter ? (
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          Search and status filters apply to table and card views. List view shows all ideas.
        </p>
      ) : null}

      {showEmpty ? (
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
      ) : viewMode === "list" ? (
        <SortableContentIdeaList
          ideas={ideas}
          collapsedIdeaIds={collapsedIdeaIds}
          onToggleChildrenCollapse={handleToggleChildrenCollapse}
          onEdit={handleEdit}
          onDelete={setDeletingIdea}
          onAddSubIdea={handleAddSubIdea}
          onMoveToParent={handleMoveToParent}
          onReorder={reorderIdeas}
          allIdeas={ideas}
          movingUnderId={movingUnderId}
        />
      ) : viewMode === "cards" ? (
        <ContentIdeasCards
          ideas={filtered}
          allIdeas={ideas}
          onEdit={handleEdit}
          onDelete={setDeletingIdea}
          onAddSubIdea={handleAddSubIdea}
          onMoveToParent={handleMoveToParent}
          movingUnderId={movingUnderId}
        />
      ) : viewMode === "table" ? (
        <>
          <div className="lg:hidden">
            <ContentIdeasCards
              ideas={filtered}
              allIdeas={ideas}
              onEdit={handleEdit}
              onDelete={setDeletingIdea}
              onAddSubIdea={handleAddSubIdea}
              onMoveToParent={handleMoveToParent}
              movingUnderId={movingUnderId}
            />
          </div>
          <div className="hidden lg:block">
            <ContentIdeasTable
              ideas={filtered}
              allIdeas={ideas}
              onEdit={handleEdit}
              onDelete={setDeletingIdea}
              onAddSubIdea={handleAddSubIdea}
              onMoveToParent={handleMoveToParent}
              movingUnderId={movingUnderId}
            />
          </div>
        </>
      ) : null}

      <ContentIdeaFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        idea={editingIdea}
        projectId={projectId}
        title={formTitle}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingIdea)}
        onClose={() => setDeletingIdea(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete content idea?"
        message={deleteMessage}
      />
    </div>
  );
}
