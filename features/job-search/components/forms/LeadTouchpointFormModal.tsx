"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import {
  DEFAULT_RESPONSE_STATUS,
  DEFAULT_TOUCHPOINT_STATUS,
  DEFAULT_TOUCHPOINT_TYPES,
  ACCEPTANCE_RESPONSE_STATUSES,
  EMAIL_RESPONSE_STATUSES,
  EMAIL_TOUCHPOINT_TYPES,
  LEAD_CHANNELS,
  LINKEDIN_RESPONSE_STATUSES,
  LINKEDIN_MESSAGE_PURPOSES,
  LINKEDIN_TOUCHPOINT_TYPES,
  QUICK_TOUCHPOINT_ACTIONS,
} from "../../constants";
import { getOutreachTemplateTypeForChannel } from "../../lib/templateUtils";
import type { LeadTouchpoint, Template } from "../../types";
import { CreatableSelectInput } from "./CreatableSelectInput";
import {
  FormActions,
  FormField,
  SelectInput,
  TextArea,
  TextInput,
} from "./FormFields";
import { TemplateSelectInput } from "./TemplateSelectInput";
import type { LeadTouchpointInput } from "../../repositories/leadTouchpointsRepository";

export type LeadTouchpointFormMode = "addTouchpoint" | "editTouchpoint";

interface LeadTouchpointFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: LeadTouchpointFormMode;
  touchpoint?: LeadTouchpoint | null;
  defaultChannel?: LeadTouchpoint["channel"];
  templates: Template[];
  touchpointStatusOptions: string[];
  responseStatusOptions: string[];
  touchpointTypeOptions: string[];
  onSubmit: (data: LeadTouchpointInput) => Promise<void>;
  touchpoints: LeadTouchpoint[];
  onQuickAction: (
    action:
      | { kind: "create"; input: LeadTouchpointInput }
      | {
          kind: "update";
          touchpointId: number;
          responseStatus: string;
        },
  ) => Promise<void>;
}

interface LeadTouchpointFormFieldsProps {
  mode: LeadTouchpointFormMode;
  touchpoint?: LeadTouchpoint | null;
  defaultChannel: LeadTouchpoint["channel"];
  templates: Template[];
  touchpointStatusOptions: string[];
  responseStatusOptions: string[];
  touchpointTypeOptions: string[];
  onClose: () => void;
  onSubmit: (data: LeadTouchpointInput) => Promise<void>;
}

function toDateInputValue(timestamp: number | undefined): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateInputToTimestamp(value: string): number {
  if (!value.trim()) return Date.now();
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
}

function createQuickTouchpointInput(
  channel: LeadTouchpoint["channel"],
  action: { type: string; status: string; responseStatus: string },
): LeadTouchpointInput {
  return {
    channel,
    type: action.type,
    status: action.status,
    responseStatus: action.responseStatus,
    templateId: null,
    purpose: "",
    context: "",
    occurredAt: Date.now(),
  };
}

