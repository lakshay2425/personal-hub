"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { CompanyFormModal } from "@/features/job-search/components/forms/CompanyFormModal";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { useCompanies } from "@/features/job-search/hooks/useCompanies";
import { formatTimestamp } from "@/features/job-search/lib/dateUtils";
import type { Company, CompanyWithCounts } from "@/features/job-search/types";

type SortField = "companyName" | "createdAt";

export default function CompaniesPage() {
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
    result.sort((a, b) => {
      const cmp =
        sortField === "companyName"
          ? a.companyName.localeCompare(b.companyName)
          : a.createdAt - b.createdAt;
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [companiesWithCounts, search, sectorFilter, sortField, sortAsc]);

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

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
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
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="companyName">Sort by Name</option>
          <option value="createdAt">Sort by Created</option>
        </select>
        <button
          type="button"
          onClick={() => setSortAsc(!sortAsc)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:text-zinc-300"
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
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Company Name
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Sector
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Website
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Leads
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Apps
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Created At
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((company) => (
                <tr key={company.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/job-search/companies/${company.id}`}
                      className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                      {company.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {company.sector || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Link
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {company.leadsCount}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {company.applicationsCount}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {formatTimestamp(company.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCompany(company);
                          setIsFormOpen(true);
                        }}
                        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCompany(company)}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        message="This will permanently delete the company and all associated leads, applications, and cold emails. This action cannot be undone."
      />
    </div>
  );
}
