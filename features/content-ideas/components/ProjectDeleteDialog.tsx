"use client";

import { Modal } from "@/components/ui/Modal";

interface ProjectDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteWithIdeas: () => void;
  onDeleteKeepIdeas: () => void;
  contentIdeasCount: number;
  isLoading?: boolean;
}

export function ProjectDeleteDialog({
  isOpen,
  onClose,
  onDeleteWithIdeas,
  onDeleteKeepIdeas,
  contentIdeasCount,
  isLoading = false,
}: ProjectDeleteDialogProps) {
  const hasContentIdeas = contentIdeasCount > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete project?" size="sm">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This project and all of its questions and answers will be permanently
        removed.
      </p>
      {hasContentIdeas ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          This project has {contentIdeasCount} content idea
          {contentIdeasCount === 1 ? "" : "s"}. Delete associated content ideas
          too?
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 sm:w-auto dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        {hasContentIdeas ? (
          <button
            type="button"
            onClick={onDeleteKeepIdeas}
            disabled={isLoading}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 sm:w-auto dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isLoading ? "Deleting..." : "Keep"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={hasContentIdeas ? onDeleteWithIdeas : onDeleteKeepIdeas}
          disabled={isLoading}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 sm:w-auto"
        >
          {isLoading
            ? "Deleting..."
            : hasContentIdeas
              ? "Yes"
              : "Delete Project"}
        </button>
      </div>
    </Modal>
  );
}