function LeadTouchpointFormFields({
  mode,
  touchpoint,
  defaultChannel,
  templates,
  touchpointStatusOptions,
  responseStatusOptions,
  touchpointTypeOptions,
  onClose,
  onSubmit,
}: LeadTouchpointFormFieldsProps) {
  const [channel, setChannel] = useState<LeadTouchpoint["channel"]>(
    touchpoint?.channel ?? defaultChannel,
  );
  const [type, setType] = useState(touchpoint?.type ?? "");
  const [purpose, setPurpose] = useState(touchpoint?.purpose ?? "");
  const [status, setStatus] = useState(
    touchpoint?.status ?? DEFAULT_TOUCHPOINT_STATUS,
  );
  const [responseStatus, setResponseStatus] = useState(
    touchpoint?.channel === "Email" &&
      ACCEPTANCE_RESPONSE_STATUSES.includes(touchpoint.responseStatus)
      ? DEFAULT_RESPONSE_STATUS
      : touchpoint?.responseStatus ?? DEFAULT_RESPONSE_STATUS,
  );
  const [templateId, setTemplateId] = useState(
    touchpoint?.templateId != null ? String(touchpoint.templateId) : "",
  );
  const [context, setContext] = useState(touchpoint?.context ?? "");
  const [occurredAt, setOccurredAt] = useState(
    toDateInputValue(touchpoint?.occurredAt),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const outreachTemplateType = getOutreachTemplateTypeForChannel(channel);
  const templateFilterType =
    channel === "Email" ? "Cold Email" : outreachTemplateType;
  const builtInTypes = [...LINKEDIN_TOUCHPOINT_TYPES, ...EMAIL_TOUCHPOINT_TYPES, ...DEFAULT_TOUCHPOINT_TYPES];
  const customTypes = touchpointTypeOptions.filter((option) => !builtInTypes.includes(option));
  const availableTypes = channel === "Email"
    ? [...EMAIL_TOUCHPOINT_TYPES, ...customTypes]
    : channel === "LinkedIn"
      ? [...LINKEDIN_TOUCHPOINT_TYPES, ...customTypes]
      : touchpointTypeOptions;
  const builtInResponses = [...LINKEDIN_RESPONSE_STATUSES, "Positive Response"];
  const customResponses = responseStatusOptions.filter((option) => !builtInResponses.includes(option));
  const availableResponses = channel === "Email"
    ? [...EMAIL_RESPONSE_STATUSES, ...customResponses]
    : channel === "LinkedIn"
      ? [...LINKEDIN_RESPONSE_STATUSES, ...customResponses]
      : responseStatusOptions;
  const changeChannel = (nextChannel: LeadTouchpoint["channel"]) => {
    setChannel(nextChannel);
    const nextTypes = nextChannel === "Email"
      ? [...EMAIL_TOUCHPOINT_TYPES, ...customTypes]
      : nextChannel === "LinkedIn"
        ? [...LINKEDIN_TOUCHPOINT_TYPES, ...customTypes]
        : touchpointTypeOptions;
    if (type && !nextTypes.includes(type)) setType("");
    const nextResponses = nextChannel === "Email"
      ? [...EMAIL_RESPONSE_STATUSES, ...customResponses]
      : nextChannel === "LinkedIn"
        ? [...LINKEDIN_RESPONSE_STATUSES, ...customResponses]
        : responseStatusOptions;
    if (!nextResponses.includes(responseStatus)) setResponseStatus(DEFAULT_RESPONSE_STATUS);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        channel,
        type: type.trim() || "Other",
        purpose: purpose.trim(),
        status: status.trim() || DEFAULT_TOUCHPOINT_STATUS,
        responseStatus: responseStatus.trim() || DEFAULT_RESPONSE_STATUS,
        templateId: templateId ? Number(templateId) : null,
        context,
        occurredAt: dateInputToTimestamp(occurredAt),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Channel" required>
          <SelectInput
            value={channel}
            onChange={(value) => changeChannel(value as LeadTouchpoint["channel"])}
            options={LEAD_CHANNELS.map((option) => ({
              value: option,
              label: option,
            }))}
            required
          />
        </FormField>
        <FormField label="Type" required>
          <CreatableSelectInput
            value={type}
            onChange={setType}
            options={availableTypes}
            placeholder="Select type..."
            createLabel="Add new type..."
            newValuePlaceholder="Initial, Follow-up..."
          />
        </FormField>
        <FormField label="Purpose">
          {channel === "LinkedIn" && ["Message", "Follow-up"].includes(type) ? (
            <CreatableSelectInput
              value={purpose}
              onChange={setPurpose}
              placeholder="Choose purpose..."
              options={LINKEDIN_MESSAGE_PURPOSES}
              createLabel="Add custom purpose..."
              newValuePlaceholder="Enter a custom purpose"
              required={mode === "addTouchpoint"}
            />
          ) : (
            <TextInput
              value={purpose}
              onChange={setPurpose}
              placeholder="First message, first follow-up..."
            />
          )}
        </FormField>
        <FormField label="Status" required>
          <CreatableSelectInput
            value={status}
            onChange={setStatus}
            options={touchpointStatusOptions}
            placeholder="Select status..."
            createLabel="Add new status..."
            newValuePlaceholder="Draft, Sent..."
          />
        </FormField>
        <FormField label="Response" required>
          <CreatableSelectInput
            value={responseStatus}
            onChange={setResponseStatus}
            options={availableResponses}
            placeholder="Select response..."
            createLabel="Add new response..."
            newValuePlaceholder="Not responded, Replied..."
          />
        </FormField>
        <FormField label="Date">
          <TextInput
            value={occurredAt}
            onChange={setOccurredAt}
            type="date"
          />
        </FormField>
        {templateFilterType ? (
          <TemplateSelectInput
            label="Template"
            value={templateId}
            onChange={setTemplateId}
            templates={templates}
            filterType={templateFilterType}
            placeholder="Select template (optional)"
          />
        ) : (
          <FormField label="Template">
            <SelectInput
              value={templateId}
              onChange={setTemplateId}
              placeholder="No template filter for this channel"
              options={templates.map((template) => ({
                value: template.id!,
                label: template.title,
              }))}
            />
          </FormField>
        )}
        <div className="sm:col-span-2">
          <FormField label="Context">
            <TextArea value={context} onChange={setContext} />
          </FormField>
        </div>
      </div>
      <FormActions
        onCancel={onClose}
        submitLabel={
          mode === "editTouchpoint" ? "Save Changes" : "Add Touchpoint"
        }
        isSubmitting={isSubmitting}
      />
    </form>
  );
}

function QuickTouchpointActions({
  channel,
  touchpoints,
  onCustomize,
  onQuickAction,
}: {
  channel: LeadTouchpoint["channel"];
  touchpoints: LeadTouchpoint[];
  onCustomize: () => void;
  onQuickAction: LeadTouchpointFormModalProps["onQuickAction"];
}) {
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [ambiguousTouchpoints, setAmbiguousTouchpoints] = useState<
    LeadTouchpoint[]
  >([]);
  const [ambiguousActionId, setAmbiguousActionId] = useState<string | null>(
    null,
  );
  const [isDraftingMessage, setIsDraftingMessage] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [draftPurpose, setDraftPurpose] = useState("");
  const [messagePurposeActionId, setMessagePurposeActionId] = useState<
    string | null
  >(null);
  const [selectedMessagePurpose, setSelectedMessagePurpose] = useState("");
  const [error, setError] = useState<string | null>(null);

  const actions = QUICK_TOUCHPOINT_ACTIONS[channel] ?? [];
  const saveMessageDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draftMessage.trim() || !draftPurpose.trim() || pendingActionId) return;

    setError(null);
    setPendingActionId("message-draft");
    try {
      await onQuickAction({
        kind: "create",
        input: {
          channel: "LinkedIn",
          type: "Message Draft",
          status: DEFAULT_TOUCHPOINT_STATUS,
          responseStatus: DEFAULT_RESPONSE_STATUS,
          templateId: null,
          purpose: draftPurpose,
          context: draftMessage,
          occurredAt: Date.now(),
        },
      });
      setDraftMessage("");
      setDraftPurpose("");
      setIsDraftingMessage(false);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Could not save this message draft.",
      );
    } finally {
      setPendingActionId(null);
    }
  };

  const applyAction = async (
    actionId: string,
    touchpoint?: LeadTouchpoint,
    purpose = "",
  ) => {
    const action = actions.find((candidate) => candidate.id === actionId);
    if (!action || pendingActionId) return;

    setError(null);
    setPendingActionId(actionId);
    try {
      if (action.updateType) {
        if (!touchpoint?.id) {
          const eligible = touchpoints.filter(
            (candidate) =>
              candidate.channel === channel &&
              candidate.status === "Sent" &&
              action.eligibleTypes?.includes(candidate.type) &&
              (action.updateType === "acceptance"
                ? ["Not accepted", "Not responded"].includes(
                    candidate.responseStatus,
                  )
                : candidate.responseStatus === "Not responded"),
          );
          if (eligible.length === 0) {
            setError(
              action.updateType === "acceptance"
                ? "No unanswered connection request is available to update."
                : "No unanswered message or follow-up is available to update.",
            );
            return;
          }

          const latestOccurredAt = Math.max(
            ...eligible.map((candidate) => candidate.occurredAt),
          );
          const latest = eligible.filter(
            (candidate) => candidate.occurredAt === latestOccurredAt,
          );
          if (latest.length > 1) {
            setAmbiguousTouchpoints(latest);
            setAmbiguousActionId(action.id);
            return;
          }
          touchpoint = latest[0];
        }

        await onQuickAction({
          kind: "update",
          touchpointId: touchpoint.id!,
          responseStatus: action.responseStatus,
        });
      } else {
        await onQuickAction({
          kind: "create",
          input: {
            ...createQuickTouchpointInput(channel, action),
            purpose,
          },
        });
        setMessagePurposeActionId(null);
        setSelectedMessagePurpose("");
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Could not save this touchpoint.",
      );
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {isDraftingMessage ? (
        <form onSubmit={saveMessageDraft} className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Save a message to use after your connection request is accepted.
          </p>
          <FormField label="Message Draft" required>
            <TextArea
              value={draftMessage}
              onChange={setDraftMessage}
              placeholder="Write the message you plan to send..."
              rows={6}
            />
          </FormField>
          <FormField label="Purpose" required>
            <TextInput
              value={draftPurpose}
              onChange={setDraftPurpose}
              placeholder="First message, first follow-up, second follow-up..."
            />
          </FormField>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsDraftingMessage(false);
                setDraftMessage("");
                setDraftPurpose("");
                setError(null);
              }}
              disabled={pendingActionId !== null}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Back to quick actions
            </button>
            <button
              type="submit"
              disabled={
                !draftMessage.trim() ||
                !draftPurpose.trim() ||
                pendingActionId !== null
              }
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {pendingActionId === "message-draft" ? "Saving..." : "Save Draft"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Quick actions for {channel}
          </p>
          {messagePurposeActionId ? (
            <div className="space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <FormField label="Purpose" required>
                <CreatableSelectInput
                  value={selectedMessagePurpose}
                  onChange={setSelectedMessagePurpose}
                  placeholder="Choose purpose..."
                  options={LINKEDIN_MESSAGE_PURPOSES}
                  createLabel="Add custom purpose..."
                  newValuePlaceholder="Enter a custom purpose"
                />
              </FormField>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMessagePurposeActionId(null);
                    setSelectedMessagePurpose("");
                  }}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedMessagePurpose || pendingActionId !== null}
                  onClick={() =>
                    void applyAction(
                      messagePurposeActionId,
                      undefined,
                      selectedMessagePurpose,
                    )
                  }
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
                >
                  {pendingActionId === messagePurposeActionId ? "Saving..." : "Save Touchpoint"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={pendingActionId !== null}
                onClick={() => {
                  if (
                    channel === "LinkedIn" &&
                    action.id === "linkedin-message-sent"
                  ) {
                    setSelectedMessagePurpose("");
                    setMessagePurposeActionId(action.id);
                  } else {
                    void applyAction(action.id);
                  }
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {pendingActionId === action.id ? "Saving..." : action.label}
              </button>
            ))}
            {channel === "LinkedIn" ? (
              <button
                type="button"
                disabled={pendingActionId !== null}
                onClick={() => {
                  setError(null);
                  setIsDraftingMessage(true);
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Message Draft
              </button>
            ) : null}
          </div>
        </>
      )}
      {ambiguousTouchpoints.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-amber-300 p-3 dark:border-amber-700">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            More than one eligible touchpoint has the same date. Choose which
            one to update.
          </p>
          {ambiguousTouchpoints.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              disabled={pendingActionId !== null}
              onClick={() => {
                if (ambiguousActionId) {
                  void applyAction(ambiguousActionId, candidate);
                }
              }}
              className="block w-full rounded-md border border-zinc-200 px-3 py-2 text-left text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {candidate.type} · {new Date(candidate.occurredAt).toLocaleString()}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setAmbiguousTouchpoints([]);
              setAmbiguousActionId(null);
              setPendingActionId(null);
            }}
            className="text-sm text-zinc-500 underline"
          >
            Cancel selection
          </button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onCustomize}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Customize
      </button>
    </div>
  );
}

