"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { useLeadListSettings } from "../hooks/useLeadListSettings";
import type { JobSearchListSettings } from "../types";

export function LeadListSettingsSection() {
  const { settings: loadedSettings, isLoading, updateSettings } =
    useLeadListSettings();
  const [draft, setDraft] = useState<JobSearchListSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const settings = draft ?? loadedSettings;

  const handleSave = async () => {
    if (!settings) return;
    if (
      !settings.leadStatuses.includes(settings.newLeadStatus) ||
      !settings.leadStatuses.includes(settings.contactedLeadStatus) ||
      settings.newLeadStatus === settings.contactedLeadStatus
    ) {
      toast.error("Choose distinct New and Contacted lead statuses.");
      return;
    }
    setIsSaving(true);
    try {
      setDraft(await updateSettings(settings));
      toast.success("Lead settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="mt-6 h-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />;
  }

  const updateList = (
    key: "leadStatuses" | "touchpointStatuses" | "responseStatuses" | "touchpointTypes",
    values: string[],
  ) => {
    const distinct = values.filter((value, index) => value.trim() &&
      values.findIndex((item) => item.trim().toLowerCase() === value.trim().toLowerCase()) === index);
    const next = { ...settings, [key]: distinct };
    if (key === "leadStatuses") {
      next.newLeadStatus = distinct.includes(settings.newLeadStatus) ? settings.newLeadStatus : distinct[0] ?? "";
      next.contactedLeadStatus = distinct.includes(settings.contactedLeadStatus) ? settings.contactedLeadStatus : distinct[1] ?? "";
    }
    if (key === "touchpointStatuses") {
      next.contactedTriggerStatuses = settings.contactedTriggerStatuses.filter((status) => distinct.includes(status));
    }
    setDraft(next);
  };

  return (
    <section className="mt-6 max-w-2xl rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Lead & touchpoint lists</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Edit each option individually. Choose the New and Contacted lead statuses and which send statuses mark a lead contacted.
        </p>
      </header>
      <div className="space-y-6 p-4 sm:p-6">
        <SettingsRows label="Lead statuses" values={settings.leadStatuses}
          onChange={(values) => updateList("leadStatuses", values)}
          marker={(value) => <div className="flex gap-2 text-xs">
            <label className="whitespace-nowrap"><input type="radio" name="new-lead-status" checked={settings.newLeadStatus === value} onChange={() => setDraft({ ...settings, newLeadStatus: value })} /> New</label>
            <label className="whitespace-nowrap"><input type="radio" name="contacted-lead-status" checked={settings.contactedLeadStatus === value} onChange={() => setDraft({ ...settings, contactedLeadStatus: value })} /> Contacted</label>
          </div>} />
        <SettingsRows label="Send statuses" values={settings.touchpointStatuses}
          onChange={(values) => updateList("touchpointStatuses", values)}
          marker={(value) => <label className="whitespace-nowrap text-xs">
            <input type="checkbox" checked={settings.contactedTriggerStatuses.includes(value)}
              onChange={(event) => setDraft({ ...settings, contactedTriggerStatuses: event.target.checked
                ? [...settings.contactedTriggerStatuses, value]
                : settings.contactedTriggerStatuses.filter((status) => status !== value) })} /> Contacted trigger
          </label>} />
        <SettingsRows label="Response statuses" values={settings.responseStatuses ?? []}
          onChange={(values) => updateList("responseStatuses", values)}
          hint="Whether they replied; separate from send status." />
        <SettingsRows label="Touchpoint types" values={settings.touchpointTypes}
          onChange={(values) => updateList("touchpointTypes", values)} />
      </div>
      <footer className="border-t border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
        <button type="button" onClick={() => void handleSave()} disabled={isSaving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900">
          {isSaving ? "Saving…" : "Save Lead Settings"}
        </button>
      </footer>
    </section>
  );
}

function SettingsRows({ label, values, onChange, marker, hint }: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  marker?: (value: string) => React.ReactNode;
  hint?: string;
}) {
  const [newValue, setNewValue] = useState("");
  return <div className="space-y-2">
    <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</h3>
    {values.map((value, index) => <div key={`${label}-${index}`} className="flex flex-wrap items-center gap-2">
      <input aria-label={`${label} ${index + 1}`} value={value} onChange={(event) => {
        const next = [...values];
        next[index] = event.target.value;
        onChange(next);
      }} className="min-w-40 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
      {marker?.(value)}
      <button type="button" onClick={() => onChange(values.filter((_, i) => i !== index))}
        className="px-2 py-2 text-sm text-zinc-500 hover:text-red-600">Delete</button>
    </div>)}
    <form className="flex gap-2" onSubmit={(event) => {
      event.preventDefault();
      const trimmed = newValue.trim();
      if (trimmed && !values.some((value) => value.toLowerCase() === trimmed.toLowerCase())) {
        onChange([...values, trimmed]);
        setNewValue("");
      }
    }}>
      <input value={newValue} onChange={(event) => setNewValue(event.target.value)}
        placeholder={`Add ${label.toLowerCase()}`}
        className="min-w-40 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
      <button type="submit" disabled={!newValue.trim()}
        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700">Add</button>
    </form>
    {hint ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
  </div>;
}
