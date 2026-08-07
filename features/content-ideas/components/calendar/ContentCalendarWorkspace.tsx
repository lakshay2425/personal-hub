"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";

import { useCalendarViewMode } from "../../hooks/useCalendarViewMode";
import { useContentCalendar } from "../../hooks/useContentCalendar";
import {
  addMonths,
  addWeeks,
  format,
  subMonths,
  subWeeks,
} from "../../lib/calendarDateUtils";
import type { ContentIdea } from "../../types";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarViewToggle } from "./CalendarViewToggle";
import { CalendarWeekView } from "./CalendarWeekView";
import { ContentIdeaDetailModal } from "./ContentIdeaDetailModal";
import { DayIdeasModal } from "./DayIdeasModal";
import { ScheduleIdeaModal } from "./ScheduleIdeaModal";
import { StatusDot } from "./StatusDot";

export function ContentCalendarWorkspace() {
  const {
    ideas,
    projectMap,
    isLoading,
    error,
    scheduleIdea,
    unscheduleIdea,
    editIdea,
  } = useContentCalendar();
  const { viewMode, setViewMode } = useCalendarViewMode();

  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const scheduledIdeas = useMemo(
    () => ideas.filter((idea) => idea.scheduledDate !== null),
    [ideas],
  );

  const ideasByDate = useMemo(() => {
    const map = new Map<string, ContentIdea[]>();

    for (const idea of scheduledIdeas) {
      if (!idea.scheduledDate) continue;
      const existing = map.get(idea.scheduledDate) ?? [];
      existing.push(idea);
      map.set(idea.scheduledDate, existing);
    }

    for (const [, dayIdeas] of map) {
      dayIdeas.sort((a, b) => a.title.localeCompare(b.title));
    }

    return map;
  }, [scheduledIdeas]);

  const dayIdeas = selectedDate ? ideasByDate.get(selectedDate) ?? [] : [];

  const headerLabel =
    viewMode === "month"
      ? format(referenceDate, "MMMM yyyy")
      : `Week of ${format(referenceDate, "MMM d, yyyy")}`;

  const goToToday = () => setReferenceDate(new Date());

  const goPrevious = () => {
    setReferenceDate((current) =>
      viewMode === "month" ? subMonths(current, 1) : subWeeks(current, 1),
    );
  };

  const goNext = () => {
    setReferenceDate((current) =>
      viewMode === "month" ? addMonths(current, 1) : addWeeks(current, 1),
    );
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setIsDayModalOpen(true);
  };

  const handleIdeaClick = (idea: ContentIdea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);
    setIsDayModalOpen(false);
  };

  const handleScheduleClick = () => {
    setIsDayModalOpen(false);
    setIsScheduleModalOpen(true);
  };

  const handleSchedule = async (ideaId: number, date: string) => {
    try {
      await scheduleIdea(ideaId, date);
      toast.success("Content idea scheduled");
    } catch {
      toast.error("Failed to schedule content idea");
      throw new Error("schedule failed");
    }
  };

  const handleUnschedule = async (id: number) => {
    try {
      await unscheduleIdea(id);
      toast.success("Removed from calendar");
    } catch {
      toast.error("Failed to remove from calendar");
      throw new Error("unschedule failed");
    }
  };

  const handleEdit = async (
    id: number,
    input: Parameters<typeof editIdea>[1],
    previousStatus?: Parameters<typeof editIdea>[2],
  ) => {
    try {
      await editIdea(id, input, previousStatus);
      toast.success("Content idea updated");
      setSelectedIdea((current) =>
        current?.id === id
          ? {
              ...current,
              ...input,
              title: input.title.trim(),
              notes: input.notes.trim(),
              scheduledDate: input.scheduledDate ?? null,
            }
          : current,
      );
    } catch {
      toast.error("Failed to update content idea");
      throw new Error("edit failed");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading calendar…" />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
        {error}
      </div>
    );
  }

  const hasScheduledContent = scheduledIdeas.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Calendar"
        description="Plan when to publish content. Scheduling is local only — post manually when ready."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CalendarViewToggle viewMode={viewMode} onChange={setViewMode} />

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            onClick={goPrevious}
            aria-label="Previous"
            className="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="min-w-0 flex-1 text-center sm:flex-none">
            <h2 className="truncate text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-50">
              {headerLabel}
            </h2>
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Today
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <StatusDot status="Draft" /> Draft
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot status="Ready" /> Ready
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot status="Published" /> Published
        </span>
      </div>

      {!hasScheduledContent ? (
        <EmptyState
          title="No content planned"
          description="No content planned. Click any date to schedule an idea."
        />
      ) : null}

      {viewMode === "month" ? (
        <CalendarMonthView
          referenceDate={referenceDate}
          ideasByDate={ideasByDate}
          onDayClick={handleDayClick}
          onIdeaClick={handleIdeaClick}
        />
      ) : (
        <CalendarWeekView
          referenceDate={referenceDate}
          ideasByDate={ideasByDate}
          projectMap={projectMap}
          onDayClick={handleDayClick}
          onIdeaClick={handleIdeaClick}
        />
      )}

      <DayIdeasModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        date={selectedDate}
        ideas={dayIdeas}
        projectMap={projectMap}
        onIdeaClick={handleIdeaClick}
        onScheduleClick={handleScheduleClick}
      />

      <ScheduleIdeaModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        date={selectedDate}
        ideas={ideas}
        projectMap={projectMap}
        onSchedule={handleSchedule}
      />

      <ContentIdeaDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedIdea(null);
        }}
        idea={selectedIdea}
        project={
          selectedIdea?.projectId
            ? projectMap.get(selectedIdea.projectId) ?? null
            : null
        }
        onEdit={handleEdit}
        onUnschedule={handleUnschedule}
      />
    </div>
  );
}
