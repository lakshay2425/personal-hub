"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import {
  FormActions,
  FormField,
  TextArea,
  TextInput,
} from "@/features/job-search/components/forms/FormFields";

import type {
  CreateSubTaskInput,
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from "../types";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (input: CreateTaskInput) => Promise<void>;
  onUpdate?: (id: number, input: UpdateTaskInput) => Promise<void>;
  onCreateSubTask?: (
    parentId: number,
    input: CreateSubTaskInput,
  ) => Promise<void>;
  task?: Task | null;
  subTaskParent?: Task | null;
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onCreateSubTask,
  task,
  subTaskParent,
}: TaskFormModalProps) {
  const isEdit = Boolean(task);
  const isSubTaskCreate = Boolean(subTaskParent);

  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalTitle = isEdit
    ? "Edit Task"
    : isSubTaskCreate
      ? "Add Sub-task"
      : "Add Task";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && task?.id && onUpdate) {
        await onUpdate(task.id, {
          title: title.trim(),
          notes: notes.trim(),
        });
      } else if (isSubTaskCreate && subTaskParent?.id && onCreateSubTask) {
        await onCreateSubTask(subTaskParent.id, {
          title: title.trim(),
          notes: notes.trim(),
        });
      } else if (onSubmit) {
        await onSubmit({
          title: title.trim(),
          notes: notes.trim(),
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {isSubTaskCreate && subTaskParent ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sub-task of{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {subTaskParent.title}
              </span>
            </p>
          ) : null}

          <FormField label="Title" required>
            <TextInput
              value={title}
              onChange={setTitle}
              placeholder="Task title"
              required
              voice={false}
            />
          </FormField>

          <FormField label="Notes">
            <TextArea
              value={notes}
              onChange={setNotes}
              placeholder="Optional notes"
              rows={3}
            />
          </FormField>
        </div>

        <FormActions
          onCancel={onClose}
          submitLabel={
            isEdit ? "Save" : isSubTaskCreate ? "Add Sub-task" : "Add Task"
          }
          isSubmitting={isSubmitting}
        />
      </form>
    </Modal>
  );
}
