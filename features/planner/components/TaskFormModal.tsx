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
import type { CreateTaskInput, Task, TaskPriority } from "../types";

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  defaultWeekStart: string;
  task?: Task | null;
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultWeekStart,
  task,
}: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "Medium",
  );
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [weekDate, setWeekDate] = useState(task?.weekStart ?? defaultWeekStart);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const weekStart = getMondayOfWeek(new Date(weekDate + "T00:00:00"));
      await onSubmit({
        weekStart,
        title: title.trim(),
        priority,
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Edit Task" : "Add Task"}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormField label="Title" required>
            <TextInput
              value={title}
              onChange={setTitle}
              placeholder="Task title"
              required
              voice={false}
            />
          </FormField>

          <FormField label="Priority">
            <SelectInput
              value={priority}
              onChange={(value) => setPriority(value as TaskPriority)}
              options={PRIORITY_OPTIONS}
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

          <FormField label="Week">
            <input
              type="date"
              value={weekDate}
              onChange={(event) => setWeekDate(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </FormField>
        </div>

        <FormActions
          onCancel={onClose}
          submitLabel={task ? "Save" : "Add Task"}
          isSubmitting={isSubmitting}
        />
      </form>
    </Modal>
  );
}
