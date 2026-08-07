"use client";

import { format } from "date-fns";

import type { Project } from "@/features/questions/types";

import { Modal } from "@/components/ui/Modal";
import { parseDateString } from "../../lib/calendarDateUtils";
import type { ContentIdea } from "../../types";
import { StatusBadge } from "../StatusBadge";
import { StatusDot } from "./StatusDot";

interface DayIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  ideas: ContentIdea[];
  projectMap: Map<string, Project>;
  onIdeaClick: (idea: ContentIdea) => void;
  onScheduleClick: () => void;
}

export function DayIdeasModal({
  isOpen,
  onClose,
  date,
  ideas,
  projectMap,
  onIdeaClick,
  onScheduleClick,
}: DayIdeasModalProps) {
  if (!date) return null;

  const formattedDate = format(parseDateString(date), "EEEE, MMMM d, yyyy");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formattedDate} size="md">
      <div className="space-y-4">
        {ideas.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No content planned for this day.
          </p>
        ) : (
          <ul className="space-y-2">
            {ideas.map((idea) => {
              const project = idea.projectId
                ? projectMap.get(idea.projectId)
                : null;

              return (
                <li key={idea.id}>
                  <button
                    type="button"
                    onClick={() => onIdeaClick(idea)}
                    className="flex w-full items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    <StatusDot status={idea.status} className="mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {idea.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {project ? project.name : "Standalone"}
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={idea.status} />
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={onScheduleClick}
          className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Schedule an idea
        </button>
      </div>
    </Modal>
  );
}
