"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { ColdEmailFormModal } from "@/features/job-search/components/forms/ColdEmailFormModal";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import {
  MobileCardActions,
  MobileCardHeader,
  MobileCardMeta,
  MobileCardMetaRow,
  MobileList,
  MobileListItem,
  mobileActionClass,
} from "@/features/job-search/components/MobileListCard";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { StatusBadge } from "@/features/job-search/components/StatusBadge";
import { COLD_EMAIL_STATUSES } from "@/features/job-search/constants";
import { useColdEmails } from "@/features/job-search/hooks/useColdEmails";
import { useCompanies } from "@/features/job-search/hooks/useCompanies";
import { useLeads } from "@/features/job-search/hooks/useLeads";
import { formatDate } from "@/features/job-search/lib/dateUtils";
import type { ColdEmail } from "@/features/job-search/types";

export default function ColdEmailsPage() {
  const { companies } = useCompanies();
  const { leads } = useLeads();
  const { coldEmails, isLoading, addColdEmail, editColdEmail, removeColdEmail } =
    useColdEmails();

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<ColdEmail | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<ColdEmail | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.companyName])),
    [companies],
  );
  const leadMap = useMemo(
    () => new Map(leads.map((l) => [l.id, l.name])),
    [leads],
  );

  const filtered = useMemo(() => {
    let result = [...coldEmails];
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((e) => {
        const companyName =
          companyMap.get(e.companyId)?.toLowerCase() ?? "";
        const leadName = leadMap.get(e.leadId)?.toLowerCase() ?? "";
        return companyName.includes(lower) || leadName.includes(lower);
      });
    }
    if (companyFilter) {
      result = result.filter((e) => e.companyId === Number(companyFilter));
    }
    if (statusFilter) {
      result = result.filter((e) => e.status === statusFilter);
    }
    return result;
  }, [coldEmails, search, companyFilter, statusFilter, companyMap, leadMap]);

  const handleSubmit = async (data: Omit<ColdEmail, "id" | "createdAt">) => {
    try {
      if (editingEmail?.id) {
        await editColdEmail(editingEmail.id, data);
        toast.success("Cold email updated");
      } else {
        await addColdEmail(data);
        toast.success("Cold email added");
      }
    } catch {
      toast.error("Failed to save cold email");
      throw new Error("save failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingEmail?.id) return;
    setIsDeleting(true);
    try {
      await removeColdEmail(deletingEmail.id);
      toast.success("Cold email deleted");
      setDeletingEmail(null);
    } catch {
      toast.error("Failed to delete cold email");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading cold emails..." />;

  return (
    <div>
      <PageHeader
        title="Cold Emails"
        description="Track your outreach emails"
        action={
          <button
            type="button"
            onClick={() => {
              setEditingEmail(null);
              setIsFormOpen(true);
            }}
            disabled={companies.length === 0 || leads.length === 0}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add Cold Email
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company or lead..."
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Statuses</option>
          {COLD_EMAIL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No cold emails found"
          description="Track your outreach emails here."
          action={
            companies.length > 0 && leads.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
              >
                Add Cold Email
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <MobileList>
            {filtered.map((email) => (
              <MobileListItem key={email.id}>
                <MobileCardHeader
                  title={leadMap.get(email.leadId) ?? "—"}
                  subtitle={companyMap.get(email.companyId) ?? "—"}
                  badge={<StatusBadge status={email.status} />}
                />
                <MobileCardMeta>
                  {email.role ? (
                    <MobileCardMetaRow label="Role" value={email.role} />
                  ) : null}
                  <MobileCardMetaRow
                    label="Sent"
                    value={formatDate(email.sentDate)}
                  />
                  <MobileCardMetaRow
                    label="Follow-up 1"
                    value={formatDate(email.firstFollowUpDate)}
                  />
                  <MobileCardMetaRow
                    label="Follow-up 2"
                    value={formatDate(email.secondFollowUpDate)}
                  />
                </MobileCardMeta>
                <MobileCardActions>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmail(email);
                      setIsFormOpen(true);
                    }}
                    className={mobileActionClass.edit}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingEmail(email)}
                    className={mobileActionClass.delete}
                  >
                    Delete
                  </button>
                </MobileCardActions>
              </MobileListItem>
            ))}
          </MobileList>
          <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 lg:block dark:border-zinc-800">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Company</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Lead Name</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Role</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Sent Date</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Follow-up 1</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Follow-up 2</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((email) => (
                <tr key={email.id}>
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                    {companyMap.get(email.companyId) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {leadMap.get(email.leadId) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{email.role || "—"}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatDate(email.sentDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={email.status} /></td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatDate(email.firstFollowUpDate)}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatDate(email.secondFollowUpDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmail(email);
                          setIsFormOpen(true);
                        }}
                        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingEmail(email)}
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
        </>
      )}

      <ColdEmailFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmail(null);
        }}
        onSubmit={handleSubmit}
        coldEmail={editingEmail}
        companies={companies}
        leads={leads}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingEmail)}
        onClose={() => setDeletingEmail(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        message="Are you sure you want to delete this cold email?"
      />
    </div>
  );
}
