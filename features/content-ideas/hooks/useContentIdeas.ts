"use client";

import { useCallback, useEffect, useState } from "react";

import type { ContentIdea, ContentIdeaStatus } from "../types";
import {
  createContentIdea,
  deleteContentIdea,
  getContentIdeasByProjectId,
  getStandaloneContentIdeas,
  updateContentIdea,
  type ContentIdeaInput,
} from "../lib/contentIdeasRepository";

type UseContentIdeasOptions = {
  projectId: string | null;
};

export function useContentIdeas({ projectId }: UseContentIdeasOptions) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIdeas = useCallback(async () => {
    if (projectId) {
      return getContentIdeasByProjectId(projectId);
    }
    return getStandaloneContentIdeas();
  }, [projectId]);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await loadIdeas();
      setIdeas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content ideas");
    } finally {
      setIsLoading(false);
    }
  }, [loadIdeas]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const data = await loadIdeas();
        if (!cancelled) {
          setIdeas(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load content ideas",
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
  }, [loadIdeas]);

  const addIdea = useCallback(
    async (input: ContentIdeaInput) => {
      const id = await createContentIdea(input);
      const created: ContentIdea = {
        id,
        ...input,
        title: input.title.trim(),
        notes: input.notes.trim(),
        createdAt: Date.now(),
      };
      setIdeas((prev) => [created, ...prev]);
      return id;
    },
    [],
  );

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
              }
            : idea,
        ),
      );
    },
    [],
  );

  const removeIdea = useCallback(async (id: number) => {
    await deleteContentIdea(id);
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  }, []);

  return {
    ideas,
    isLoading,
    error,
    addIdea,
    editIdea,
    removeIdea,
    refresh,
  };
}
