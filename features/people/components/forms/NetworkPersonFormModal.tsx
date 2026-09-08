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
  DEFAULT_PEOPLE_PLATFORM,
  DEFAULT_RELATIONSHIP_TYPE,
  isValidProfileUrl,
  PEOPLE_PLATFORMS,
  RELATIONSHIP_TYPES,
} from "../../constants";
import type {
  NetworkPerson,
  NetworkPersonInput,
  PeoplePlatform,
  RelationshipType,
} from "../../types";

interface NetworkPersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  person?: NetworkPerson | null;
  onSubmit: (data: NetworkPersonInput) => Promise<void>;
}

function NetworkPersonFormFields({
  onClose,
  person,
  onSubmit,
}: Omit<NetworkPersonFormModalProps, "isOpen">) {
  const [name, setName] = useState(person?.name ?? "");
  const [platform, setPlatform] = useState<PeoplePlatform>(
    person?.platform ?? DEFAULT_PEOPLE_PLATFORM,
  );
  const [profileUrl, setProfileUrl] = useState(person?.profileUrl ?? "");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(
    person?.relationshipType ?? DEFAULT_RELATIONSHIP_TYPE,
  );
  const [howWeKnow, setHowWeKnow] = useState(person?.howWeKnow ?? "");
  const [metAt, setMetAt] = useState(person?.metAt ?? "");
  const [notes, setNotes] = useState(person?.notes ?? "");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [howWeKnowError, setHowWeKnowError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedUrl = profileUrl.trim();
    const trimmedHowWeKnow = howWeKnow.trim();

    let hasError = false;

    if (!trimmedHowWeKnow) {
      setHowWeKnowError("How you know them is required");
      hasError = true;
    } else {
      setHowWeKnowError(null);
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
        relationshipType,
        howWeKnow: trimmedHowWeKnow,
        metAt: metAt.trim(),
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
      <FormField label="Relationship" required>
        <SelectInput
          value={relationshipType}
          onChange={(value) => setRelationshipType(value as RelationshipType)}
          options={RELATIONSHIP_TYPES.map((item) => ({
            value: item,
            label: item,
          }))}
          required
        />
      </FormField>
      <FormField label="How you know them" required>
        <TextArea
          value={howWeKnow}
          onChange={(value) => {
            setHowWeKnow(value);
            if (howWeKnowError) setHowWeKnowError(null);
          }}
          placeholder="Worked together, introduced by, etc."
          rows={2}
        />
        {howWeKnowError ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {howWeKnowError}
          </p>
        ) : null}
      </FormField>
      <FormField label="Met at">
        <TextInput
          value={metAt}
          onChange={setMetAt}
          placeholder="Optional event, company, or date"
        />
      </FormField>
      <FormField label="Notes">
        <TextArea
          value={notes}
          onChange={setNotes}
          placeholder="Optional notes"
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

export function NetworkPersonFormModal({
  isOpen,
  onClose,
  person,
  onSubmit,
}: NetworkPersonFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={person ? "Edit person" : "Add person"}
      size="md"
    >
      <NetworkPersonFormFields
        key={person?.id ?? "new"}
        onClose={onClose}
        person={person}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
