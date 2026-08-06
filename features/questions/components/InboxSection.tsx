"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { useQuestions } from "../hooks/useQuestions";
import type { Project, Question } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { QuestionFormModal } from "./QuestionFormModal";
import { StatusToggle } from "./StatusToggle";

interface InboxSectionProps {
  projects: Project[];
}

export function InboxSection({ projects }: InboxSectionProps) {
  const {
    questions,
    isLoading,
    error,
    createQuestion,
    updateQuestion,
    toggleStatus,
    deleteQuestion,
    moveToProject,
  } = useQuestions({ projectId: null });

  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});

  const handleCapture = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const text = draft.trim();
      if (!text) return;

      setIsSubmitting(true);
      try {
        await createQuestion(text);
        setDraft("");
        toast.success("Question captured");
      } catch {
        toast.error("Failed to capture question");
      } finally {
        setIsSubmitting(false);
      }
    },
    [createQuestion, draft],
  );

  const handleToggleStatus = useCallback(
    async (id: string) => {
      setTogglingId(id);
      try {
        await toggleStatus(id);
      } catch {
        toast.error("Failed to update status");
      } finally {
        setTogglingId(null);
      }
    },
    [toggleStatus],
  );

  const handleMove = useCallback(
    async (questionId: string) => {
      const targetProjectId = moveTargets[questionId];
      if (!targetProjectId) return;

      setMovingId(questionId);
      try {
        await moveToProject(questionId, targetProjectId);
        toast.success("Moved to project");
        setMoveTargets((prev) => {
          const next = { ...prev };
          delete next[questionId];
          return next;
        });
      } catch {
        toast.error("Failed to move question");
      } finally {
        setMovingId(null);
      }
    },
    [moveTargets, moveToProject],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingQuestion) return;

    setIsDeleting(true);
    try {
      await deleteQuestion(deletingQuestion.id);
      toast.success("Question deleted");
      setDeletingQuestion(null);
    } catch {
      toast.error("Failed to delete question");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteQuestion, deletingQuestion]);

  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Inbox
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Quick captures — move to a project when you&apos;re ready to work on
          them.
        </p>
      </div>

      <form onSubmit={handleCapture} className="mb-4 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What do you want to explore?"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={isSubmitting || !draft.trim()}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nothing in the inbox yet — type above to capture a question.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {questions.map((question) => (
            <li
              key={question.id}
              className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 flex-1 text-sm text-zinc-900 dark:text-zinc-50">
                  {question.questionText}
                </p>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <StatusToggle
                    status={question.status}
                    onToggle={() => handleToggleStatus(question.id)}
                    disabled={togglingId === question.id}
                  />
                  {projects.length > 0 ? (
                    <>
                      <select
                        value={moveTargets[question.id] ?? ""}
                        onChange={(event) =>
                          setMoveTargets((prev) => ({
                            ...prev,
                            [question.id]: event.target.value,
                          }))
                        }
                        className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        <option value="">Move to...</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleMove(question.id)}
                        disabled={
                          !moveTargets[question.id] ||
                          movingId === question.id
                        }
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        {movingId === question.id ? "Moving..." : "Move"}
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(question)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingQuestion(question)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <QuestionFormModal
        isOpen={Boolean(editingQuestion)}
        onClose={() => setEditingQuestion(null)}
        onSubmit={async (values) => {
          if (!editingQuestion) return;
          try {
            await updateQuestion(editingQuestion.id, values.questionText);
            toast.success("Question updated");
            setEditingQuestion(null);
          } catch {
            toast.error("Failed to update question");
          }
        }}
        question={editingQuestion}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingQuestion)}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete question?"
        message="This question will be permanently removed."
      />
    </section>
  );
}
