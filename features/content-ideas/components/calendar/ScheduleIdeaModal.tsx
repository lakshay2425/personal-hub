"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import type { Project } from "@/features/questions/types";

import { Modal } from "@/components/ui/Modal";
import { parseDateString } from "../../lib/calendarDateUtils";
import type { ContentIdea } from "../../types";
import { StatusDot } from "./StatusDot";

interface ScheduleIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  ideas: ContentIdea[];
  projectMap: Map<string, Project>;
  onSchedule: (ideaId: number, date: string) => Promise<void>;
}

export function ScheduleIdeaModal({
  isOpen,
  onClose,
  date,
  ideas,
  projectMap,
  onSchedule,
}: ScheduleIdeaModalProps) {
  const [search, setSearch] = useState("");
  const [schedulingId, setSchedulingId] = useState<number | null>(null);

  const formattedDate = date
    ? format(parseDateString(date), "EEEE, MMMM d, yyyy")
    : "";

  const filteredIdeas = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = [...ideas];

    if (query) {
      result = result.filter((idea) =>
        idea.title.toLowerCase().includes(query),
      );
    }

    return result.sort((a, b) => a.title.localeCompare(b.title));
  }, [ideas, search]);

  const handleSchedule = async (ideaId: number) => {
    if (!date) return;
    setSchedulingId(ideaId);
    try {
      await onSchedule(ideaId, date);
      onClose();
    } finally {
      setSchedulingId(null);
    }
  };

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Schedule for ${formattedDate}`}
      size="md"
    >
      <div className="space-y-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search content ideas..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
        />

        {filteredIdeas.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {ideas.length === 0
              ? "No content ideas yet. Create one from Content Ideas first."
              : "No ideas match your search."}
          </p>
        ) : (
          <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
            {filteredIdeas.map((idea) => {
              const project = idea.projectId
                ? projectMap.get(idea.projectId)
                : null;
              const isScheduled = idea.scheduledDate !== null;
              const isScheduling = schedulingId === idea.id;

              return (
                <li key={idea.id}>
                  <button
                    type="button"
                    disabled={isScheduling}
                    onClick={() => void handleSchedule(idea.id!)}
                    className="flex w-full items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    <StatusDot status={idea.status} className="mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {idea.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {project ? project.name : "Standalone"}
                        {isScheduled && idea.scheduledDate
                          ? ` · Currently ${idea.scheduledDate}`
                          : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {isScheduling ? "Scheduling…" : "Select"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
