"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CompanyCard } from "@/features/job-search/components/CompanyCard";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { CompanyFormModal } from "@/features/job-search/components/forms/CompanyFormModal";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { WeekFilter } from "@/features/job-search/components/WeekFilter";
import { useCompanies } from "@/features/job-search/hooks/useCompanies";
import { useJobSearchPreferences } from "@/features/job-search/hooks/useJobSearchPreferences";
import {
  getCurrentWeekStart,
  isTimestampInWeek,
} from "@/features/job-search/lib/dateUtils";
import type { Company, CompanyWithCounts } from "@/features/job-search/types";

type SortField = "companyName" | "createdAt";

export default function CompaniesPage() {
  const { showApplications } = useJobSearchPreferences();
  const {
    companiesWithCounts,
    sectors,
    isLoading,
    addCompany,
    editCompany,
    removeCompany,
  } = useCompanies();

  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [weekFilter, setWeekFilter] = useState<string | null>(getCurrentWeekStart());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] =
    useState<CompanyWithCounts | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    let result = [...companiesWithCounts];
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((c) =>
        c.companyName.toLowerCase().includes(lower),
      );
    }
    if (sectorFilter) {
      result = result.filter((c) => c.sector === sectorFilter);
    }
    if (weekFilter) {
      result = result.filter((c) => isTimestampInWeek(c.createdAt, weekFilter));
    }
    result.sort((a, b) => {
      const cmp =
        sortField === "companyName"
          ? a.companyName.localeCompare(b.companyName)
          : a.createdAt - b.createdAt;
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [companiesWithCounts, search, sectorFilter, weekFilter, sortField, sortAsc]);

  const handleSubmit = async (
    data: Omit<Company, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      if (editingCompany?.id) {
        await editCompany(editingCompany.id, data);
        toast.success("Company updated");
      } else {
        await addCompany(data);
        toast.success("Company added");
      }
    } catch {
      toast.error("Failed to save company");
      throw new Error("save failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingCompany?.id) return;
    setIsDeleting(true);
    try {
      await removeCompany(deletingCompany.id);
      toast.success("Company deleted");
      setDeletingCompany(null);
    } catch {
      toast.error("Failed to delete company");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading companies..." />;

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Manage companies you're targeting"
        action={
          <button
            type="button"
            onClick={() => {
              setEditingCompany(null);
              setIsFormOpen(true);
            }}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add Company
          </button>
        }
      />

      <WeekFilter
        label="Added week"
        weekStart={weekFilter}
        onWeekChange={setWeekFilter}
        count={filtered.length}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:min-w-[200px] sm:flex-1 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="companyName">Sort by Name</option>
          <option value="createdAt">Sort by Created</option>
        </select>
        <button
          type="button"
          onClick={() => setSortAsc(!sortAsc)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm sm:w-auto dark:border-zinc-600 dark:text-zinc-300"
        >
          {sortAsc ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No companies found"
          description="Add a company to start tracking your job search."
          action={
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              Add Company
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              showApplications={showApplications}
              onEdit={() => {
                setEditingCompany(company);
                setIsFormOpen(true);
              }}
              onDelete={() => setDeletingCompany(company)}
            />
          ))}
        </div>
      )}

      <CompanyFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCompany(null);
        }}
        onSubmit={handleSubmit}
        company={editingCompany}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingCompany)}
        onClose={() => setDeletingCompany(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Company"
        message="This will permanently delete the company and all associated leads, touchpoints, and applications. This action cannot be undone."
      />
    </div>
  );
}
