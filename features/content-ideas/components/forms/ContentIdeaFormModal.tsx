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

import { CONTENT_IDEA_STATUSES } from "../../constants";
import type { ContentIdea, ContentIdeaStatus } from "../../types";
import { EMPTY_PUBLISHED_LINKS } from "../../types";
import type { ContentIdeaInput } from "../../lib/contentIdeasRepository";

interface ContentIdeaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ContentIdeaInput, previousStatus?: ContentIdeaStatus) => Promise<void>;
  idea?: ContentIdea | null;
  projectId: string | null;
}

function ContentIdeaFormFields({
  idea,
  projectId,
  onClose,
  onSubmit,
}: {
  idea?: ContentIdea | null;
  projectId: string | null;
  onClose: () => void;
  onSubmit: ContentIdeaFormModalProps["onSubmit"];
}) {
  const [title, setTitle] = useState(idea?.title ?? "");
  const [status, setStatus] = useState<ContentIdeaStatus>(idea?.status ?? "Draft");
  const [publishedLinks, setPublishedLinks] = useState(
    idea?.publishedLinks ?? EMPTY_PUBLISHED_LINKS,
  );
  const [notes, setNotes] = useState(idea?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateLink = (field: keyof typeof publishedLinks, value: string) => {
    setPublishedLinks((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          projectId,
          title,
          status,
          publishedLinks,
          notes,
        },
        idea?.status,
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <FormField label="Title" required>
          <TextInput
            value={title}
            onChange={setTitle}
            placeholder="Content idea title"
            required
          />
        </FormField>

        <FormField label="Status">
          <SelectInput
            value={status}
            onChange={(value) => setStatus(value as ContentIdeaStatus)}
            options={CONTENT_IDEA_STATUSES.map((item) => ({
              value: item,
              label: item,
            }))}
          />
        </FormField>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            status === "Published"
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Published Links
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Add at least one link where this was published (optional).
              </p>
              <FormField label="LinkedIn URL">
                <TextInput
                  value={publishedLinks.linkedin}
                  onChange={(value) => updateLink("linkedin", value)}
                  placeholder="https://linkedin.com/..."
                  type="url"
                  voice={false}
                />
              </FormField>
              <FormField label="Twitter/X URL">
                <TextInput
                  value={publishedLinks.twitter}
                  onChange={(value) => updateLink("twitter", value)}
                  placeholder="https://x.com/..."
                  type="url"
                  voice={false}
                />
              </FormField>
              <FormField label="Blog URL">
                <TextInput
                  value={publishedLinks.blog}
                  onChange={(value) => updateLink("blog", value)}
                  placeholder="https://..."
                  type="url"
                  voice={false}
                />
              </FormField>
              <FormField label="Other URL">
                <TextInput
                  value={publishedLinks.other}
                  onChange={(value) => updateLink("other", value)}
                  placeholder="https://..."
                  type="url"
                  voice={false}
                />
              </FormField>
            </div>
          </div>
        </div>

        <FormField label="Notes">
          <TextArea
            value={notes}
            onChange={setNotes}
            placeholder="Additional notes..."
          />
        </FormField>
      </div>

      <FormActions
        onCancel={onClose}
        submitLabel={idea ? "Save Changes" : "Add Idea"}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function ContentIdeaFormModal({
  isOpen,
  onClose,
  onSubmit,
  idea,
  projectId,
}: ContentIdeaFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={idea ? "Edit Content Idea" : "Add Content Idea"}
      size="lg"
    >
      <ContentIdeaFormFields
        key={idea?.id ?? `create-${projectId ?? "standalone"}`}
        idea={idea}
        projectId={projectId}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
