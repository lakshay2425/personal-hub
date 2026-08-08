"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { TemplateFormModal } from "@/features/job-search/components/forms/TemplateFormModal";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { TemplateCards } from "@/features/job-search/components/TemplateCards";
import { TemplateTypePills } from "@/features/job-search/components/TemplateTypePills";
import { useTemplates } from "@/features/job-search/hooks/useTemplates";
import type { Template, TemplateType } from "@/features/job-search/types";

export default function TemplatesPage() {
  const { templates, isLoading, addTemplate, editTemplate, removeTemplate } =
    useTemplates();

  const [typeFilter, setTypeFilter] = useState<TemplateType | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return templates;
    return templates.filter((template) => template.type === typeFilter);
  }, [templates, typeFilter]);

  const openCreateForm = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (
    data: Omit<Template, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      if (editingTemplate?.id) {
        await editTemplate(editingTemplate.id, data);
        toast.success("Template updated");
      } else {
        await addTemplate(data);
        toast.success("Template added");
      }
    } catch {
      toast.error("Failed to save template");
      throw new Error("save failed");
    }
  };

  const handleCopy = async (template: Template) => {
    try {
      await navigator.clipboard.writeText(template.body);
      toast.success("Template copied. Customize before sending.");
    } catch {
      toast.error("Failed to copy template");
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate?.id) return;
    setIsDeleting(true);
    try {
      await removeTemplate(deletingTemplate.id);
      toast.success("Template deleted");
      setDeletingTemplate(null);
    } catch {
      toast.error("Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading templates..." />;

  return (
    <div>
      <PageHeader
        title="Templates"
        description="Reusable outreach messages for cold emails, LinkedIn, X, and follow-ups."
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add Template
          </button>
        }
      />

      <div className="mt-6">
        <TemplateTypePills value={typeFilter} onChange={setTypeFilter} />
      </div>

      <div className="mt-6">
        {templates.length === 0 ? (
          <EmptyState
            title="No templates yet"
            description="Add your first outreach template."
            action={
              <button
                type="button"
                onClick={openCreateForm}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Add Template
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No templates match this filter"
            description="Try a different type or add a new template."
            action={
              <button
                type="button"
                onClick={openCreateForm}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Add Template
              </button>
            }
          />
        ) : (
          <TemplateCards
            templates={filtered}
            onCopy={handleCopy}
            onEdit={(template) => {
              setEditingTemplate(template);
              setIsFormOpen(true);
            }}
            onDelete={setDeletingTemplate}
          />
        )}
      </div>

      <TemplateFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTemplate(null);
        }}
        onSubmit={handleSubmit}
        template={editingTemplate}
      />

      <ConfirmDialog
        isOpen={deletingTemplate !== null}
        onClose={() => setDeletingTemplate(null)}
        onConfirm={handleDelete}
        title="Delete template"
        message={`Are you sure you want to delete "${deletingTemplate?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        isLoading={isDeleting}
      />
    </div>
  );
}
