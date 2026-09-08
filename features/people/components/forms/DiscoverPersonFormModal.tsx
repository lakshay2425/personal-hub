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

import {
  DEFAULT_DISCOVER_STATUS,
  DEFAULT_PEOPLE_PLATFORM,
  DISCOVER_STATUSES,
  isValidProfileUrl,
  PEOPLE_PLATFORMS,
} from "../../constants";
import type { DiscoverPerson, DiscoverPersonInput, DiscoverStatus, PeoplePlatform } from "../../types";

interface DiscoverPersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  person?: DiscoverPerson | null;
  onSubmit: (data: DiscoverPersonInput) => Promise<void>;
}

function DiscoverPersonFormFields({
  onClose,
  person,
  onSubmit,
}: Omit<DiscoverPersonFormModalProps, "isOpen">) {
  const [name, setName] = useState(person?.name ?? "");
  const [platform, setPlatform] = useState<PeoplePlatform>(
    person?.platform ?? DEFAULT_PEOPLE_PLATFORM,
  );
  const [profileUrl, setProfileUrl] = useState(person?.profileUrl ?? "");
  const [whySaved, setWhySaved] = useState(person?.whySaved ?? "");
  const [status, setStatus] = useState<DiscoverStatus>(
    person?.status ?? DEFAULT_DISCOVER_STATUS,
  );
  const [notes, setNotes] = useState(person?.notes ?? "");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [whySavedError, setWhySavedError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedUrl = profileUrl.trim();
    const trimmedWhySaved = whySaved.trim();

    let hasError = false;

    if (!trimmedWhySaved) {
      setWhySavedError("Why you saved them is required");
      hasError = true;
    } else {
      setWhySavedError(null);
    }

    if (!isValidProfileUrl(trimmedUrl)) {
      setUrlError("Profile URL must start with http:// or https://");
      hasError = true;
    } else {
      setUrlError(null);
    }

    if (!trimmedName || hasError) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        platform,
        profileUrl: trimmedUrl,
        whySaved: trimmedWhySaved,
        status,
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Name" required>
        <TextInput
          value={name}
          onChange={setName}
          placeholder="Name"
          required
        />
      </FormField>
      <FormField label="Platform" required>
        <SelectInput
          value={platform}
          onChange={(value) => setPlatform(value as PeoplePlatform)}
          options={PEOPLE_PLATFORMS.map((item) => ({
            value: item,
            label: item,
          }))}
          required
        />
      </FormField>
      <FormField label="Profile URL" required>
        <TextInput
          value={profileUrl}
          onChange={(value) => {
            setProfileUrl(value);
            if (urlError) setUrlError(null);
          }}
          placeholder="https://"
          type="url"
          required
          voice={false}
        />
        {urlError ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{urlError}</p>
        ) : null}
      </FormField>
      <FormField label="Why saved" required>
        <TextArea
          value={whySaved}
          onChange={(value) => {
            setWhySaved(value);
            if (whySavedError) setWhySavedError(null);
          }}
          placeholder="Why you want to review their content"
          rows={2}
        />
        {whySavedError ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {whySavedError}
          </p>
        ) : null}
      </FormField>
      <FormField label="Status" required>
        <SelectInput
          value={status}
          onChange={(value) => setStatus(value as DiscoverStatus)}
          options={DISCOVER_STATUSES.map((item) => ({
            value: item,
            label: item,
          }))}
          required
        />
      </FormField>
      <FormField label="Notes">
        <TextArea
          value={notes}
          onChange={setNotes}
          placeholder="Optional notes after review"
        />
      </FormField>
      <FormActions
        onCancel={onClose}
        submitLabel={person ? "Save person" : "Add person"}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function DiscoverPersonFormModal({
  isOpen,
  onClose,
  person,
  onSubmit,
}: DiscoverPersonFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={person ? "Edit person" : "Add person"}
      size="md"
    >
      <DiscoverPersonFormFields
        key={person?.id ?? "new"}
        onClose={onClose}
        person={person}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
