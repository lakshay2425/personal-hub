"use client";

import { MoreVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { usePriorities } from "@/features/settings/hooks/usePriorities";
import { UNASSIGNED } from "@/features/settings/types";

import type { Task } from "../types";

interface TaskOverflowMenuProps {
  task: Task;
  canAddSubTask: boolean;
  showMoveToWeek: boolean;
  onAddSubTask: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveToWeek?: () => void;
  onMoveToCategory?: (category: string) => void;
}

interface MenuPosition {
  top: number;
  right: number;
}

export function TaskOverflowMenu({
  task,
  canAddSubTask,
  showMoveToWeek,
  onAddSubTask,
  onEdit,
  onDelete,
  onMoveToWeek,
  onMoveToCategory,
}: TaskOverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { activePriorities } = usePriorities();

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
      setShowCategoryPicker(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [isOpen, updateMenuPosition]);

  const closeMenu = () => {
    setIsOpen(false);
    setShowCategoryPicker(false);
    setMenuPosition(null);
  };

  const categoryOptions = [
    { value: UNASSIGNED, label: "Unassigned" },
    ...activePriorities.map((priority) => ({
      value: priority.name,
      label: priority.name,
    })),
  ];

  const menuContent =
    isOpen && menuPosition ? (
      <div
        ref={menuRef}
        role="menu"
        style={{
          position: "fixed",
          top: menuPosition.top,
          right: menuPosition.right,
          zIndex: 9999,
        }}
        className="min-w-44 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
      >
        {canAddSubTask ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onAddSubTask();
              closeMenu();
            }}
            className="w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Add Sub-task
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

        {onMoveToCategory ? (
          <>
            <button
              type="button"
              role="menuitem"
              onClick={() => setShowCategoryPicker((value) => !value)}
              className="w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Move to Category…
            </button>
            {showCategoryPicker ? (
              <div className="border-t border-zinc-100 dark:border-zinc-800">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onMoveToCategory(option.value);
                      closeMenu();
                    }}
                    disabled={task.category === option.value}
                    className="w-full px-4 py-2 text-left text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        {showMoveToWeek && onMoveToWeek ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onMoveToWeek();
              closeMenu();
            }}
            className="w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Move to This Week
          </button>
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
    ) : null;

  return (
    <div className="relative shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (isOpen) {
            closeMenu();
            return;
          }

          const rect = triggerRef.current?.getBoundingClientRect();
          if (rect) {
            setMenuPosition({
              top: rect.bottom + 4,
              right: window.innerWidth - rect.right,
            });
          }
          setIsOpen(true);
        }}
        aria-label={`Options for ${task.title}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {typeof document !== "undefined" && menuContent
        ? createPortal(menuContent, document.body)
        : null}
    </div>
  );
}
