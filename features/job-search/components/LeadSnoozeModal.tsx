"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import { getSnoozeDate, isValidSnoozeDate } from "../lib/snoozeUtils";
import type { LeadWithTouchpoints, SnoozePreset } from "../types";
import { TextArea } from "./forms/FormFields";

interface LeadSnoozeModalProps {
  lead: LeadWithTouchpoints;
  presets: SnoozePreset[];
  onClose: () => void;
  onApply: (until: string, reason: string) => Promise<void>;
}

export function LeadSnoozeModal({
  lead,
  presets,
  onClose,
  onApply,
}: LeadSnoozeModalProps) {
  const defaultPreset =
    presets.find((preset) => preset.isDefault) ?? presets[0];
  const [until, setUntil] = useState(
    getSnoozeDate(defaultPreset.days),
  );
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const minDate = getSnoozeDate(1);
  const isDateValid = isValidSnoozeDate(until) && until >= minDate;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDateValid || isSaving) return;

    setIsSaving(true);
    try {
      await onApply(until, reason.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Snooze ${lead.name}`} size="sm">
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Choose a preset
          </legend>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const presetDate = getSnoozeDate(preset.days);
              const isSelected = until === presetDate;
              return (
                <button
                  key={`${preset.label}-${preset.days}`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setUntil(presetDate)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Custom date
          <input
            type="date"
            value={until}
            min={minDate}
            onChange={(event) => setUntil(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Reason (optional)
          </label>
          <TextArea
            value={reason}
            onChange={setReason}
            placeholder="Add a note about this snooze"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isDateValid || isSaving}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {isSaving ? "Saving..." : "Snooze lead"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
