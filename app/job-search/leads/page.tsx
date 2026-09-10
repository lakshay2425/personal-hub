"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CompanyFilterCombobox } from "@/features/job-search/components/CompanyFilterCombobox";
import { CompanyInfoModal } from "@/features/job-search/components/CompanyInfoModal";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LeadDetailModal } from "@/features/job-search/components/LeadDetailModal";
import { LeadListRow } from "@/features/job-search/components/LeadListRow";
import { LeadTouchpointCard } from "@/features/job-search/components/LeadTouchpointCard";
import { ConfirmFollowUpModal } from "@/features/job-search/components/forms/ConfirmFollowUpModal";
import { LeadFormModal } from "@/features/job-search/components/forms/LeadFormModal";
import {
  LeadTouchpointFormModal,
  type LeadTouchpointFormMode,
} from "@/features/job-search/components/forms/LeadTouchpointFormModal";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { StatsCard } from "@/features/job-search/components/StatsCard";
import { WeekFilter } from "@/features/job-search/components/WeekFilter";
import {
  DEFAULT_LEAD_CHANNEL,
  DEFAULT_NEW_LEAD_STATUS,
  LEAD_CHANNELS,
} from "@/features/job-search/constants";
import { useCompanies } from "@/features/job-search/hooks/useCompanies";
import { useLeadListSettings } from "@/features/job-search/hooks/useLeadListSettings";
import { useLeadTouchpoints } from "@/features/job-search/hooks/useLeadTouchpoints";
import { useLeads } from "@/features/job-search/hooks/useLeads";
import { useTemplates } from "@/features/job-search/hooks/useTemplates";
import {
  formatWeekRange,
  getCurrentWeekStart,
  isTimestampInWeek,
} from "@/features/job-search/lib/dateUtils";
import {
  filterTouchpointsByWeek,
  groupLeadsByCompany,
  leadCreatedInWeek,
  leadHasAnyTouchpoint,
  type LeadsViewMode,
} from "@/features/job-search/lib/leadListUtils";
import { buildTemplateMap } from "@/features/job-search/lib/templateUtils";
import {
  countTouchpointsInWeek,
  leadHasTouchpointInWeek,
  matchesLeadTouchpointQuery,
} from "@/features/job-search/repositories/leadTouchpointsRepository";
import type {
  Company,
  Lead,
  LeadTouchpoint,
  LeadWithTouchpoints,
} from "@/features/job-search/types";

type DeleteTarget =
  | { type: "lead"; lead: LeadWithTouchpoints }
  | { type: "touchpoint"; touchpoint: LeadTouchpoint; lead: LeadWithTouchpoints };

const VIEW_OPTIONS: { value: LeadsViewMode; label: string }[] = [
  { value: "allLeads", label: "All leads" },
  { value: "byTouchpoint", label: "By touchpoint" },
];

