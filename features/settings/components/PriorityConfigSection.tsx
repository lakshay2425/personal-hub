"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import {
  deletePriority,
  getPriorities,
  renamePriority,
  savePriorities,
} from "../lib/prioritiesRepository";
import {
  PRESET_COLORS,
  PRIORITY_SLOT_COUNT,
  type PriorityArea,
} from "../types";

interface SlotState {
  name: string;
  color: string;
  originalName: string | null;
}

function slotsToState(
  slots: (PriorityArea | null)[],
): SlotState[] {
  return Array.from({ length: PRIORITY_SLOT_COUNT }, (_, index) => {
    const slot = slots[index] ?? null;
    return {
      name: slot?.name ?? "",
      color: slot?.color ?? PRESET_COLORS[index % PRESET_COLORS.length],
      originalName: slot?.name ?? null,
    };
  });
}

function stateToSlots(state: SlotState[]): (PriorityArea | null)[] {
  return state.map((slot) => {
    if (!slot.name.trim()) {
      return null;
    }
    return { name: slot.name.trim(), color: slot.color };
  });
}

export function PriorityConfigSection() {
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    index: number;
    name: string;
  } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      try {
        const settings = await getPriorities();
        if (!cancelled) {
          setSlots(slotsToState(settings.slots));
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load priorities");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const updateSlot = (index: number, patch: Partial<SlotState>) => {
    setSlots((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...patch } : slot,
      ),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const slot of slots) {
        if (
          slot.originalName &&
          slot.name.trim() &&
          slot.originalName !== slot.name.trim()
        ) {
          await renamePriority(slot.originalName, slot.name.trim());
        }
      }

      const saved = await savePriorities(stateToSlots(slots));
      setSlots(slotsToState(saved.slots));
      toast.success("Priorities saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save priorities",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deletePriority(deleteTarget.name);
      reload();
      toast.success(`"${deleteTarget.name}" removed; items moved to Unassigned`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete priority",
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  return (
    <>
      <div className="max-w-xl rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Priority Configuration
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Define up to 4 priority areas. Tasks and log entries can be tagged
            with these categories.
          </p>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          {slots.map((slot, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 sm:flex-row sm:items-center dark:border-zinc-700"
            >
              <div className="flex-1">
                <label
                  htmlFor={`priority-name-${index}`}
                  className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
                >
                  Priority {index + 1}
                </label>
                <input
                  id={`priority-name-${index}`}
                  type="text"
                  value={slot.name}
                  onChange={(event) =>
                    updateSlot(index, { name: event.target.value })
                  }
                  placeholder="Empty slot"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Color
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateSlot(index, { color })}
                      className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        slot.color === color
                          ? "border-zinc-900 dark:border-zinc-50"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={slot.color}
                    onChange={(event) =>
                      updateSlot(index, { color: event.target.value })
                    }
                    className="h-8 w-8 cursor-pointer rounded border border-zinc-300 dark:border-zinc-600"
                    aria-label="Custom color"
                  />
                </div>
              </div>

              {slot.originalName ? (
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({ index, name: slot.originalName! })
                  }
                  className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSaving ? "Saving…" : "Save Priorities"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Remove priority?"
        message={`All tasks and log entries under "${deleteTarget?.name}" will be moved to Unassigned. This cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
