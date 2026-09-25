"use client";

import { MoreVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface CompanyOverflowMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

interface MenuPosition {
  top: number;
  right: number;
}

export function CompanyOverflowMenu({
  onEdit,
  onDelete,
}: CompanyOverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
      setMenuPosition(null);
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
    setMenuPosition(null);
  };

  const handleToggle = () => {
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
  };

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
        className="min-w-36 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
      >
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
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label="Company options"
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
