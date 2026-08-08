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

import { FEATURE_STATUSES } from "../constants";
import type {
  CreateFeatureInput,
  FeatureStatus,
  ProjectFeature,
  ProjectVersion,
  UpdateFeatureInput,
} from "../types";
import { VersionCombobox } from "./VersionCombobox";

interface FeatureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  versions: ProjectVersion[];
  onSubmit: (
    input: CreateFeatureInput | UpdateFeatureInput,
    previousStatus?: FeatureStatus,
  ) => Promise<void>;
  onCreateVersion: (name: string) => Promise<ProjectVersion>;
  feature?: ProjectFeature | null;
}

export function FeatureFormModal({
  isOpen,
  onClose,
  projectId,
  versions,
  onSubmit,
  onCreateVersion,
  feature,
}: FeatureFormModalProps) {
  const [title, setTitle] = useState(feature?.title ?? "");
  const [versionId, setVersionId] = useState<number | null>(
    feature?.versionId ?? null,
  );
  const [status, setStatus] = useState<FeatureStatus>(
    feature?.status ?? "Idea",
  );
  const [notes, setNotes] = useState(feature?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (feature?.id) {
        await onSubmit(
          {
            title: title.trim(),
            versionId,
            status,
            notes: notes.trim(),
          },
          feature.status,
        );
      } else {
        await onSubmit({
          projectId,
          title: title.trim(),
          versionId,
          status,
          notes: notes.trim(),
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={feature ? "Edit Feature" : "Add Feature"}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormField label="Title" required>
            <TextInput
              value={title}
              onChange={setTitle}
              placeholder="Feature title"
              required
              voice={false}
            />
          </FormField>

          <FormField label="Version">
            <VersionCombobox
              versions={versions}
              value={versionId}
              onChange={setVersionId}
              onCreateVersion={onCreateVersion}
            />
          </FormField>

          <FormField label="Status">
            <SelectInput
              value={status}
              onChange={(value) => setStatus(value as FeatureStatus)}
              options={FEATURE_STATUSES.map((item) => ({
                value: item,
                label: item,
              }))}
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
          submitLabel={feature ? "Save" : "Add Feature"}
          isSubmitting={isSubmitting}
        />
      </form>
    </Modal>
  );
}
