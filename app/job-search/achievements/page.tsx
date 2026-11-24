"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { AchievementCards } from "@/features/job-search/components/AchievementCards";
import { AchievementFormModal } from "@/features/job-search/components/forms/AchievementFormModal";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { useAchievements } from "@/features/job-search/hooks/useAchievements";
import type { Achievement } from "@/features/job-search/types";

export default function AchievementsPage() {
  const { achievements, isLoading, addAchievement, editAchievement, removeAchievement } = useAchievements();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deletingAchievement, setDeletingAchievement] = useState<Achievement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAchievements = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return achievements;
    return achievements.filter((achievement) =>
      [achievement.title, achievement.conciseVersion, achievement.detailedVersion]
        .some((value) => value.toLocaleLowerCase().includes(query)),
    );
  }, [achievements, search]);

  const openCreateForm = () => {
    setEditingAchievement(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (
    data: Omit<Achievement, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      if (editingAchievement?.id) {
        await editAchievement(editingAchievement.id, data);
        toast.success("Achievement updated");
      } else {
        await addAchievement(data);
        toast.success("Achievement added");
      }
    } catch {
      toast.error("Failed to save achievement");
      throw new Error("save failed");
    }
  };

  const handleCopy = async (achievement: Achievement, version: "concise" | "detailed") => {
    const message = version === "concise" ? achievement.conciseVersion : achievement.detailedVersion;
    try {
      await navigator.clipboard.writeText(message);
      toast.success(`${version === "concise" ? "Concise" : "Detailed"} achievement copied`);
    } catch {
      toast.error("Failed to copy achievement");
    }
  };

  const handleDelete = async () => {
    if (!deletingAchievement?.id) return;
    setIsDeleting(true);
    try {
      await removeAchievement(deletingAchievement.id);
      toast.success("Achievement deleted");
      setDeletingAchievement(null);
    } catch {
      toast.error("Failed to delete achievement");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading achievements..." />;

  return (
    <div>
      <PageHeader
        title="Achievements"
        description="Save work achievements with concise and detailed versions to reuse in your messages."
        action={(
          <button
            type="button"
            onClick={openCreateForm}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add Achievement
          </button>
        )}
      />

      {achievements.length > 0 ? (
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title or message..."
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:max-w-md dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
      ) : null}

      <div className="mt-6">
        {achievements.length === 0 ? (
          <EmptyState
            title="No achievements yet"
            description="Save an achievement once, then copy its concise or detailed version whenever you need it."
            action={(
              <button
                type="button"
                onClick={openCreateForm}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Add Achievement
              </button>
            )}
          />
        ) : filteredAchievements.length === 0 ? (
          <EmptyState
            title="No achievements match your search"
            description="Try a different search."
          />
        ) : (
          <AchievementCards
            achievements={filteredAchievements}
            onCopy={(achievement, version) => void handleCopy(achievement, version)}
            onEdit={(achievement) => {
              setEditingAchievement(achievement);
              setIsFormOpen(true);
            }}
            onDelete={setDeletingAchievement}
          />
        )}
      </div>

      <AchievementFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAchievement(null);
        }}
        onSubmit={handleSubmit}
        achievement={editingAchievement}
      />

      <ConfirmDialog
        isOpen={deletingAchievement !== null}
        onClose={() => setDeletingAchievement(null)}
        onConfirm={handleDelete}
        title="Delete achievement"
        message={`Are you sure you want to delete "${deletingAchievement?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        isLoading={isDeleting}
      />
    </div>
  );
}
