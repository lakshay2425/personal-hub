"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { useSnoozePresets } from "../hooks/useSnoozePresets";
import type { SnoozePreset } from "../types";

export function SnoozePresetsSettingsSection() {
  const { presets: savedPresets, savePresets } = useSnoozePresets();
  const [draft, setDraft] = useState<SnoozePreset[] | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newDays, setNewDays] = useState("7");
  const [isSaving, setIsSaving] = useState(false);
  const presets = draft ?? savedPresets;

  const updatePreset = (
    index: number,
    update: Partial<SnoozePreset>,
  ) => {
    setDraft(
      presets.map((preset, currentIndex) =>
        currentIndex === index ? { ...preset, ...update } : preset,
      ),
    );
  };

  const addPreset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = newLabel.trim();
    const days = Number(newDays);
    if (!label || !Number.isInteger(days) || days < 1) {
      toast.error("Enter a preset label and a positive whole number of days.");
      return;
    }
    if (presets.some((preset) => preset.label.toLocaleLowerCase() === label.toLocaleLowerCase())) {
      toast.error("A snooze preset with that label already exists.");
      return;
    }

    setDraft([...presets, { label, days, isDefault: false }]);
    setNewLabel("");
    setNewDays("7");
  };

  const deletePreset = (index: number) => {
    if (presets.length === 1) {
      toast.error("Keep at least one snooze preset.");
      return;
    }
    const remaining = presets.filter((_, currentIndex) => currentIndex !== index);
    if (presets[index].isDefault) {
      remaining[0] = { ...remaining[0], isDefault: true };
    }
    setDraft(remaining);
  };

  const save = async () => {
    const normalized = presets.map((preset) => ({
      ...preset,
      label: preset.label.trim(),
    }));
    if (
      normalized.some(
        (preset) =>
          !preset.label ||
          !Number.isInteger(preset.days) ||
          preset.days < 1,
      )
    ) {
      toast.error("Each preset needs a label and a positive whole number of days.");
      return;
    }
    if (normalized.filter((preset) => preset.isDefault).length !== 1) {
      toast.error("Choose exactly one default snooze preset.");
      return;
    }
    const labels = normalized.map((preset) => preset.label.toLocaleLowerCase());
    if (new Set(labels).size !== labels.length) {
      toast.error("Snooze preset labels must be unique.");
      return;
    }

    setIsSaving(true);
    try {
      savePresets(normalized);
      setDraft(null);
      toast.success("Snooze presets saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save snooze presets",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mt-6 max-w-2xl rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Snooze presets
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Set quick snooze durations. A custom date is also available for each lead.
        </p>
      </header>
      <div className="space-y-3 p-4 sm:p-6">
        {presets.map((preset, index) => (
          <div
            key={`${preset.label}-${index}`}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              aria-label={`Snooze preset label ${index + 1}`}
              value={preset.label}
              onChange={(event) =>
                updatePreset(index, { label: event.target.value })
              }
              className="min-w-32 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
            />
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input
                type="number"
                min="1"
                step="1"
                aria-label={`Days for snooze preset ${index + 1}`}
                value={preset.days}
                onChange={(event) =>
                  updatePreset(index, { days: Number(event.target.value) })
                }
                className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              />
              days
            </label>
            <label className="flex items-center gap-1 whitespace-nowrap text-xs text-zinc-600 dark:text-zinc-300">
              <input
                type="radio"
                name="default-snooze-preset"
                checked={preset.isDefault}
                onChange={() =>
                  setDraft(
                    presets.map((item, currentIndex) => ({
                      ...item,
                      isDefault: currentIndex === index,
                    })),
                  )
                }
              />
              Default
            </label>
            <button
              type="button"
              onClick={() => deletePreset(index)}
              className="px-2 py-2 text-sm text-zinc-500 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
        <form className="flex flex-wrap gap-2" onSubmit={addPreset}>
          <input
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            placeholder="Preset label"
            aria-label="New snooze preset label"
            className="min-w-32 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="number"
              min="1"
              step="1"
              value={newDays}
              onChange={(event) => setNewDays(event.target.value)}
              aria-label="Days for new snooze preset"
              className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
            days
          </label>
          <button
            type="submit"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Add preset
          </button>
        </form>
      </div>
      <footer className="border-t border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => void save()}
          disabled={isSaving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {isSaving ? "Saving..." : "Save snooze presets"}
        </button>
      </footer>
    </section>
  );
}
