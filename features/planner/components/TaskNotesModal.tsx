"use client";

import { Modal } from "@/components/ui/Modal";

interface TaskNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  notes: string;
}

export function TaskNotesModal({
  isOpen,
  onClose,
  title,
  notes,
}: TaskNotesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
        {notes.trim() || "No notes for this task."}
      </div>
    </Modal>
  );
}
