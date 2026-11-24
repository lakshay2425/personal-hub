"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import type { Achievement } from "../../types";
import { FormActions, FormField, TextArea, TextInput } from "./FormFields";

interface AchievementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Achievement, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  achievement?: Achievement | null;
}

function AchievementForm({
  achievement,
  onClose,
  onSubmit,
}: Omit<AchievementFormModalProps, "isOpen">) {
  const [title, setTitle] = useState(achievement?.title ?? "");
  const [conciseVersion, setConciseVersion] = useState(achievement?.conciseVersion ?? "");
  const [detailedVersion, setDetailedVersion] = useState(achievement?.detailedVersion ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !conciseVersion.trim() || !detailedVersion.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        conciseVersion: conciseVersion.trim(),
        detailedVersion: detailedVersion.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <FormField label="Title" required>
        <TextInput
          value={title}
          onChange={setTitle}
          placeholder="Led migration to a new analytics platform"
          required
          voice={false}
        />
      </FormField>
      <FormField label="Concise version" required>
        <TextArea
          value={conciseVersion}
          onChange={setConciseVersion}
          placeholder="A short version to use in an opening message."
          rows={3}
          required
          voice={false}
        />
      </FormField>
      <FormField label="Detailed version" required>
        <TextArea
          value={detailedVersion}
          onChange={setDetailedVersion}
          placeholder="A little more context about the achievement and its impact."
          rows={5}
          required
          voice={false}
        />
      </FormField>
      <FormActions
        onCancel={onClose}
        submitLabel={achievement ? "Save Changes" : "Add Achievement"}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function AchievementFormModal({
  isOpen,
  onClose,
  onSubmit,
  achievement,
}: AchievementFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={achievement ? "Edit Achievement" : "Add Achievement"}
      size="lg"
    >
      <AchievementForm
        key={achievement?.id ?? "new-achievement"}
        achievement={achievement}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
