"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ChannelBadge } from "@/features/job-search/components/ChannelBadge";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LeadFormModal } from "@/features/job-search/components/forms/LeadFormModal";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { OutreachLeadOverflowMenu } from "@/features/job-search/components/OutreachLeadOverflowMenu";
import {
  MobileCardActions,
  MobileCardHeader,
  MobileCardMeta,
  MobileCardMetaRow,
  MobileList,
  MobileListItem,
} from "@/features/job-search/components/MobileListCard";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { StatsCard } from "@/features/job-search/components/StatsCard";
import { StatusBadge } from "@/features/job-search/components/StatusBadge";
import { WeekFilter } from "@/features/job-search/components/WeekFilter";
import {
  DEFAULT_LEAD_CHANNEL,
  LEAD_STATUSES,
  OUTREACH_CHANNELS,
} from "@/features/job-search/constants";
import { useCompanies } from "@/features/job-search/hooks/useCompanies";
import { useLeads } from "@/features/job-search/hooks/useLeads";
import { useTemplates } from "@/features/job-search/hooks/useTemplates";
import {
  formatWeekRange,
  getCurrentWeekStart,
  isTimestampInWeek,
} from "@/features/job-search/lib/dateUtils";
import {
  buildTemplateMap,
  getTemplateTitle,
} from "@/features/job-search/lib/templateUtils";
import type { Lead } from "@/features/job-search/types";

export default function OutreachPage() {
  const { companies, addCompany } = useCompanies();
  const { leads, isLoading, addLead, editLead, removeLead } = useLeads();
  const { templates } = useTemplates();

  const templateMap = useMemo(
    () => buildTemplateMap(templates),
    [templates],
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [weekFilter, setWeekFilter] = useState<string | null>(getCurrentWeekStart());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const companyMap = useMemo(
    () => new Map(companies.map((c) => [c.id, c.companyName])),
    [companies],
  );

  const currentWeekStart = getCurrentWeekStart();

  const outreachThisWeek = useMemo(() => {
    const outreachLeads = leads.filter((l) => OUTREACH_CHANNELS.includes(l.channel));
    const inWeek = outreachLeads.filter((l) =>
      isTimestampInWeek(l.createdAt, currentWeekStart),
    );
    return {
      total: inWeek.length,
      linkedIn: inWeek.filter((l) => l.channel === "LinkedIn").length,
      x: inWeek.filter((l) => l.channel === "X").length,
    };
  }, [leads, currentWeekStart]);

  const filtered = useMemo(() => {
    let result = leads.filter((l) => OUTREACH_CHANNELS.includes(l.channel));
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((l) => l.name.toLowerCase().includes(lower));
    }
    if (statusFilter) {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (channelFilter) {
      result = result.filter((l) => l.channel === channelFilter);
    }
    if (weekFilter) {
      result = result.filter((l) => isTimestampInWeek(l.createdAt, weekFilter));
    }
    return result;
  }, [leads, search, statusFilter, channelFilter, weekFilter]);

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

  if (isLoading) return <LoadingState message="Loading outreach leads..." />;

  return (
    <div>
      <PageHeader
        title="Outreach"
        description="Track LinkedIn and X contacts at target companies"
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

      <section className="mb-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Outreach This Week
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatWeekRange(currentWeekStart)}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard label="Total Outreach" value={outreachThisWeek.total} />
          <StatsCard label="LinkedIn" value={outreachThisWeek.linkedIn} />
          <StatsCard label="X" value={outreachThisWeek.x} />
        </div>
      </section>

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
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Channels</option>
          {OUTREACH_CHANNELS.map((channel) => (
            <option key={channel} value={channel}>
              {channel}
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
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No outreach leads found"
          description="Add a LinkedIn or X contact to start building your network."
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
                  <MobileCardMetaRow
                    label="Outreach Template"
                    value={getTemplateTitle(templateMap, lead.templateId)}
                  />
                  <MobileCardMetaRow
                    label="Follow-up Template"
                    value={getTemplateTitle(
                      templateMap,
                      lead.followUpTemplateId,
                    )}
                  />
                </MobileCardMeta>
                <MobileCardActions>
                  <div className="ml-auto">
                    <OutreachLeadOverflowMenu
                      lead={lead}
                      onEdit={() => {
                        setEditingLead(lead);
                        setIsFormOpen(true);
                      }}
                      onDelete={() => setDeletingLead(lead)}
                    />
                  </div>
                </MobileCardActions>
              </MobileListItem>
            ))}
          </MobileList>
          <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 lg:block dark:border-zinc-800">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Name
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Company
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Role
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Type
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Channel
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Outreach Template
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Follow-up Template
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {companyMap.get(lead.companyId) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {lead.role || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {lead.type || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ChannelBadge channel={lead.channel} />
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {getTemplateTitle(templateMap, lead.templateId)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {getTemplateTitle(templateMap, lead.followUpTemplateId)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3">
                      <OutreachLeadOverflowMenu
                        lead={lead}
                        onEdit={() => {
                          setEditingLead(lead);
                          setIsFormOpen(true);
                        }}
                        onDelete={() => setDeletingLead(lead)}
                      />
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
        templates={templates}
        defaultChannel={DEFAULT_LEAD_CHANNEL}
        channelOptions={OUTREACH_CHANNELS}
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
