"use client";

import type { ContentIdea } from "../../types";
import {
  format,
  getMonthGridDays,
  isSameMonth,
  isToday,
  toDateString,
  WEEKDAY_LABELS,
  WEEKDAY_LABELS_SHORT,
} from "../../lib/calendarDateUtils";
import { StatusDot } from "./StatusDot";

interface CalendarMonthViewProps {
  referenceDate: Date;
  ideasByDate: Map<string, ContentIdea[]>;
  onDayClick: (date: string) => void;
  onIdeaClick: (idea: ContentIdea) => void;
}

const MAX_VISIBLE_IDEAS = 2;

export function CalendarMonthView({
  referenceDate,
  ideasByDate,
  onDayClick,
  onIdeaClick,
}: CalendarMonthViewProps) {
  const days = getMonthGridDays(referenceDate);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className="px-1 py-2 text-center text-xs font-medium text-zinc-500 sm:px-2 dark:text-zinc-400"
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{WEEKDAY_LABELS_SHORT[index]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateStr = toDateString(day);
          const dayIdeas = ideasByDate.get(dateStr) ?? [];
          const isCurrentMonth = isSameMonth(day, referenceDate);
          const isCurrentDay = isToday(day);
          const hasContent = dayIdeas.length > 0;
          const visibleIdeas = dayIdeas.slice(0, MAX_VISIBLE_IDEAS);
          const overflowCount = dayIdeas.length - MAX_VISIBLE_IDEAS;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDayClick(dateStr)}
              className={`group relative min-h-[4.5rem] border-b border-r border-zinc-100 p-1 text-left transition-colors hover:bg-zinc-50 sm:min-h-[6.5rem] sm:p-1.5 dark:border-zinc-800 dark:hover:bg-zinc-800/50 ${
                !isCurrentMonth ? "bg-zinc-50/50 dark:bg-zinc-950/30" : ""
              } ${isCurrentDay ? "ring-2 ring-inset ring-zinc-900 dark:ring-zinc-100" : ""}`}
              aria-label={`${format(day, "MMMM d, yyyy")}${hasContent ? `, ${dayIdeas.length} scheduled` : ""}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:h-7 sm:w-7 sm:text-sm ${
                    isCurrentDay
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : isCurrentMonth
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {hasContent ? (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 sm:hidden dark:bg-zinc-500"
                    aria-hidden="true"
                  />
                ) : null}
              </div>

              <div className="mt-0.5 hidden space-y-0.5 sm:block">
                {visibleIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onIdeaClick(idea);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        onIdeaClick(idea);
                      }
                    }}
                    className="flex min-w-0 items-center gap-1 rounded px-1 py-0.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <StatusDot status={idea.status} />
                    <span className="truncate">{idea.title}</span>
                  </div>
                ))}
                {overflowCount > 0 ? (
                  <p className="px-1 text-xs text-zinc-500 dark:text-zinc-400">
                    +{overflowCount} more
                  </p>
                ) : null}
              </div>

              {hasContent ? (
                <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                  {dayIdeas.slice(0, 3).map((idea) => (
                    <StatusDot key={idea.id} status={idea.status} />
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