export function LeadTouchpointFormModal({
  isOpen,
  onClose,
  mode,
  touchpoint,
  defaultChannel = "Email",
  templates,
  touchpointStatusOptions,
  responseStatusOptions,
  touchpointTypeOptions,
  onSubmit,
  touchpoints,
  onQuickAction,
}: LeadTouchpointFormModalProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const handleClose = () => {
    setIsCustomizing(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === "editTouchpoint" ? "Edit Touchpoint" : "Add Touchpoint"}
      size="lg"
    >
      {mode === "addTouchpoint" && !isCustomizing ? (
        <QuickTouchpointActions
          channel={defaultChannel}
          touchpoints={touchpoints}
          onCustomize={() => setIsCustomizing(true)}
          onQuickAction={onQuickAction}
        />
      ) : (
        <>
          {mode === "addTouchpoint" ? (
            <button
              type="button"
              onClick={() => setIsCustomizing(false)}
              className="mb-3 text-sm text-zinc-500 underline"
            >
              Back to quick actions
            </button>
          ) : null}
          <LeadTouchpointFormFields
            key={`${mode}-${touchpoint?.id ?? "new"}-${defaultChannel}`}
            mode={mode}
            touchpoint={touchpoint}
            defaultChannel={defaultChannel}
            templates={templates}
            touchpointStatusOptions={touchpointStatusOptions}
            responseStatusOptions={responseStatusOptions}
            touchpointTypeOptions={touchpointTypeOptions}
            onClose={handleClose}
            onSubmit={onSubmit}
          />
        </>
      )}
    </Modal>
  );
}
