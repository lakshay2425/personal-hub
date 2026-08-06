"use client";

import { useCallback, useEffect, useState } from "react";

import type { Answer } from "../types";
import {
  createAnswer as createAnswerRepo,
  deleteAnswer as deleteAnswerRepo,
  listAnswersByQuestion,
  updateAnswer as updateAnswerRepo,
} from "../lib/answersRepository";

export function useAnswers(questionId: string | null) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!questionId) {
      setAnswers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await listAnswersByQuestion(questionId);
      setAnswers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load answers");
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!questionId) {
        if (!cancelled) {
          setAnswers([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setIsLoading(true);
        }
        const data = await listAnswersByQuestion(questionId);
        if (!cancelled) {
          setAnswers(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load answers");
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
  }, [questionId]);

  const createAnswer = useCallback(
    async (input: {
      projectId: string | null;
      title: string;
      body: string;
    }) => {
      if (!questionId) {
        throw new Error("No question selected");
      }

      const created = await createAnswerRepo({
        projectId: input.projectId,
        questionId,
        title: input.title,
        body: input.body,
      });
      setAnswers((prev) =>
        [created, ...prev].sort((a, b) => b.createdAt - a.createdAt),
      );
      return created;
    },
    [questionId],
  );

  const updateAnswer = useCallback(
    async (id: string, input: { title: string; body: string }) => {
      const updated = await updateAnswerRepo(id, input);
      setAnswers((prev) => prev.map((answer) => (answer.id === id ? updated : answer)));
      return updated;
    },
    [],
  );

  const deleteAnswer = useCallback(async (id: string) => {
    await deleteAnswerRepo(id);
    setAnswers((prev) => prev.filter((answer) => answer.id !== id));
  }, []);

  return {
    answers,
    isLoading,
    error,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    refresh,
  };
}
