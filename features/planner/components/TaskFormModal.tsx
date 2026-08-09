"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import {
  FormActions,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
} from "@/features/job-search/components/forms/FormFields";

import { getMondayOfWeek } from "../lib/weekUtils";
import type {
  CreateSubTaskInput,
  CreateTaskInput,
  Task,
  TaskPriority,
  UpdateTaskInput,
} from "../types";

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

const SUB_TASK_PRIORITY_OPTIONS = [
  { value: "", label: "None" },
  ...PRIORITY_OPTIONS,
];

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (input: CreateTaskInput) => Promise<void>;
  onUpdate?: (id: number, input: UpdateTaskInput) => Promise<void>;
  onCreateSubTask?: (
    parentId: number,
    input: CreateSubTaskInput,
  ) => Promise<void>;
  defaultWeekStart: string;
  task?: Task | null;
  subTaskParent?: Task | null;
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onCreateSubTask,
  defaultWeekStart,
  task,
  subTaskParent,
}: TaskFormModalProps) {
  const isEdit = Boolean(task);
  const isSubTaskCreate = Boolean(subTaskParent);
  const isSubTaskForm =
    isSubTaskCreate || (isEdit && task !== null && task !== undefined && task.depth > 0);
  const showWeekPicker = !isSubTaskCreate && (!task || task.depth === 0);

  const [title, setTitle] = useState(task?.title ?? "");
  const [rootPriority, setRootPriority] = useState<TaskPriority>(
    task?.priority ?? "Medium",
  );
  const [subTaskPriority, setSubTaskPriority] = useState<TaskPriority | null>(
    task?.priority ?? null,
  );
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [weekDate, setWeekDate] = useState(task?.weekStart ?? defaultWeekStart);
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
        const input: UpdateTaskInput = {
          title: title.trim(),
          notes: notes.trim(),
          priority: isSubTaskForm ? subTaskPriority : rootPriority,
        };
        if (showWeekPicker) {
          input.weekStart = getMondayOfWeek(new Date(weekDate + "T00:00:00"));
        }
        await onUpdate(task.id, input);
      } else if (isSubTaskCreate && subTaskParent?.id && onCreateSubTask) {
        await onCreateSubTask(subTaskParent.id, {
          title: title.trim(),
          priority: subTaskPriority,
          notes: notes.trim(),
        });
      } else if (onSubmit) {
        const weekStart = getMondayOfWeek(new Date(weekDate + "T00:00:00"));
        await onSubmit({
          weekStart,
          title: title.trim(),
          priority: rootPriority,
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

          <FormField label={isSubTaskForm ? "Priority (optional)" : "Priority"}>
            {isSubTaskForm ? (
              <SelectInput
                value={subTaskPriority ?? ""}
                onChange={(value) =>
                  setSubTaskPriority(value ? (value as TaskPriority) : null)
                }
                options={SUB_TASK_PRIORITY_OPTIONS}
              />
            ) : (
              <SelectInput
                value={rootPriority}
                onChange={(value) => setRootPriority(value as TaskPriority)}
                options={PRIORITY_OPTIONS}
              />
            )}
          </FormField>

          <FormField label="Notes">
            <TextArea
              value={notes}
              onChange={setNotes}
              placeholder="Optional notes"
              rows={3}
            />
          </FormField>

          {showWeekPicker ? (
            <FormField label="Week">
              <input
                type="date"
                value={weekDate}
                onChange={(event) => setWeekDate(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </FormField>
          ) : null}
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
