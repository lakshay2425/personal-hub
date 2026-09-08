"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";

import { NetworkPersonCard } from "@/features/people/components/NetworkPersonCard";
import { NetworkPersonFormModal } from "@/features/people/components/forms/NetworkPersonFormModal";
import { RELATIONSHIP_TYPES } from "@/features/people/constants";
import { useNetworkPeople } from "@/features/people/hooks/useNetworkPeople";
import { matchesNetworkQuery } from "@/features/people/lib/networkUtils";
import type {
  NetworkPerson,
  NetworkPersonInput,
  RelationshipType,
} from "@/features/people/types";

export default function NetworkPeoplePage() {
  const { people, isLoading, addPerson, editPerson, removePerson } =
    useNetworkPeople();

  const [search, setSearch] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState<
    RelationshipType | "all"
  >("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<NetworkPerson | null>(
    null,
  );
  const [personToDelete, setPersonToDelete] = useState<NetworkPerson | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    return people.filter((person) => {
      if (
        relationshipFilter !== "all" &&
        person.relationshipType !== relationshipFilter
      ) {
        return false;
      }
      if (search && !matchesNetworkQuery(person, search)) {
        return false;
      }
      return true;
    });
  }, [people, search, relationshipFilter]);

  const openAddForm = () => {
    setEditingPerson(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: NetworkPersonInput) => {
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
    return <LoadingState message="Loading your network..." />;
  }

  return (
    <div>
      <PageHeader
        title="Network"
        description="Keep people you know and the context for how you know them."
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

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRelationshipFilter("all")}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            relationshipFilter === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          All
        </button>
        {RELATIONSHIP_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setRelationshipFilter(type)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              relationshipFilter === type
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, how you know them, or notes..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:max-w-md dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No people in your network"
          description="Add people you already know and how you know them so you can look that up later."
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
            <NetworkPersonCard
              key={person.id}
              person={person}
              onEdit={() => {
                setEditingPerson(person);
                setIsFormOpen(true);
              }}
              onDelete={() => setPersonToDelete(person)}
            />
          ))}
        </div>
      )}

      <NetworkPersonFormModal
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
        message={`Delete ${personToDelete?.name ?? "this person"} from Network? This cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