export default function LeadsPage() {
  const { companies, addCompany } = useCompanies();
  const { addLead, editLead, removeLead } = useLeads();
  const {
    leadsWithTouchpoints,
    isLoading,
    refresh,
    appendTouchpoint,
    editTouchpoint,
    removeTouchpoint,
    confirmFollowUp,
  } = useLeadTouchpoints();
  const { templates } = useTemplates();
  const { settings: listSettings } = useLeadListSettings();

  const templateMap = useMemo(
    () => buildTemplateMap(templates),
    [templates],
  );

  const [viewMode, setViewMode] = useState<LeadsViewMode>("allLeads");
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [groupByCompany, setGroupByCompany] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [touchpointChannelFilter, setTouchpointChannelFilter] = useState("");
  const [weekFilter, setWeekFilter] = useState<string | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<LeadWithTouchpoints | null>(
    null,
  );
  const [touchpointFormMode, setTouchpointFormMode] =
    useState<LeadTouchpointFormMode | null>(null);
  const [activeLead, setActiveLead] = useState<LeadWithTouchpoints | null>(
    null,
  );
  const [editingTouchpoint, setEditingTouchpoint] =
    useState<LeadTouchpoint | null>(null);
  const [confirmFollowUpLead, setConfirmFollowUpLead] =
    useState<LeadWithTouchpoints | null>(null);
  const [confirmFollowUpWhich, setConfirmFollowUpWhich] = useState<1 | 2>(1);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const companyById = useMemo(
    () => new Map(companies.map((company) => [company.id!, company])),
    [companies],
  );

  const currentWeekStart = getCurrentWeekStart();

  const outreachThisWeek = useMemo(
    () => countTouchpointsInWeek(leadsWithTouchpoints, currentWeekStart),
    [leadsWithTouchpoints, currentWeekStart],
  );

  const filtered = useMemo(() => {
    let result = leadsWithTouchpoints;

    if (search) {
      result = result.filter((lead) => matchesLeadTouchpointQuery(lead, search));
    }
    if (companyFilter) {
      result = result.filter(
        (lead) => lead.companyId === Number(companyFilter),
      );
    }
    if (statusFilter) {
      result = result.filter((lead) => lead.status === statusFilter);
    }
    if (channelFilter) {
      result = result.filter((lead) => lead.channel === channelFilter);
    }

    if (viewMode === "allLeads") {
      if (weekFilter) {
        result = result.filter((lead) => leadCreatedInWeek(lead, weekFilter));
      }
    } else {
      if (weekFilter === null) {
        result = result.filter((lead) => leadHasAnyTouchpoint(lead));
      } else {
        result = result.filter((lead) =>
          leadHasTouchpointInWeek(lead, weekFilter),
        );
      }

      if (touchpointChannelFilter) {
        result = result.filter((lead) =>
          lead.touchpoints.some(
            (touchpoint) =>
              touchpoint.channel === touchpointChannelFilter &&
              (!weekFilter ||
                isTimestampInWeek(touchpoint.occurredAt, weekFilter)),
          ),
        );
      }
    }

    return result;
  }, [
    leadsWithTouchpoints,
    search,
    companyFilter,
    statusFilter,
    channelFilter,
    touchpointChannelFilter,
    weekFilter,
    viewMode,
  ]);

  const groupedLeads = useMemo(() => {
    if (!groupByCompany) return null;
    return groupLeadsByCompany(filtered, companyById);
  }, [filtered, groupByCompany, companyById]);

  const openLeadDetail = (lead: LeadWithTouchpoints) => {
    setDetailLead(lead);
  };

  const getLeadActions = (lead: LeadWithTouchpoints) => ({
    onEditLead: () => {
      setDetailLead(null);
      setEditingLead(lead);
      setIsLeadFormOpen(true);
    },
    onDeleteLead: () => setDeleteTarget({ type: "lead", lead }),
    onAddTouchpoint: () => {
      setDetailLead(null);
      setActiveLead(lead);
      setEditingTouchpoint(null);
      setTouchpointFormMode("addTouchpoint");
    },
    onConfirmFollowUp1: lead.firstFollowUpDate
      ? () => {
          setDetailLead(null);
          setConfirmFollowUpLead(lead);
          setConfirmFollowUpWhich(1);
        }
      : undefined,
    onConfirmFollowUp2: lead.secondFollowUpDate
      ? () => {
          setDetailLead(null);
          setConfirmFollowUpLead(lead);
          setConfirmFollowUpWhich(2);
        }
      : undefined,
    onEditTouchpoint: (touchpoint: LeadTouchpoint) => {
      setDetailLead(null);
      setActiveLead(lead);
      setEditingTouchpoint(touchpoint);
      setTouchpointFormMode("editTouchpoint");
    },
    onDeleteTouchpoint: (touchpoint: LeadTouchpoint) =>
      setDeleteTarget({ type: "touchpoint", touchpoint, lead }),
  });

  const renderAllLeadsList = (leads: LeadWithTouchpoints[]) => (
    <div className="space-y-2">
      {leads.map((lead) => (
        <LeadListRow
          key={lead.id}
          lead={lead}
          company={companyById.get(lead.companyId)}
          onClick={() => openLeadDetail(lead)}
        />
      ))}
    </div>
  );

  const renderTouchpointCards = (leads: LeadWithTouchpoints[]) => (
    <div className="space-y-4">
      {leads.map((lead) => (
        <LeadTouchpointCard
          key={lead.id}
          lead={lead}
          company={companyById.get(lead.companyId)}
          templateMap={templateMap}
          visibleTouchpoints={
            weekFilter
              ? filterTouchpointsByWeek(lead.touchpoints, weekFilter)
              : undefined
          }
          onViewCompany={setViewingCompany}
          {...getLeadActions(lead)}
        />
      ))}
    </div>
  );

  const renderLeadList = () => {
    if (groupedLeads) {
      return (
        <div className="space-y-6">
          {groupedLeads.map((group) => (
            <section key={group.companyId}>
              <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {group.companyName}
                <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                  ({group.leads.length})
                </span>
              </h3>
              {viewMode === "allLeads"
                ? renderAllLeadsList(group.leads)
                : renderTouchpointCards(group.leads)}
            </section>
          ))}
        </div>
      );
    }

    return viewMode === "allLeads"
      ? renderAllLeadsList(filtered)
      : renderTouchpointCards(filtered);
  };

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

  const handleLeadSubmit = async (data: Omit<Lead, "id" | "createdAt">) => {
    try {
      if (editingLead?.id) {
        await editLead(editingLead.id, data);
        await refresh();
        toast.success("Lead updated");
      } else {
        await addLead({
          ...data,
          status: data.status || DEFAULT_NEW_LEAD_STATUS,
        });
        await refresh();
        toast.success("Lead added");
      }
    } catch {
      toast.error("Failed to save lead");
      throw new Error("save failed");
    }
  };

  const handleTouchpointSubmit = async (
    data: Parameters<typeof appendTouchpoint>[1],
  ) => {
    try {
      if (touchpointFormMode === "editTouchpoint" && editingTouchpoint?.id) {
        await editTouchpoint(editingTouchpoint.id, data);
        toast.success("Touchpoint updated");
        return;
      }

      if (!activeLead) {
        throw new Error("No active lead");
      }

      await appendTouchpoint(activeLead.id, data);
      toast.success("Touchpoint added");
    } catch {
      toast.error("Failed to save touchpoint");
      throw new Error("save failed");
    }
  };

  const handleConfirmFollowUp = async (context: string) => {
    if (!confirmFollowUpLead) return;

    try {
      await confirmFollowUp(confirmFollowUpLead.id, confirmFollowUpWhich, {
        context,
      });
      toast.success(`Follow-up ${confirmFollowUpWhich} confirmed`);
    } catch {
      toast.error("Failed to confirm follow-up");
      throw new Error("confirm failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      if (deleteTarget.type === "lead") {
        await removeLead(deleteTarget.lead.id);
        await refresh();
        setDetailLead(null);
        toast.success("Lead deleted");
      } else {
        await removeTouchpoint(deleteTarget.touchpoint.id!);
        toast.success("Touchpoint deleted");
      }
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const detailLeadData = detailLead
    ? leadsWithTouchpoints.find((lead) => lead.id === detailLead.id) ??
      detailLead
    : null;

  if (isLoading || !listSettings) {
    return <LoadingState message="Loading leads..." />;
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Track contacts and outreach touchpoints at target companies"
        action={
          <button
            type="button"
            onClick={() => {
              setEditingLead(null);
              setIsLeadFormOpen(true);
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Total Touchpoints" value={outreachThisWeek.total} />
          <StatsCard label="LinkedIn" value={outreachThisWeek.linkedIn} />
          <StatsCard label="X" value={outreachThisWeek.x} />
          <StatsCard label="Email" value={outreachThisWeek.email} />
        </div>
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setViewMode(option.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              viewMode === option.value
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <WeekFilter
        label={viewMode === "allLeads" ? "Added week" : "Touchpoint week"}
        weekStart={weekFilter}
        onWeekChange={setWeekFilter}
        count={filtered.length}
        allOptionLabel={
          viewMode === "byTouchpoint" ? "Any touchpoint" : "All weeks"
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search leads and touchpoints..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:min-w-[200px] sm:flex-1 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <CompanyFilterCombobox
          value={companyFilter}
          onChange={setCompanyFilter}
          companies={companies}
        />
        <label className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={groupByCompany}
            onChange={(event) => setGroupByCompany(event.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-600"
          />
          Group by company
        </label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Statuses</option>
          {listSettings.leadStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={channelFilter}
          onChange={(event) => setChannelFilter(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[140px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="">All Lead Channels</option>
          {LEAD_CHANNELS.map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </select>
        {viewMode === "byTouchpoint" ? (
          <select
            value={touchpointChannelFilter}
            onChange={(event) =>
              setTouchpointChannelFilter(event.target.value)
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[160px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="">All Touchpoint Channels</option>
            {LEAD_CHANNELS.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No leads found"
          description={
            viewMode === "allLeads"
              ? "Add a lead to start building your network."
              : "No leads match the selected touchpoint filters."
          }
          action={
            viewMode === "allLeads" ? (
              <button
                type="button"
                onClick={() => setIsLeadFormOpen(true)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
              >
                Add Lead
              </button>
            ) : undefined
          }
        />
      ) : (
        renderLeadList()
      )}

      <LeadDetailModal
        isOpen={detailLeadData !== null}
        onClose={() => setDetailLead(null)}
        lead={detailLeadData}
        company={
          detailLeadData
            ? companyById.get(detailLeadData.companyId)
            : undefined
        }
        templateMap={templateMap}
        onViewCompany={setViewingCompany}
        {...(detailLeadData ? getLeadActions(detailLeadData) : {
          onEditLead: () => {},
          onDeleteLead: () => {},
          onAddTouchpoint: () => {},
          onEditTouchpoint: () => {},
          onDeleteTouchpoint: () => {},
        })}
      />

      <LeadFormModal
        isOpen={isLeadFormOpen}
        onClose={() => {
          setIsLeadFormOpen(false);
          setEditingLead(null);
        }}
        onSubmit={handleLeadSubmit}
        lead={editingLead}
        companies={companies}
        templates={templates}
        defaultChannel={DEFAULT_LEAD_CHANNEL}
        leadStatusOptions={listSettings.leadStatuses}
        onCreateCompany={handleCreateCompany}
      />

      <LeadTouchpointFormModal
        isOpen={touchpointFormMode !== null}
        onClose={() => {
          setTouchpointFormMode(null);
          setActiveLead(null);
          setEditingTouchpoint(null);
        }}
        mode={touchpointFormMode ?? "addTouchpoint"}
        touchpoint={editingTouchpoint}
        defaultChannel={activeLead?.channel ?? DEFAULT_LEAD_CHANNEL}
        templates={templates}
        touchpointStatusOptions={listSettings.touchpointStatuses}
        touchpointTypeOptions={listSettings.touchpointTypes}
        onSubmit={handleTouchpointSubmit}
      />

      <ConfirmFollowUpModal
        isOpen={confirmFollowUpLead !== null}
        onClose={() => setConfirmFollowUpLead(null)}
        lead={confirmFollowUpLead}
        which={confirmFollowUpWhich}
        templateMap={templateMap}
        onConfirm={handleConfirmFollowUp}
      />

      <CompanyInfoModal
        isOpen={viewingCompany !== null}
        onClose={() => setViewingCompany(null)}
        company={viewingCompany}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        message={
          deleteTarget?.type === "lead"
            ? "Are you sure you want to delete this lead and all touchpoints?"
            : "Are you sure you want to delete this touchpoint?"
        }
      />
    </div>
  );
}
