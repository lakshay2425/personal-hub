"use client";

import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

import { Modal } from "@/components/ui/Modal";
import { getTodayDateString } from "../lib/dateUtils";
import { validateOutreachDate } from "../lib/followUpScheduling";
import type { Lead } from "../types";

interface OutreachQueueActionsProps {
  leads: Lead[];
  companyNames: Map<number | undefined, string>;
  scheduleLeads: (ids: number[], date: string) => Promise<void>;
}

async function saveSchedule(
  scheduleLeads: OutreachQueueActionsProps["scheduleLeads"],
  ids: number[],
  date: string,
): Promise<boolean> {
  const validationError = validateOutreachDate(date);
  if (validationError) {
    toast.error(validationError);
    return false;
  }
  try {
    await scheduleLeads(ids, date);
    return true;
  } catch {
    toast.error("Could not update the outreach date");
    return false;
  }
}

export function OutreachLeadDateEditor({
  lead,
  scheduleLeads,
}: {
  lead: Lead;
  scheduleLeads: OutreachQueueActionsProps["scheduleLeads"];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(lead.nextFollowUpDate ?? "");

  const save = async () => {
    if (!lead.id || !(await saveSchedule(scheduleLeads, [lead.id], date))) return;
    setIsEditing(false);
    toast.success("Outreach date updated");
  };

  return (
    <div className="shrink-0">
      <button type="button" onClick={() => { setDate(lead.nextFollowUpDate ?? ""); setIsEditing(true); }} className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
        Change date
      </button>
      {isEditing ? (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Outreach date<input type="date" min={getTodayDateString()} value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50" /></label>
          <button type="button" disabled={!date} onClick={() => void save()} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900">Save</button>
          <button type="button" onClick={() => setIsEditing(false)} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600">Cancel</button>
        </div>
      ) : null}
    </div>
  );
}

export function BulkOutreachModal({
  isOpen,
  onClose,
  leads,
  companyNames,
  scheduleLeads,
}: OutreachQueueActionsProps & { isOpen: boolean; onClose: () => void }) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(() => new Set());
  const [date, setDate] = useState(getTodayDateString());
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const visibleLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => !query || [lead.name, lead.role, companyNames.get(lead.companyId) ?? ""].join(" ").toLowerCase().includes(query));
  }, [companyNames, leads, search]);

  const toggle = (id: number) => setSelectedLeadIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedLeadIds.size === 0) {
      toast.error("Select at least one lead");
      return;
    }
    const count = selectedLeadIds.size;
    setIsSaving(true);
    const saved = await saveSchedule(scheduleLeads, [...selectedLeadIds], date);
    setIsSaving(false);
    if (!saved) return;
    setSelectedLeadIds(new Set());
    setSearch("");
    onClose();
    toast.success(`${count} lead${count === 1 ? "" : "s"} added to outreach`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add leads to outreach" size="md">
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Reach out on<input type="date" min={getTodayDateString()} value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50" required /></label>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search leads" className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50" />
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
          {visibleLeads.length === 0 ? <p className="p-3 text-sm text-zinc-500">No leads found.</p> : visibleLeads.map((lead) => <label key={lead.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"><input type="checkbox" checked={selectedLeadIds.has(lead.id!)} onChange={() => toggle(lead.id!)} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600" /><span className="min-w-0 flex-1"><span className="block font-medium text-zinc-900 dark:text-zinc-50">{lead.name}</span><span className="block truncate text-xs text-zinc-500">{companyNames.get(lead.companyId) ?? "Unknown company"}{lead.role ? ` · ${lead.role}` : ""}</span></span>{lead.nextFollowUpDate ? <span className="text-xs text-zinc-500">{lead.nextFollowUpDate}</span> : null}</label>)}
        </div>
        <div className="flex items-center justify-between gap-3"><span className="text-sm text-zinc-500">{selectedLeadIds.size} selected</span><div className="flex gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600">Cancel</button><button type="submit" disabled={isSaving || selectedLeadIds.size === 0} className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900">{isSaving ? "Saving..." : "Add to outreach"}</button></div></div>
      </form>
    </Modal>
  );
}
