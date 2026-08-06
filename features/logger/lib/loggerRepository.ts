import type { LogEntry } from "../types";
import { getDB } from "./db";

export async function createLogEntry(
  date: string,
  text: string,
): Promise<LogEntry> {
  const db = getDB();
  const now = Date.now();

  const entry: LogEntry = {
    id: crypto.randomUUID(),
    date,
    text,
    createdAt: now,
    updatedAt: now,
  };

  await db.logEntries.add(entry);
  return entry;
}

export async function getAllLogEntries(): Promise<LogEntry[]> {
  const db = getDB();
  const entries = await db.logEntries.toArray();
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateLogEntry(
  id: string,
  date: string,
  text: string,
): Promise<LogEntry> {
  const db = getDB();
  const existing = await db.logEntries.get(id);

  if (!existing) {
    throw new Error("Log entry not found");
  }

  const updated: LogEntry = {
    ...existing,
    date,
    text,
    updatedAt: Date.now(),
  };

  await db.logEntries.put(updated);
  return updated;
}

export async function deleteLogEntry(id: string): Promise<void> {
  const db = getDB();
  await db.logEntries.delete(id);
}
