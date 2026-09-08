"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { WeekFilter } from "@/features/job-search/components/WeekFilter";
import { getCurrentWeekStart } from "@/features/job-search/lib/dateUtils";

import { DiscoverPersonCard } from "@/features/people/components/DiscoverPersonCard";
import { DiscoverPersonFormModal } from "@/features/people/components/forms/DiscoverPersonFormModal";
import { DISCOVER_STATUSES } from "@/features/people/constants";
import { useDiscoverPeople } from "@/features/people/hooks/useDiscoverPeople";
import {
  isDiscoverPersonInWeek,
  matchesDiscoverQuery,
} from "@/features/people/lib/discoverUtils";
import type {
  DiscoverPerson,
  DiscoverPersonInput,
  DiscoverStatus,
} from "@/features/people/types";

export default function DiscoverPeoplePage() {
  const {
    people,
    isLoading,
    addPerson,
    editPerson,
    changeStatus,
    removePerson,
  } = useDiscoverPeople();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DiscoverStatus | "all">(
    "all",
  );
  const [weekFilter, setWeekFilter] = useState<string | null>(
    getCurrentWeekStart(),
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<DiscoverPerson | null>(
    null,
  );
  const [personToDelete, setPersonToDelete] = useState<DiscoverPerson | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    return people.filter((person) => {
      if (statusFilter !== "all" && person.status !== statusFilter) {
        return false;
      }
      if (search && !matchesDiscoverQuery(person, search)) {
        return false;
      }
      if (weekFilter && !isDiscoverPersonInWeek(person, weekFilter)) {
        return false;
      }
      return true;
    });
  }, [people, search, statusFilter, weekFilter]);

  const openAddForm = () => {
    setEditingPerson(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: DiscoverPersonInput) => {
    try {
      if (editingPerson?.id) {
        await editPerson(editingPerson.id, data);
        toast.success("Person updated");
        return;
      }

      await addPerson(data);
      toast.success("Person added");
    } catch {
      toast.error("Failed to save person");
      throw new Error("save failed");
    }
  };

  const handleStatusChange = async (person: DiscoverPerson, status: DiscoverStatus) => {
    if (!person.id || person.status === status) return;

    try {
      await changeStatus(person.id, status);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!personToDelete?.id) return;

    setIsDeleting(true);
    try {
      await removePerson(personToDelete.id);
      toast.success("Person deleted");
      setPersonToDelete(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading people to review..." />;
  }

  return (
    <div>
      <PageHeader
        title="Discover"
        description="Save people you find on social platforms and review their profiles when you have time."
        action={
          <button
            type="button"
            onClick={openAddForm}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add person
          </button>
        }
      />

      <WeekFilter
        label="Added week"
        weekStart={weekFilter}
        onWeekChange={setWeekFilter}
        count={filtered.length}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          All
        </button>
        {DISCOVER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, why saved, notes, or URL..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:max-w-md dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No people to review"
          description="Add someone you found on LinkedIn or another platform and decide later whether to follow them."
          action={
            <button
              type="button"
              onClick={openAddForm}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              Add person
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((person) => (
            <DiscoverPersonCard
              key={person.id}
              person={person}
              onEdit={() => {
                setEditingPerson(person);
                setIsFormOpen(true);
              }}
              onDelete={() => setPersonToDelete(person)}
              onStatusChange={(status) => handleStatusChange(person, status)}
            />
          ))}
        </div>
      )}

      <DiscoverPersonFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPerson(null);
        }}
        person={editingPerson}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(personToDelete)}
        onClose={() => setPersonToDelete(null)}
        onConfirm={handleDelete}
        title="Delete person"
        message={`Delete ${personToDelete?.name ?? "this person"} from Discover? This cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
