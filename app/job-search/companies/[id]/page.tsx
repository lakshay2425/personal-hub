"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { CompanyFormModal } from "@/features/job-search/components/forms/CompanyFormModal";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import {
  MobileCardHeader,
  MobileCardMeta,
  MobileCardMetaRow,
  MobileList,
  MobileListItem,
} from "@/features/job-search/components/MobileListCard";
import { StatusBadge } from "@/features/job-search/components/StatusBadge";
import { useCompany, useCompanies } from "@/features/job-search/hooks/useCompanies";
import { useJobSearchPreferences } from "@/features/job-search/hooks/useJobSearchPreferences";
import { formatDate, formatTimestamp } from "@/features/job-search/lib/dateUtils";
import type { Company } from "@/features/job-search/types";

type Tab = "leads" | "applications" | "coldEmails";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { company, leads, applications, coldEmails, isLoading } =
    useCompany(id);
  const { editCompany, removeCompany } = useCompanies();
  const { showApplications } = useJobSearchPreferences();

  const [activeTab, setActiveTab] = useState<Tab>("leads");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!showApplications && activeTab === "applications") {
      setActiveTab("leads");
    }
  }, [showApplications, activeTab]);

  const handleSubmit = async (
    data: Omit<Company, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      await editCompany(id, data);
      toast.success("Company updated");
    } catch {
      toast.error("Failed to update company");
      throw new Error("update failed");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeCompany(id);
      toast.success("Company deleted");
      router.push("/job-search/companies");
    } catch {
      toast.error("Failed to delete company");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading company..." />;

  if (!company) {
    return (
      <EmptyState
        title="Company not found"
        description="This company may have been deleted."
        action={
          <Link
            href="/job-search/companies"
            className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            Back to Companies
          </Link>
        }
      />
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "leads", label: "Leads", count: leads.length },
    ...(showApplications
      ? [
          {
            key: "applications" as const,
            label: "Applications",
            count: applications.length,
          },
        ]
      : []),
    { key: "coldEmails", label: "Cold Emails", count: coldEmails.length },
  ];

  return (
    <div>
      <Link
        href="/job-search/companies"
        className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
      >
        ← Back to Companies
      </Link>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-balance text-zinc-900 sm:text-2xl dark:text-zinc-50">
              {company.companyName}
            </h1>
            {company.sector && (
              <p className="mt-1 text-sm text-zinc-500">{company.sector}</p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block break-all text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {company.website}
              </a>
            )}
            {company.notes && (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                {company.notes}
              </p>
            )}
            <p className="mt-2 text-xs text-zinc-400">
              Created {formatTimestamp(company.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="w-full shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium sm:w-auto dark:border-zinc-600 dark:text-zinc-300"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {activeTab === "leads" && (
        <>
          {leads.length === 0 ? (
            <EmptyState
              title="No leads"
              description="Add leads for this company."
            />
          ) : (
            <>
              <MobileList>
                {leads.map((l) => (
                  <MobileListItem key={l.id}>
                    <MobileCardHeader
                      title={l.name}
                      subtitle={l.role || undefined}
                      badge={<StatusBadge status={l.status} />}
                    />
                    {l.type ? (
                      <MobileCardMeta>
                        <MobileCardMetaRow label="Type" value={l.type} />
                      </MobileCardMeta>
                    ) : null}
                  </MobileListItem>
                ))}
              </MobileList>
              <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 lg:block dark:border-zinc-800">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Role</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Type</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {leads.map((l) => (
                      <tr key={l.id}>
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{l.name}</td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{l.role || "—"}</td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{l.type || "—"}</td>
                        <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {showApplications && activeTab === "applications" && (
        <>
          {applications.length === 0 ? (
            <EmptyState title="No applications" description="No applications for this company yet." />
          ) : (
            <>
              <MobileList>
                {applications.map((a) => (
                  <MobileListItem key={a.id}>
                    <MobileCardHeader
                      title={a.role}
                      subtitle={a.portal || undefined}
                      badge={<StatusBadge status={a.status} />}
                    />
                    <MobileCardMeta>
                      <MobileCardMetaRow
                        label="Applied"
                        value={formatDate(a.appliedDate)}
                      />
                    </MobileCardMeta>
                  </MobileListItem>
                ))}
              </MobileList>
              <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 lg:block dark:border-zinc-800">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Role</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Portal</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Applied</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {applications.map((a) => (
                      <tr key={a.id}>
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{a.role}</td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{a.portal || "—"}</td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatDate(a.appliedDate)}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "coldEmails" && (
        <>
          {coldEmails.length === 0 ? (
            <EmptyState title="No cold emails" description="No cold emails for this company yet." />
          ) : (
            <>
              <MobileList>
                {coldEmails.map((e) => (
                  <MobileListItem key={e.id}>
                    <MobileCardHeader
                      title={leads.find((l) => l.id === e.leadId)?.name ?? "—"}
                      subtitle={e.role || undefined}
                      badge={<StatusBadge status={e.status} />}
                    />
                    <MobileCardMeta>
                      <MobileCardMetaRow
                        label="Sent"
                        value={formatDate(e.sentDate)}
                      />
                    </MobileCardMeta>
                  </MobileListItem>
                ))}
              </MobileList>
              <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 lg:block dark:border-zinc-800">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Lead</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Role</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Sent</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {coldEmails.map((e) => (
                      <tr key={e.id}>
                        <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                          {leads.find((l) => l.id === e.leadId)?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{e.role || "—"}</td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatDate(e.sentDate)}</td>
                        <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 sm:w-auto"
        >
          Delete Company
        </button>
      </div>

      <CompanyFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        company={company}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Company"
        message="This will permanently delete the company and all associated leads, applications, and cold emails."
      />
    </div>
  );
}
