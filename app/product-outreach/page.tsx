"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ContactLabelFormModal } from "@/features/job-search/components/forms/ContactLabelFormModal";
import {
  ProductOutreachFormModal,
  type ProductOutreachFormMode,
} from "@/features/job-search/components/forms/ProductOutreachFormModal";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { ProductOutreachContactCard } from "@/features/job-search/components/ProductOutreachContactCard";
import { WeekFilter } from "@/features/job-search/components/WeekFilter";
import { useProductOutreach } from "@/features/job-search/hooks/useProductOutreach";
import { getCurrentWeekStart } from "@/features/job-search/lib/dateUtils";
import {
  contactHasInteractionInWeek,
  matchesProductOutreachQuery,
} from "@/features/job-search/repositories/productOutreachRepository";
import type {
  ProductOutreachContactWithInteractions,
  ProductOutreachInteraction,
} from "@/features/job-search/types";

type DeleteTarget =
  | { type: "contact"; contact: ProductOutreachContactWithInteractions }
  | { type: "interaction"; interaction: ProductOutreachInteraction };

export default function ProductOutreachPage() {
  const {
    contacts,
    isLoading,
    addContact,
    appendInteraction,
    editInteraction,
    removeInteraction,
    removeContact,
    editContactLabel,
  } = useProductOutreach();

  const [search, setSearch] = useState("");
  const [weekFilter, setWeekFilter] = useState<string | null>(
    getCurrentWeekStart(),
  );
  const [formMode, setFormMode] = useState<ProductOutreachFormMode | null>(
    null,
  );
  const [activeContact, setActiveContact] =
    useState<ProductOutreachContactWithInteractions | null>(null);
  const [editingInteraction, setEditingInteraction] =
    useState<ProductOutreachInteraction | null>(null);
  const [labelContact, setLabelContact] =
    useState<ProductOutreachContactWithInteractions | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    let result = contacts;

    if (search) {
      result = result.filter((contact) =>
        matchesProductOutreachQuery(contact, search),
      );
    }

    if (weekFilter) {
      result = result.filter((contact) =>
        contactHasInteractionInWeek(contact, weekFilter),
      );
    }

    return result;
  }, [contacts, search, weekFilter]);

  const handleSubmitNewContact = async (
    label: string,
    interaction: Parameters<typeof addContact>[1],
  ) => {
    try {
      await addContact(label, interaction);
      toast.success("Contact added");
    } catch {
      toast.error("Failed to add contact");
      throw new Error("save failed");
    }
  };

  const handleSubmitInteraction = async (
    interaction: Parameters<typeof appendInteraction>[1],
  ) => {
    try {
      if (formMode === "editInteraction" && editingInteraction?.id) {
        await editInteraction(editingInteraction.id, interaction);
        toast.success("Interaction updated");
        return;
      }

      if (!activeContact) {
        throw new Error("No active contact");
      }

      await appendInteraction(activeContact.id, interaction);
      toast.success("Interaction added");
    } catch {
      toast.error("Failed to save interaction");
      throw new Error("save failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      if (deleteTarget.type === "contact") {
        await removeContact(deleteTarget.contact.id);
        toast.success("Contact deleted");
      } else if (deleteTarget.interaction.id) {
        await removeInteraction(deleteTarget.interaction.id);
        toast.success("Interaction deleted");
      }
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeForm = () => {
    setFormMode(null);
    setActiveContact(null);
    setEditingInteraction(null);
  };

  if (isLoading) {
    return <LoadingState message="Loading product outreach..." />;
  }

  return (
    <div>
      <PageHeader
        title="Product Outreach"
        description="Track cross-platform outreach with a timeline of interactions per contact"
        action={
          <button
            type="button"
            onClick={() => {
              setFormMode("newContact");
              setActiveContact(null);
              setEditingInteraction(null);
            }}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add Contact
          </button>
        }
      />

      <WeekFilter
        label="Interaction week"
        weekStart={weekFilter}
        onWeekChange={setWeekFilter}
        count={filtered.length}
      />

      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by label, handle, or context..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:max-w-md dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No product outreach contacts found"
          description="Add a contact to start logging cross-platform outreach interactions."
          action={
            <button
              type="button"
              onClick={() => setFormMode("newContact")}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              Add Contact
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((contact) => (
            <ProductOutreachContactCard
              key={contact.id}
              contact={contact}
              onEditLabel={() => setLabelContact(contact)}
              onAddInteraction={() => {
                setActiveContact(contact);
                setEditingInteraction(null);
                setFormMode("addInteraction");
              }}
              onDeleteContact={() =>
                setDeleteTarget({ type: "contact", contact })
              }
              onEditInteraction={(interaction) => {
                setActiveContact(contact);
                setEditingInteraction(interaction);
                setFormMode("editInteraction");
              }}
              onDeleteInteraction={(interaction) =>
                setDeleteTarget({ type: "interaction", interaction })
              }
            />
          ))}
        </div>
      )}

      <ProductOutreachFormModal
        isOpen={formMode !== null}
        onClose={closeForm}
        mode={formMode ?? "newContact"}
        interaction={editingInteraction}
        contactLabel={activeContact?.label}
        onSubmitNewContact={handleSubmitNewContact}
        onSubmitInteraction={handleSubmitInteraction}
      />

      <ContactLabelFormModal
        isOpen={labelContact !== null}
        onClose={() => setLabelContact(null)}
        initialLabel={labelContact?.label ?? ""}
        onSubmit={async (label) => {
          if (!labelContact) return;
          try {
            await editContactLabel(labelContact.id, label);
            toast.success("Label updated");
          } catch {
            toast.error("Failed to update label");
            throw new Error("label update failed");
          }
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        message={
          deleteTarget?.type === "contact"
            ? "Delete this contact and all interactions?"
            : "Delete this interaction?"
        }
      />
    </div>
  );
}
