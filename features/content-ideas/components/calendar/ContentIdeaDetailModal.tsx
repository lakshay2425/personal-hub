"use client";

import { useState } from "react";
import { format } from "date-fns";

import type { Project } from "@/features/questions/types";

import { Modal } from "@/components/ui/Modal";
import { parseDateString } from "../../lib/calendarDateUtils";
import type { ContentIdea, ContentIdeaStatus } from "../../types";
import type { ContentIdeaInput } from "../../lib/contentIdeasRepository";
import { PublishedLinksSummary } from "../PublishedLinksSummary";
import { StatusBadge } from "../StatusBadge";
import { ContentIdeaFormModal } from "../forms/ContentIdeaFormModal";

interface ContentIdeaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: ContentIdea | null;
  project: Project | null;
  onEdit: (
    id: number,
    input: ContentIdeaInput,
    previousStatus?: ContentIdeaStatus,
  ) => Promise<void>;
  onUnschedule: (id: number) => Promise<void>;
}

export function ContentIdeaDetailModal({
  isOpen,
  onClose,
  idea,
  project,
  onEdit,
  onUnschedule,
}: ContentIdeaDetailModalProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUnscheduling, setIsUnscheduling] = useState(false);

  if (!idea) return null;

  const handleUnschedule = async () => {
    setIsUnscheduling(true);
    try {
      await onUnschedule(idea.id!);
      onClose();
    } finally {
      setIsUnscheduling(false);
    }
  };

  const handleEditSubmit = async (
    input: ContentIdeaInput,
    previousStatus?: ContentIdeaStatus,
  ) => {
    await onEdit(idea.id!, input, previousStatus);
    setIsEditOpen(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isEditOpen}
        onClose={onClose}
        title={idea.title}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={idea.status} />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {project ? project.name : "Standalone"}
            </span>
          </div>

          {idea.scheduledDate ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Scheduled
              </p>
              <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {format(parseDateString(idea.scheduledDate), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          ) : null}

          {idea.status === "Published" ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Published Links
              </p>
              <div className="mt-1">
                <PublishedLinksSummary links={idea.publishedLinks} />
              </div>
            </div>
          ) : null}

          {idea.notes ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Notes
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">
                {idea.notes}
              </p>
            </div>
          ) : null}

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Created {format(idea.createdAt, "MMM d, yyyy")}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {idea.scheduledDate ? (
              <button
                type="button"
                onClick={() => void handleUnschedule()}
                disabled={isUnscheduling}
                className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 sm:w-auto dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {isUnscheduling ? "Removing…" : "Remove from calendar"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Edit idea
            </button>
          </div>
        </div>
      </Modal>

      <ContentIdeaFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        idea={idea}
        projectId={idea.projectId}
        title="Edit Content Idea"
      />
    </>
  );
}
