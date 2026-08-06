"use client";

import { Modal } from "@/components/ui/Modal";

import type { LogEntryFormValues } from "../schema";
import type { LogEntry } from "../types";
import { LogEntryForm } from "./LogEntryForm";

interface LogEntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: LogEntryFormValues) => Promise<void>;
  entry?: LogEntry | null;
}

export function LogEntryFormModal({
  isOpen,
  onClose,
  onSubmit,
  entry,
}: LogEntryFormModalProps) {
  const isEdit = Boolean(entry);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit entry" : "New entry"}
    >
      <LogEntryForm
        key={entry?.id ?? "create"}
        defaultValues={
          entry ? { date: entry.date, text: entry.text } : undefined
        }
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel={isEdit ? "Update" : "Create"}
      />
    </Modal>
  );
}
