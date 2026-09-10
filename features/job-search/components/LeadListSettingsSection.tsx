"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import {
  DEFAULT_CONTACTED_LEAD_STATUS,
  DEFAULT_NEW_LEAD_STATUS,
} from "../constants";
import { useLeadListSettings } from "../hooks/useLeadListSettings";
import type { JobSearchListSettings } from "../types";

function parseListInput(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function listToText(values: string[]): string {
  return values.join("\n");
}

export function LeadListSettingsSection() {
  const { settings: loadedSettings, isLoading, updateSettings } =
    useLeadListSettings();
  const [draft, setDraft] = useState<JobSearchListSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const settings = draft ?? loadedSettings;

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const saved = await updateSettings({
        ...settings,
        leadStatuses: parseListInput(listToText(settings.leadStatuses)),
        touchpointStatuses: parseListInput(
          listToText(settings.touchpointStatuses),
        ),
        touchpointTypes: parseListInput(listToText(settings.touchpointTypes)),
        contactedTriggerStatuses: parseListInput(
          listToText(settings.contactedTriggerStatuses),
        ),
      });
      setDraft(saved);
      toast.success("Lead settings saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="mt-6 h-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  return (
    <div className="mt-6 max-w-xl rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Lead & touchpoint lists
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Customize lead statuses, touchpoint statuses/types, and which
          touchpoint statuses mark a lead as contacted.
        </p>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <SettingsTextArea
          label="Lead statuses (one per line)"
          value={listToText(settings.leadStatuses)}
          onChange={(value) =>
            setDraft({ ...settings, leadStatuses: parseListInput(value) })
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsInput
            label="New lead status"
            value={settings.newLeadStatus}
            onChange={(value) =>
              setDraft({ ...settings, newLeadStatus: value })
            }
            placeholder={DEFAULT_NEW_LEAD_STATUS}
          />
          <SettingsInput
            label="Contacted lead status"
            value={settings.contactedLeadStatus}
            onChange={(value) =>
              setDraft({ ...settings, contactedLeadStatus: value })
            }
            placeholder={DEFAULT_CONTACTED_LEAD_STATUS}
          />
        </div>
        <SettingsTextArea
          label="Touchpoint statuses (one per line)"
          value={listToText(settings.touchpointStatuses)}
          onChange={(value) =>
            setDraft({
              ...settings,
              touchpointStatuses: parseListInput(value),
            })
          }
        />
        <SettingsTextArea
          label="Touchpoint types (one per line)"
          value={listToText(settings.touchpointTypes)}
          onChange={(value) =>
            setDraft({ ...settings, touchpointTypes: parseListInput(value) })
          }
        />
        <SettingsTextArea
          label="Contacted trigger statuses (one per line)"
          value={listToText(settings.contactedTriggerStatuses)}
          onChange={(value) =>
            setDraft({
              ...settings,
              contactedTriggerStatuses: parseListInput(value),
            })
          }
          hint="When a touchpoint has one of these statuses, the lead auto-updates to the contacted status."
        />
      </div>

      <div className="border-t border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSaving ? "Saving…" : "Save Lead Settings"}
        </button>
      </div>
    </div>
  );
}

function SettingsInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      />
    </div>
  );
}

function SettingsTextArea({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      />
      {hint ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
