"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getWeeklyTargetSettings,
  saveWeeklyTargetSettings,
  WEEKLY_TARGET_CATEGORIES,
} from "../repositories/weeklyTargetsRepository";
import type { WeeklyTargetCategory, WeeklyTargetSettings } from "../types";

export function WeeklyTargetsSettingsSection() {
  const [settings, setSettings] = useState<WeeklyTargetSettings | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    void getWeeklyTargetSettings().then((value) => {
      if (active) setSettings(value);
    });
    return () => { active = false; };
  }, []);

  if (!settings) return <div className="mt-6 h-48 max-w-2xl animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />;

  const toggleCategory = (category: WeeklyTargetCategory, enabled: boolean) => {
    setSettings({
      ...settings,
      combinedCategories: enabled
        ? [...new Set([...settings.combinedCategories, category])]
        : settings.combinedCategories.filter((item) => item !== category),
    });
  };
  const save = async () => {
    setSaving(true);
    try {
      await saveWeeklyTargetSettings(settings);
      toast.success("Weekly targets saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save targets");
    } finally {
      setSaving(false);
    }
  };
  const switchClass = (enabled: boolean) =>
    `relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? "bg-zinc-900 dark:bg-zinc-50" : "bg-zinc-200 dark:bg-zinc-700"}`;

  return <section className="mt-6 max-w-2xl rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <header className="border-b border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Weekly targets</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Targets and progress reset every Monday. You can track a combined total, individual activities, or both.</p>
    </header>
    <div className="space-y-5 p-4 sm:p-6">
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
        <div className="flex items-center justify-between gap-4">
          <div><h3 className="text-sm font-medium">Combined target</h3><p className="mt-1 text-xs text-zinc-500">Count selected activities toward one weekly goal.</p></div>
          <button type="button" role="switch" aria-checked={settings.combinedEnabled}
            onClick={() => setSettings({ ...settings, combinedEnabled: !settings.combinedEnabled })}
            className={switchClass(settings.combinedEnabled)}><span className={`m-0.5 h-5 w-5 rounded-full bg-white transition-transform dark:bg-zinc-900 ${settings.combinedEnabled ? "translate-x-5" : ""}`} /></button>
        </div>
        {settings.combinedEnabled && <>
          <label className="mt-4 block text-xs text-zinc-500">Weekly combined target
            <input type="number" min="1" step="1" value={settings.combinedTarget}
              onChange={(event) => setSettings({ ...settings, combinedTarget: Number(event.target.value) })}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50" />
          </label>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {WEEKLY_TARGET_CATEGORIES.map(({ id, label }) => <label key={id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.combinedCategories.includes(id)}
                onChange={(event) => toggleCategory(id, event.target.checked)} /> {label}
            </label>)}
          </div>
        </>}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Individual targets</h3>
        <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
          {WEEKLY_TARGET_CATEGORIES.map(({ id, label }) => {
            const goal = settings.categoryTargets[id];
            return <div key={id} className="flex flex-wrap items-center gap-3 p-3">
              <button type="button" role="switch" aria-label={`Enable ${label} target`} aria-checked={goal.enabled}
                onClick={() => setSettings({ ...settings, categoryTargets: { ...settings.categoryTargets, [id]: { ...goal, enabled: !goal.enabled } } })}
                className={switchClass(goal.enabled)}><span className={`m-0.5 h-5 w-5 rounded-full bg-white transition-transform dark:bg-zinc-900 ${goal.enabled ? "translate-x-5" : ""}`} /></button>
              <span className="min-w-44 flex-1 text-sm">{label}</span>
              <label className="flex items-center gap-2 text-xs text-zinc-500">per week
                <input type="number" min="1" step="1" disabled={!goal.enabled} value={goal.target}
                  onChange={(event) => setSettings({ ...settings, categoryTargets: { ...settings.categoryTargets, [id]: { ...goal, target: Number(event.target.value) } } })}
                  className="w-20 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50" />
              </label>
            </div>;
          })}
        </div>
      </div>
    </div>
    <footer className="border-t border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
      <button type="button" onClick={() => void save()} disabled={saving}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900">{saving ? "Saving…" : "Save weekly targets"}</button>
    </footer>
  </section>;
}
