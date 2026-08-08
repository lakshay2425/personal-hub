"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";

import { FEATURE_STATUSES } from "../constants";
import { useProjectFeatures } from "../hooks/useProjectFeatures";
import type {
  CreateFeatureInput,
  FeatureStatus,
  ProjectFeature,
  UpdateFeatureInput,
} from "../types";
import { FeatureFormModal } from "./FeatureFormModal";
import { FeaturesTable } from "./FeaturesTable";

interface FeaturesWorkspaceProps {
  projectId: string;
  title: string;
  description: string;
  addButtonLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  embedded?: boolean;
}

export function FeaturesWorkspace({
  projectId,
  title,
  description,
  addButtonLabel = "Add Feature",
  emptyTitle = "No features yet. Add your first one.",
  emptyDescription = "Track product features by version and status.",
  embedded = false,
}: FeaturesWorkspaceProps) {
  const {
    features,
    versions,
    isLoading,
    error,
    addFeature,
    editFeature,
    removeFeature,
    createVersion,
  } = useProjectFeatures(projectId);

  const [search, setSearch] = useState("");
  const [versionFilter, setVersionFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<FeatureStatus | "">("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<ProjectFeature | null>(
    null,
  );
  const [deletingFeature, setDeletingFeature] = useState<ProjectFeature | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    let result = [...features];

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((feature) =>
        feature.title.toLowerCase().includes(lower),
      );
    }

    if (versionFilter === "unassigned") {
      result = result.filter((feature) => feature.versionId === null);
    } else if (versionFilter) {
      const versionId = Number(versionFilter);
      result = result.filter((feature) => feature.versionId === versionId);
    }

    if (statusFilter) {
      result = result.filter((feature) => feature.status === statusFilter);
    }

    return result;
  }, [features, search, versionFilter, statusFilter]);

  const hasActiveFilter = Boolean(
    search.trim() || versionFilter || statusFilter,
  );

  const openCreateForm = () => {
    setEditingFeature(null);
    setIsFormOpen(true);
  };

  const handleEdit = (feature: ProjectFeature) => {
    setEditingFeature(feature);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFeature(null);
  };

  const handleSubmit = async (
    input: CreateFeatureInput | UpdateFeatureInput,
    previousStatus?: FeatureStatus,
  ) => {
    try {
      if (editingFeature?.id) {
        await editFeature(editingFeature.id, input, previousStatus);
        toast.success("Feature updated");
      } else {
        await addFeature(input as CreateFeatureInput);
        toast.success("Feature created");
      }
    } catch {
      toast.error(
        editingFeature ? "Failed to update feature" : "Failed to create feature",
      );
      throw new Error("Feature save failed");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingFeature?.id) return;

    setIsDeleting(true);
    try {
      await removeFeature(deletingFeature.id);
      toast.success("Feature deleted");
      setDeletingFeature(null);
    } catch {
      toast.error("Failed to delete feature");
    } finally {
      setIsDeleting(false);
    }
  };

  const filterBar = (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by title..."
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:max-w-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
      />
      <select
        value={versionFilter}
        onChange={(event) => setVersionFilter(event.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:w-auto dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      >
        <option value="">All versions</option>
        <option value="unassigned">Unassigned</option>
        {versions.map((version) => (
          <option key={version.id} value={String(version.id)}>
            {version.name}
          </option>
        ))}
      </select>
      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(event.target.value as FeatureStatus | "")
        }
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:w-auto dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      >
        <option value="">All statuses</option>
        {FEATURE_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );

  const content = (() => {
    if (isLoading) {
      return <LoadingState message="Loading features..." />;
    }

    if (error) {
      return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
    }

    if (features.length === 0) {
      return (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      );
    }

    if (filtered.length === 0 && hasActiveFilter) {
      return (
        <>
          {filterBar}
          <EmptyState
            title="No matching features"
            description="Try adjusting your search or filters."
          />
        </>
      );
    }

    return (
      <>
        {filterBar}
        <FeaturesTable
          features={filtered}
          versions={versions}
          onEdit={handleEdit}
          onDelete={setDeletingFeature}
        />
      </>
    );
  })();

  return (
    <>
      {embedded ? (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={openCreateForm}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {addButtonLabel}
          </button>
        </div>
      ) : (
        <PageHeader
          title={title}
          description={description}
          action={
            <button
              type="button"
              onClick={openCreateForm}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {addButtonLabel}
            </button>
          }
        />
      )}

      {content}

      <FeatureFormModal
        key={isFormOpen ? (editingFeature?.id ?? "new") : "closed"}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        projectId={projectId}
        versions={versions}
        onSubmit={handleSubmit}
        onCreateVersion={createVersion}
        feature={editingFeature}
      />

      <ConfirmDialog
        isOpen={deletingFeature !== null}
        onClose={() => setDeletingFeature(null)}
        onConfirm={handleConfirmDelete}
        title="Delete feature"
        message={`Are you sure you want to delete "${deletingFeature?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
}
