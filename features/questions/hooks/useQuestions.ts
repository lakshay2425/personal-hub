"use client";

import { useCallback, useEffect, useState } from "react";

import type { Question } from "../types";
import { collectDescendantIds } from "../lib/questionTree";
import {
  createQuestion as createQuestionRepo,
  deleteQuestion as deleteQuestionRepo,
  getInboxQuestions,
  getQuestionsByProjectId,
  moveQuestionToProject as moveQuestionToProjectRepo,
  moveQuestionToParent as moveQuestionToParentRepo,
  toggleQuestionStatus as toggleQuestionStatusRepo,
  updateQuestionText as updateQuestionTextRepo,
} from "../lib/questionsRepository";

type UseQuestionsOptions = {
  projectId?: string | null;
};

export function useQuestions(options: UseQuestionsOptions = {}) {
  const projectId = options.projectId ?? null;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    if (projectId) {
      return getQuestionsByProjectId(projectId);
    }
    return getInboxQuestions();
  }, [projectId]);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await loadQuestions();
      setQuestions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load questions",
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadQuestions]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const data = await loadQuestions();
        if (!cancelled) {
          setQuestions(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load questions",
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
  }, [loadQuestions]);

  const createQuestion = useCallback(
    async (questionText: string, parentId: string | null = null) => {
      const created = await createQuestionRepo(questionText, projectId, parentId);

      if (parentId) {
        setQuestions((prev) =>
          [...prev, created].sort((a, b) => b.createdAt - a.createdAt),
        );
      } else {
        setQuestions((prev) =>
          [created, ...prev].sort((a, b) => b.createdAt - a.createdAt),
        );
      }

      return created;
    },
    [projectId],
  );

  const updateQuestion = useCallback(
    async (id: string, questionText: string) => {
      const updated = await updateQuestionTextRepo(id, questionText);
      setQuestions((prev) =>
        prev.map((question) => (question.id === id ? updated : question)),
      );
      return updated;
    },
    [],
  );

  const toggleStatus = useCallback(async (id: string) => {
    const updated = await toggleQuestionStatusRepo(id);
    setQuestions((prev) =>
      prev.map((question) => (question.id === id ? updated : question)),
    );
    return updated;
  }, []);

  const deleteQuestion = useCallback(
    async (id: string) => {
      const { deletedSubCount } = await deleteQuestionRepo(id);
      setQuestions((prev) => {
        const descendantIds = new Set(collectDescendantIds(id, prev));
        descendantIds.add(id);
        return prev.filter((question) => !descendantIds.has(question.id));
      });
      return { deletedSubCount };
    },
    [],
  );

  const moveToProject = useCallback(
    async (id: string, targetProjectId: string) => {
      await moveQuestionToProjectRepo(id, targetProjectId);
      setQuestions((prev) => {
        const descendantIds = new Set(collectDescendantIds(id, prev));
        descendantIds.add(id);
        return prev.filter((question) => !descendantIds.has(question.id));
      });
    },
    [],
  );

  const moveToParent = useCallback(
    async (questionId: string, parentId: string | null) => {
      const updated = await moveQuestionToParentRepo(questionId, parentId);
      const updatedMap = new Map(updated.map((question) => [question.id, question]));

      setQuestions((prev) =>
        prev
          .map((question) => updatedMap.get(question.id) ?? question)
          .sort((a, b) => b.createdAt - a.createdAt),
      );

      return updated;
    },
    [],
  );

  return {
    questions,
    isLoading,
    error,
    createQuestion,
    updateQuestion,
    toggleStatus,
    deleteQuestion,
    moveToProject,
    moveToParent,
    refresh,
  };
}
