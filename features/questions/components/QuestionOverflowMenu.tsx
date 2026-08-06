"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  canMoveToRoot,
  getValidParentTargets,
  truncateQuestionText,
} from "../lib/questionTree";
import type { Project, Question } from "../types";

interface QuestionOverflowMenuProps {
  question: Question;
  allQuestions: Question[];
  canAddSubQuestion: boolean;
  onAddSubQuestion: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveToParent?: (parentId: string | null) => Promise<void>;
  projects?: Project[];
  onMoveToProject?: (projectId: string) => Promise<void>;
  isMoving?: boolean;
}

export function QuestionOverflowMenu({
  question,
  allQuestions,
  canAddSubQuestion,
  onAddSubQuestion,
  onEdit,
  onDelete,
  onMoveToParent,
  projects = [],
  onMoveToProject,
  isMoving = false,
}: QuestionOverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveUnder, setShowMoveUnder] = useState(false);
  const [showMoveToProject, setShowMoveToProject] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const validTargets = useMemo(
    () => getValidParentTargets(question.id, allQuestions),
    [allQuestions, question.id],
  );
  const showRootOption = canMoveToRoot(question.id, allQuestions);
  const hasMoveUnderOptions =
    Boolean(onMoveToParent) && (showRootOption || validTargets.length > 0);
  const hasMoveToProjectOptions =
    Boolean(onMoveToProject) &&
    question.depth === 0 &&
    projects.length > 0;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowMoveUnder(false);
        setShowMoveToProject(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setShowMoveUnder(false);
    setShowMoveToProject(false);
  };

  const handleMoveUnder = async (parentId: string | null) => {
    if (!onMoveToParent) return;
    await onMoveToParent(parentId);
    closeMenu();
  };

  const handleMoveToProject = async (projectId: string) => {
    if (!onMoveToProject) return;
    await onMoveToProject(projectId);
    closeMenu();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Question options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 min-w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {canAddSubQuestion ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onAddSubQuestion();
                closeMenu();
              }}
              className="w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Add Sub-question
            </button>
          ) : null}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onEdit();
              closeMenu();
            }}
            className="w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Edit
          </button>

          {hasMoveUnderOptions ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowMoveUnder((value) => !value);
                  setShowMoveToProject(false);
                }}
                disabled={isMoving}
                className="w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Move under…
              </button>
              {showMoveUnder ? (
                <div className="border-t border-zinc-100 dark:border-zinc-800">
                  {showRootOption ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleMoveUnder(null)}
                      disabled={isMoving}
                      className="w-full px-4 py-2 text-left text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Root level
                    </button>
                  ) : null}
                  {validTargets.map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      role="menuitem"
                      onClick={() => handleMoveUnder(target.id)}
                      disabled={isMoving}
                      className="w-full px-4 py-2 text-left text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      {truncateQuestionText(target.questionText)}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {hasMoveToProjectOptions ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowMoveToProject((value) => !value);
                  setShowMoveUnder(false);
                }}
                disabled={isMoving}
                className="w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Move to project…
              </button>
              {showMoveToProject ? (
                <div className="border-t border-zinc-100 dark:border-zinc-800">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      role="menuitem"
                      onClick={() => handleMoveToProject(project.id)}
                      disabled={isMoving}
                      className="w-full px-4 py-2 text-left text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onDelete();
              closeMenu();
            }}
            className="w-full px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
