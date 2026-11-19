"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useLeadListSettings } from "../hooks/useLeadListSettings";
import { getListSettings } from "../repositories/listSettingsRepository";

export function FollowUpSettingsSection() {
  const { settings, isLoading, updateSettings } = useLeadListSettings();
  const [delay, setDelay] = useState("3");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (settings) setDelay(String(settings.followUpDelayDays));
  }, [settings]);

  const save = async () => {
    const value = Number(delay);
    if (!/^\d+$/.test(delay) || !Number.isInteger(value) || value < 1 || value > 365) {
      setError("Enter a whole number from 1 to 365 days.");
      return;
    }
    if (!settings) return;
    setError("");
    setSaving(true);
    try {
      const latestSettings = await getListSettings();
      await updateSettings({ ...latestSettings, followUpDelayDays: value });
      toast.success("Follow-up settings saved");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Could not save follow-up settings");
    } finally {
      setSaving(false);
    }
  };

  return <section className="mt-6 max-w-2xl rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <header className="border-b border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Follow-up schedule</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Choose how many days after a sent initial message the first follow-up is due. A lead-specific override takes precedence.</p>
    </header>
    <div className="flex flex-wrap items-end gap-3 p-4 sm:p-6">
      <label className="block w-40 text-sm font-medium text-zinc-700 dark:text-zinc-300">Default delay (days)
        <input type="number" min="1" max="365" step="1" value={delay} disabled={isLoading} onChange={(event) => { setDelay(event.target.value); setError(""); }} aria-invalid={Boolean(error)} aria-describedby={error ? "follow-up-delay-error" : undefined} className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50" />
      </label>
      <button type="button" onClick={() => void save()} disabled={saving || isLoading} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900">{saving ? "Saving…" : "Save follow-up delay"}</button>
      {error ? <p id="follow-up-delay-error" role="alert" className="w-full text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  </section>;
}
