"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import {
  DEFAULT_PRODUCT_OUTREACH_CHANNEL,
  PRODUCT_OUTREACH_CHANNELS,
} from "../../constants";
import { getHandlePlaceholder } from "../../lib/productOutreachUtils";
import type { ProductOutreachInteractionInput } from "../../repositories/productOutreachRepository";
import type { ProductOutreachChannel, ProductOutreachInteraction } from "../../types";
import {
  FormActions,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
} from "./FormFields";

export type ProductOutreachFormMode =
  | "newContact"
  | "addInteraction"
  | "editInteraction";

interface ProductOutreachFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ProductOutreachFormMode;
  interaction?: ProductOutreachInteraction | null;
  contactLabel?: string;
  onSubmitNewContact: (
    label: string,
    interaction: ProductOutreachInteractionInput,
  ) => Promise<void>;
  onSubmitInteraction: (
    interaction: ProductOutreachInteractionInput,
  ) => Promise<void>;
}

function getModalTitle(mode: ProductOutreachFormMode): string {
  switch (mode) {
    case "newContact":
      return "Add Contact";
    case "addInteraction":
      return "Add Interaction";
    case "editInteraction":
      return "Edit Interaction";
  }
}

function getInitialFields(
  mode: ProductOutreachFormMode,
  interaction?: ProductOutreachInteraction | null,
  contactLabel?: string,
) {
  if (mode === "editInteraction" && interaction) {
    return {
      label: "",
      channel: interaction.channel,
      handle: interaction.handle,
      context: interaction.context,
    };
  }

  return {
    label: mode === "addInteraction" ? (contactLabel ?? "") : "",
    channel: DEFAULT_PRODUCT_OUTREACH_CHANNEL,
    handle: "",
    context: "",
  };
}

function ProductOutreachFormFields({
  onClose,
  mode,
  interaction,
  contactLabel,
  onSubmitNewContact,
  onSubmitInteraction,
}: Omit<ProductOutreachFormModalProps, "isOpen">) {
  const initial = getInitialFields(mode, interaction, contactLabel);
  const [label, setLabel] = useState(initial.label);
  const [channel, setChannel] = useState<ProductOutreachChannel>(
    initial.channel,
  );
  const [handle, setHandle] = useState(initial.handle);
  const [context, setContext] = useState(initial.context);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [handleError, setHandleError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContext = context.trim();
    const trimmedHandle = handle.trim();

    if (!trimmedHandle) {
      setHandleError("Handle is required");
      return;
    }
    if (!trimmedContext) {
      setContextError("Context is required");
      return;
    }

    setHandleError(null);
    setContextError(null);
    setIsSubmitting(true);

    const payload: ProductOutreachInteractionInput = {
      channel,
      handle: trimmedHandle,
      context: trimmedContext,
    };

    try {
      if (mode === "newContact") {
        await onSubmitNewContact(label, payload);
      } else {
        await onSubmitInteraction(payload);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        {mode === "newContact" ? (
          <div className="sm:col-span-2">
            <FormField label="Label">
              <TextInput
                value={label}
                onChange={setLabel}
                placeholder="Optional name to recognize this contact"
              />
            </FormField>
          </div>
        ) : null}

        <FormField label="Channel" required>
          <SelectInput
            value={channel}
            onChange={(value) => setChannel(value as ProductOutreachChannel)}
            options={PRODUCT_OUTREACH_CHANNELS.map((option) => ({
              value: option,
              label: option,
            }))}
            required
          />
        </FormField>

        <FormField label="Handle" required>
          <TextInput
            value={handle}
            onChange={(value) => {
              setHandle(value);
              if (value.trim()) setHandleError(null);
            }}
            placeholder={getHandlePlaceholder(channel)}
            required
          />
          {handleError ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {handleError}
            </p>
          ) : null}
        </FormField>

        <div className="sm:col-span-2">
          <FormField label="Context" required>
            <TextArea
              value={context}
              onChange={(value) => {
                setContext(value);
                if (value.trim()) setContextError(null);
              }}
              placeholder="Why you're reaching out this time..."
              rows={4}
            />
            {contextError ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {contextError}
              </p>
            ) : null}
          </FormField>
        </div>
      </div>

      <FormActions
        onCancel={onClose}
        submitLabel={mode === "editInteraction" ? "Save Changes" : "Add"}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

export function ProductOutreachFormModal({
  isOpen,
  onClose,
  mode,
  interaction,
  contactLabel,
  onSubmitNewContact,
  onSubmitInteraction,
}: ProductOutreachFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle(mode)}
      size="lg"
    >
      <ProductOutreachFormFields
        onClose={onClose}
        mode={mode}
        interaction={interaction}
        contactLabel={contactLabel}
        onSubmitNewContact={onSubmitNewContact}
        onSubmitInteraction={onSubmitInteraction}
      />
    </Modal>
  );
}
