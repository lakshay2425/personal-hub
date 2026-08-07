"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LeadFormModal } from "@/features/job-search/components/forms/LeadFormModal";
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
import {
  LEAD_CHANNELS,
  LEAD_STATUSES,
} from "@/features/job-search/constants";
import { useCompanies } from "@/features/job-search/hooks/useCompanies";
import { useLeads } from "@/features/job-search/hooks/useLeads";
import { formatDate } from "@/features/job-search/lib/dateUtils";
import type { Lead } from "@/features/job-search/types";

const CHANNEL_BADGE_CONFIG: Record<
  Lead["channel"],
  { icon: string; className: string }
> = {
  Email: {
    icon: "@",
    className:
      "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700",
  },
  LinkedIn: {
    icon: "in",
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-800",
  },
  X: {
    icon: "X",
    className:
      "bg-black text-white ring-black dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-700",
  },
  Other: {
    icon: "•",
    className:
      "bg-zinc-50 text-zinc-500 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700",
  },
};

function ChannelBadge({ channel }: { channel: Lead["channel"] }) {
  const config = CHANNEL_BADGE_CONFIG[channel];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      <span className="text-[10px] font-bold leading-none">{config.icon}</span>
      {channel}
    </span>
  );
}

export default function LeadsPage() {
  const { companies, addCompany } = useCompanies();
  const { leads, isLoading, addLead, editLead, removeLead } = useLeads();

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [roleTypeFilter, setRoleTypeFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.companyName])),
    [companies],
  );

  const filtered = useMemo(() => {
    let result = [...leads];
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((l) => l.name.toLowerCase().includes(lower));
    }
    if (companyFilter) {
      result = result.filter((l) => l.companyId === Number(companyFilter));
    }
    if (statusFilter) {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (channelFilter) {
      result = result.filter((l) => l.channel === channelFilter);
    }
    if (roleTypeFilter) {
      const lower = roleTypeFilter.toLowerCase();
      result = result.filter(
        (l) =>
          l.role.toLowerCase().includes(lower) ||
          l.type.toLowerCase().includes(lower),
      );
    }
    return result;
  }, [
    leads,
    search,
    companyFilter,
    statusFilter,
    channelFilter,
    roleTypeFilter,
  ]);

  const handleCreateCompany = async (companyName: string) => {
    const company = await addCompany({
      companyName: companyName.trim(),
      sector: "",
      website: "",
      notes: "",
    });
    toast.success("Company created. You can fill in details later.");
    return company;
  };

  const handleSubmit = async (data: Omit<Lead, "id" | "createdAt">) => {
    try {
      if (editingLead?.id) {
        await editLead(editingLead.id, data);
        toast.success("Lead updated");
      } else {
        await addLead(data);
        toast.success("Lead added");
      }
    } catch {
      toast.error("Failed to save lead");
      throw new Error("save failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingLead?.id) return;
    setIsDeleting(true);
    try {
      await removeLead(deletingLead.id);
      toast.success("Lead deleted");
      setDeletingLead(null);
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading leads..." />;

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Track contacts at target companies"
        action={
          <button
            type="button"
            onClick={() => {
              setEditingLead(null);
              setIsFormOpen(true);
            }}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add Lead
          </button>
        }
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
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.companyName}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Channels</option>
          {LEAD_CHANNELS.map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={roleTypeFilter}
          onChange={(e) => setRoleTypeFilter(e.target.value)}
          placeholder="Filter by role/type..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:min-w-[200px] sm:flex-1 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Add a lead to start building your network."
          action={
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              Add Lead
            </button>
          }
        />
      ) : (
        <>
          <MobileList>
            {filtered.map((lead) => (
              <MobileListItem key={lead.id}>
                <MobileCardHeader
                  title={lead.name}
                  subtitle={companyMap.get(lead.companyId) ?? "—"}
                  badge={<StatusBadge status={lead.status} />}
                />
                <MobileCardMeta>
                  {lead.role ? (
                    <MobileCardMetaRow label="Role" value={lead.role} />
                  ) : null}
                  {lead.type ? (
                    <MobileCardMetaRow label="Type" value={lead.type} />
                  ) : null}
                  <MobileCardMetaRow
                    label="Channel"
                    value={<ChannelBadge channel={lead.channel} />}
                  />
                  {lead.channel === "Email" && lead.firstFollowUpDate ? (
                    <MobileCardMetaRow
                      label="Follow-up 1"
                      value={formatDate(lead.firstFollowUpDate)}
                    />
                  ) : null}
                  {lead.channel === "Email" && lead.secondFollowUpDate ? (
                    <MobileCardMetaRow
                      label="Follow-up 2"
                      value={formatDate(lead.secondFollowUpDate)}
                    />
                  ) : null}
                </MobileCardMeta>
                <MobileCardActions>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLead(lead);
                      setIsFormOpen(true);
                    }}
                    className={mobileActionClass.edit}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingLead(lead)}
                    className={mobileActionClass.delete}
                  >
                    Delete
                  </button>
                </MobileCardActions>
              </MobileListItem>
            ))}
          </MobileList>
          <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 lg:block dark:border-zinc-800">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Company</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Role</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Type</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Channel</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Follow-up 1</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Follow-up 2</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{lead.name}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {companyMap.get(lead.companyId) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{lead.role || "—"}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{lead.type || "—"}</td>
                  <td className="px-4 py-3">
                    <ChannelBadge channel={lead.channel} />
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {lead.channel === "Email"
                      ? formatDate(lead.firstFollowUpDate)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {lead.channel === "Email"
                      ? formatDate(lead.secondFollowUpDate)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLead(lead);
                          setIsFormOpen(true);
                        }}
                        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingLead(lead)}
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

      <LeadFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLead(null);
        }}
        onSubmit={handleSubmit}
        lead={editingLead}
        companies={companies}
        onCreateCompany={handleCreateCompany}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingLead)}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        message="Are you sure you want to delete this lead?"
      />
    </div>
  );
}
