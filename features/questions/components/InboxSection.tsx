"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import {
  buildQuestionTree,
  countAllDescendants,
  countDescendantsInList,
} from "../lib/questionTree";
import { useQuestions } from "../hooks/useQuestions";
import type { Project, QuestionTreeNode } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { QuestionFormModal } from "./QuestionFormModal";
import { StatusToggle } from "./StatusToggle";

interface InboxSectionProps {
  projects: Project[];
}

const DEPTH_STYLES = {
  0: "rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
  1: "ml-4 rounded-lg border border-zinc-200 border-l-2 border-l-zinc-400 bg-white p-2.5 dark:border-zinc-800 dark:border-l-zinc-500 dark:bg-zinc-900",
  2: "ml-8 rounded-lg border border-zinc-200 border-l-2 border-l-zinc-300 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:border-l-zinc-600 dark:bg-zinc-900/50",
} as const;

interface InboxQuestionItemProps {
  node: QuestionTreeNode;
  projects: Project[];
  collapsedQuestionIds: Set<string>;
  moveTargets: Record<string, string>;
  movingId: string | null;
  togglingId: string | null;
  onToggleChildrenCollapse: (questionId: string) => void;
  onToggleStatus: (id: string) => void;
  onMoveTargetChange: (questionId: string, projectId: string) => void;
  onMove: (questionId: string) => void;
  onEdit: (question: QuestionTreeNode) => void;
  onDelete: (question: QuestionTreeNode) => void;
  onAddSubQuestion: (parent: QuestionTreeNode) => void;
}

function InboxQuestionItem({
  node,
  projects,
  collapsedQuestionIds,
  moveTargets,
  movingId,
  togglingId,
  onToggleChildrenCollapse,
  onToggleStatus,
  onMoveTargetChange,
  onMove,
  onEdit,
  onDelete,
  onAddSubQuestion,
}: InboxQuestionItemProps) {
  const descendantCount = countAllDescendants(node);
  const hasChildren = node.children.length > 0;
  const isChildrenCollapsed = collapsedQuestionIds.has(node.id);
  const canAddSubQuestion = node.depth < 2;

  return (
    <li>
      <div className={DEPTH_STYLES[node.depth]}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={
                hasChildren
                  ? () => onToggleChildrenCollapse(node.id)
                  : undefined
              }
              className={`text-left text-zinc-900 dark:text-zinc-50 ${
                node.depth === 0 ? "text-sm" : "text-xs"
              } ${hasChildren ? "cursor-pointer hover:underline" : "cursor-default"}`}
            >
              {node.questionText}
            </button>
            {descendantCount > 0 ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {descendantCount}{" "}
                {descendantCount === 1 ? "sub-question" : "sub-questions"}
              </p>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <StatusToggle
              status={node.status}
              onToggle={() => onToggleStatus(node.id)}
              disabled={togglingId === node.id}
            />
            {canAddSubQuestion ? (
              <button
                type="button"
                onClick={() => onAddSubQuestion(node)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Add Sub-question
              </button>
            ) : null}
            {node.depth === 0 && projects.length > 0 ? (
              <>
                <select
                  value={moveTargets[node.id] ?? ""}
                  onChange={(event) =>
                    onMoveTargetChange(node.id, event.target.value)
                  }
                  className="min-w-0 max-w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
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
                  onClick={() => onMove(node.id)}
                  disabled={!moveTargets[node.id] || movingId === node.id}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {movingId === node.id ? "Moving..." : "Move"}
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => onEdit(node)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(node)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {hasChildren && !isChildrenCollapsed ? (
        <ul className="mt-2 space-y-2">
          {node.children.map((child) => (
            <InboxQuestionItem
              key={child.id}
              node={child}
              projects={projects}
              collapsedQuestionIds={collapsedQuestionIds}
              moveTargets={moveTargets}
              movingId={movingId}
              togglingId={togglingId}
              onToggleChildrenCollapse={onToggleChildrenCollapse}
              onToggleStatus={onToggleStatus}
              onMoveTargetChange={onMoveTargetChange}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubQuestion={onAddSubQuestion}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
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
  const [collapsedQuestionIds, setCollapsedQuestionIds] = useState<Set<string>>(
    new Set(),
  );
  const [editingQuestion, setEditingQuestion] = useState<QuestionTreeNode | null>(
    null,
  );
  const [subQuestionParent, setSubQuestionParent] =
    useState<QuestionTreeNode | null>(null);
  const [deletingQuestion, setDeletingQuestion] =
    useState<QuestionTreeNode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});

  const tree = buildQuestionTree(questions);

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

  const handleToggleChildrenCollapse = useCallback((questionId: string) => {
    setCollapsedQuestionIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

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

  const handleMoveTargetChange = useCallback(
    (questionId: string, projectId: string) => {
      setMoveTargets((prev) => ({
        ...prev,
        [questionId]: projectId,
      }));
    },
    [],
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

  const deleteSubCount = deletingQuestion
    ? countDescendantsInList(deletingQuestion.id, questions)
    : 0;

  const deleteMessage =
    deleteSubCount > 0
      ? `This question will be permanently removed. This will also delete ${deleteSubCount} sub-question${deleteSubCount === 1 ? "" : "s"}.`
      : "This question will be permanently removed.";

  const formTitle = editingQuestion
    ? "Edit question"
    : subQuestionParent
      ? "New sub-question"
      : "New question";

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

      <form onSubmit={handleCapture} className="mb-4 flex flex-col gap-2 sm:flex-row">
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
          className="w-full shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
      ) : tree.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nothing in the inbox yet — type above to capture a question.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tree.map((node) => (
            <InboxQuestionItem
              key={node.id}
              node={node}
              projects={projects}
              collapsedQuestionIds={collapsedQuestionIds}
              moveTargets={moveTargets}
              movingId={movingId}
              togglingId={togglingId}
              onToggleChildrenCollapse={handleToggleChildrenCollapse}
              onToggleStatus={handleToggleStatus}
              onMoveTargetChange={handleMoveTargetChange}
              onMove={handleMove}
              onEdit={(question) => {
                setSubQuestionParent(null);
                setEditingQuestion(question);
              }}
              onDelete={setDeletingQuestion}
              onAddSubQuestion={(parent) => {
                setEditingQuestion(null);
                setSubQuestionParent(parent);
              }}
            />
          ))}
        </ul>
      )}

      <QuestionFormModal
        isOpen={Boolean(editingQuestion || subQuestionParent)}
        onClose={() => {
          setEditingQuestion(null);
          setSubQuestionParent(null);
        }}
        onSubmit={async (values) => {
          try {
            if (editingQuestion) {
              await updateQuestion(editingQuestion.id, values.questionText);
              toast.success("Question updated");
            } else if (subQuestionParent) {
              await createQuestion(values.questionText, subQuestionParent.id);
              setCollapsedQuestionIds((current) => {
                const next = new Set(current);
                next.delete(subQuestionParent.id);
                return next;
              });
              toast.success("Sub-question created");
            }
            setEditingQuestion(null);
            setSubQuestionParent(null);
          } catch {
            toast.error(
              editingQuestion
                ? "Failed to update question"
                : "Failed to create sub-question",
            );
          }
        }}
        question={editingQuestion}
        title={formTitle}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingQuestion)}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete question?"
        message={deleteMessage}
      />
    </section>
  );
}
