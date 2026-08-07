"use client";

import { useCallback, useEffect, useState } from "react";

import { getAllProjects } from "@/features/questions/lib/projectsRepository";
import type { Project } from "@/features/questions/types";

import {
  getAllContentIdeas,
  updateContentIdea,
  updateContentIdeaScheduledDate,
  type ContentIdeaInput,
} from "../lib/contentIdeasRepository";
import type { ContentIdea, ContentIdeaStatus } from "../types";

export function useContentCalendar() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [ideasData, projectsData] = await Promise.all([
        getAllContentIdeas(),
        getAllProjects(),
      ]);
      setIdeas(ideasData);
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load calendar data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const [ideasData, projectsData] = await Promise.all([
          getAllContentIdeas(),
          getAllProjects(),
        ]);
        if (!cancelled) {
          setIdeas(ideasData);
          setProjects(projectsData);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load calendar data",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const scheduleIdea = useCallback(async (id: number, scheduledDate: string) => {
    await updateContentIdeaScheduledDate(id, scheduledDate);
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, scheduledDate } : idea,
      ),
    );
  }, []);

  const unscheduleIdea = useCallback(async (id: number) => {
    await updateContentIdeaScheduledDate(id, null);
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, scheduledDate: null } : idea,
      ),
    );
  }, []);

  const editIdea = useCallback(
    async (id: number, input: ContentIdeaInput, previousStatus?: ContentIdeaStatus) => {
      await updateContentIdea(id, input, previousStatus);
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                ...input,
                title: input.title.trim(),
                notes: input.notes.trim(),
                scheduledDate: input.scheduledDate ?? null,
              }
            : idea,
        ),
      );
    },
    [],
  );

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return {
    ideas,
    projects,
    projectMap,
    isLoading,
    error,
    refresh,
    scheduleIdea,
    unscheduleIdea,
    editIdea,
  };
}
