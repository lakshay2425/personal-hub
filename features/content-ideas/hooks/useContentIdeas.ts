"use client";

import { useCallback, useEffect, useState } from "react";

import { compareContentIdeas, collectDescendantIds } from "../lib/contentIdeaTree";
import type { ContentIdea, ContentIdeaStatus } from "../types";
import {
  createContentIdea,
  deleteContentIdea,
  getContentIdeasByProjectId,
  getStandaloneContentIdeas,
  moveContentIdeaToParent,
  reorderContentIdeas,
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
    async (input: ContentIdeaInput, parentId: number | null = null) => {
      const created = await createContentIdea(input, parentId);

      if (parentId) {
        setIdeas((prev) => [...prev, created].sort(compareContentIdeas));
      } else {
        setIdeas((prev) => [created, ...prev].sort(compareContentIdeas));
      }

      return created.id!;
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
    setIdeas((prev) => {
      const descendantIds = new Set(collectDescendantIds(id, prev));
      descendantIds.add(id);
      return prev.filter((idea) => idea.id !== undefined && !descendantIds.has(idea.id));
    });
  }, []);

  const moveToParent = useCallback(
    async (ideaId: number, parentId: number | null) => {
      const updated = await moveContentIdeaToParent(ideaId, parentId);
      const updatedMap = new Map(updated.map((idea) => [idea.id, idea]));

      setIdeas((prev) =>
        prev
          .map((idea) => updatedMap.get(idea.id!) ?? idea)
          .sort(compareContentIdeas),
      );

      return updated;
    },
    [],
  );

  const reorderIdeas = useCallback(
    async (parentId: number | null, orderedIds: number[]) => {
      const updated = await reorderContentIdeas(parentId, orderedIds);
      const updatedMap = new Map(updated.map((idea) => [idea.id, idea]));

      setIdeas((prev) =>
        prev
          .map((idea) => updatedMap.get(idea.id!) ?? idea)
          .sort(compareContentIdeas),
      );
    },
    [],
  );

  return {
    ideas,
    isLoading,
    error,
    addIdea,
    editIdea,
    removeIdea,
    moveToParent,
    reorderIdeas,
    refresh,
  };
}
