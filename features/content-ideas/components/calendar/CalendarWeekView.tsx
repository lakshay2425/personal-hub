"use client";

import type { Project } from "@/features/questions/types";

import type { ContentIdea } from "../../types";
import {
  format,
  getWeekDays,
  isToday,
  toDateString,
  WEEKDAY_LABELS,
  WEEKDAY_LABELS_SHORT,
} from "../../lib/calendarDateUtils";
import { StatusBadge } from "../StatusBadge";
import { StatusDot } from "./StatusDot";

interface CalendarWeekViewProps {
  referenceDate: Date;
  ideasByDate: Map<string, ContentIdea[]>;
  projectMap: Map<string, Project>;
  onDayClick: (date: string) => void;
  onIdeaClick: (idea: ContentIdea) => void;
}

export function CalendarWeekView({
  referenceDate,
  ideasByDate,
  projectMap,
  onDayClick,
  onIdeaClick,
}: CalendarWeekViewProps) {
  const days = getWeekDays(referenceDate);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid min-w-[640px] grid-cols-7">
        {days.map((day, index) => {
          const dateStr = toDateString(day);
          const dayIdeas = ideasByDate.get(dateStr) ?? [];
          const isCurrentDay = isToday(day);

          return (
            <div
              key={dateStr}
              className={`flex min-h-[12rem] flex-col border-r border-zinc-200 last:border-r-0 dark:border-zinc-800 ${
                isCurrentDay ? "bg-zinc-50 dark:bg-zinc-800/30" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => onDayClick(dateStr)}
                className={`flex flex-col items-center gap-0.5 border-b border-zinc-200 px-2 py-2 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 ${
                  isCurrentDay ? "bg-zinc-100 dark:bg-zinc-800/50" : ""
                }`}
              >
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <span className="hidden sm:inline">{WEEKDAY_LABELS[index]}</span>
                  <span className="sm:hidden">{WEEKDAY_LABELS_SHORT[index]}</span>
                </span>
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    isCurrentDay
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-900 dark:text-zinc-50"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayIdeas.length > 0 ? (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {dayIdeas.length} {dayIdeas.length === 1 ? "idea" : "ideas"}
                  </span>
                ) : null}
              </button>

              <div className="flex-1 space-y-1.5 p-1.5 sm:p-2">
                {dayIdeas.length === 0 ? (
                  <p className="px-1 py-2 text-center text-xs text-zinc-400 dark:text-zinc-600">
                    —
                  </p>
                ) : (
                  dayIdeas.map((idea) => {
                    const project = idea.projectId
                      ? projectMap.get(idea.projectId)
                      : null;

                    return (
                      <button
                        key={idea.id}
                        type="button"
                        onClick={() => onIdeaClick(idea)}
                        className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                      >
                        <div className="flex items-start gap-1.5">
                          <StatusDot status={idea.status} className="mt-1.5" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-zinc-900 sm:text-sm dark:text-zinc-50">
                              {idea.title}
                            </p>
                            {project ? (
                              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                                {project.name}
                              </p>
                            ) : (
                              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                                Standalone
                              </p>
                            )}
                            <div className="mt-1.5 hidden sm:block">
                              <StatusBadge status={idea.status} />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
