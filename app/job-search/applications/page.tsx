"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { ApplicationFormModal } from "@/features/job-search/components/forms/ApplicationFormModal";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { StatusBadge } from "@/features/job-search/components/StatusBadge";
import { APPLICATION_STATUSES } from "@/features/job-search/constants";
import { useApplications } from "@/features/job-search/hooks/useApplications";
import { useCompanies } from "@/features/job-search/hooks/useCompanies";
import { formatDate } from "@/features/job-search/lib/dateUtils";
import type { Application } from "@/features/job-search/types";

export default function ApplicationsPage() {
  const { companies } = useCompanies();
  const { applications, isLoading, addApplication, editApplication, removeApplication } =
    useApplications();

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [portalFilter, setPortalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.companyName])),
    [companies],
  );

  const portals = useMemo(() => {
    const set = new Set(applications.map((a) => a.portal).filter(Boolean));
    return Array.from(set).sort();
  }, [applications]);

  const filtered = useMemo(() => {
    let result = [...applications];
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((a) => a.role.toLowerCase().includes(lower));
    }
    if (companyFilter) {
      result = result.filter((a) => a.companyId === Number(companyFilter));
    }
    if (portalFilter) {
      result = result.filter((a) => a.portal === portalFilter);
    }
    if (statusFilter) {
      result = result.filter((a) => a.status === statusFilter);
    }
    return result;
  }, [applications, search, companyFilter, portalFilter, statusFilter]);

  const handleSubmit = async (data: Omit<Application, "id" | "createdAt">) => {
    try {
      if (editingApp?.id) {
        await editApplication(editingApp.id, data);
        toast.success("Application updated");
      } else {
        await addApplication(data);
        toast.success("Application added");
      }
    } catch {
      toast.error("Failed to save application");
      throw new Error("save failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingApp?.id) return;
    setIsDeleting(true);
    try {
      await removeApplication(deletingApp.id);
      toast.success("Application deleted");
      setDeletingApp(null);
    } catch {
      toast.error("Failed to delete application");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading applications..." />;

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Track your job applications"
        action={
          <button
            type="button"
            onClick={() => {
              setEditingApp(null);
              setIsFormOpen(true);
            }}
            disabled={companies.length === 0}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add Application
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by role..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:min-w-[200px] sm:flex-1 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName}</option>
          ))}
        </select>
        <select
          value={portalFilter}
          onChange={(e) => setPortalFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Portals</option>
          {portals.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No applications found"
          description="Track your job applications here."
          action={
            companies.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
              >
                Add Application
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Company</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Role</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Portal</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Applied Date</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                    {companyMap.get(app.companyId) ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{app.role}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{app.portal || "—"}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatDate(app.appliedDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingApp(app);
                          setIsFormOpen(true);
                        }}
                        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingApp(app)}
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

      <ApplicationFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingApp(null);
        }}
        onSubmit={handleSubmit}
        application={editingApp}
        companies={companies}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingApp)}
        onClose={() => setDeletingApp(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        message="Are you sure you want to delete this application?"
      />
    </div>
  );
}
