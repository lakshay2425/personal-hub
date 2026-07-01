"use client";

import { useCallback, useEffect, useState } from "react";

import type { Question } from "../types";
import {
  createQuestion as createQuestionRepo,
  deleteQuestion as deleteQuestionRepo,
  getAllQuestions,
  toggleQuestionStatus as toggleQuestionStatusRepo,
  updateQuestionText as updateQuestionTextRepo,
} from "../lib/questionsRepository";

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load questions",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      try {
        const data = await getAllQuestions();
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

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, []);

  const createQuestion = useCallback(async (questionText: string) => {
    const created = await createQuestionRepo(questionText);
    setQuestions((prev) =>
      [created, ...prev].sort((a, b) => b.createdAt - a.createdAt),
    );
    return created;
  }, []);

  const updateQuestion = useCallback(
    async (id: string, questionText: string) => {
      const updated = await updateQuestionTextRepo(id, questionText);
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? updated : q)),
      );
      return updated;
    },
    [],
  );

  const toggleStatus = useCallback(async (id: string) => {
    const updated = await toggleQuestionStatusRepo(id);
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
    return updated;
  }, []);

  const deleteQuestion = useCallback(async (id: string) => {
    await deleteQuestionRepo(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  return {
    questions,
    isLoading,
    error,
    createQuestion,
    updateQuestion,
    toggleStatus,
    deleteQuestion,
    refresh,
  };
}
