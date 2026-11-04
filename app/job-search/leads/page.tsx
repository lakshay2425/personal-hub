"use client";

import { Suspense, useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CompanyFilterCombobox } from "@/features/job-search/components/CompanyFilterCombobox";
import { CompanyInfoModal } from "@/features/job-search/components/CompanyInfoModal";
import { EmptyState } from "@/features/job-search/components/EmptyState";
import { LeadDetailModal } from "@/features/job-search/components/LeadDetailModal";
import { LeadListRow } from "@/features/job-search/components/LeadListRow";
import { LeadTouchpointCard } from "@/features/job-search/components/LeadTouchpointCard";
import { CompanyOverflowMenu } from "@/features/job-search/components/CompanyOverflowMenu";
import { LeadFormModal } from "@/features/job-search/components/forms/LeadFormModal";
import {
  LeadTouchpointFormModal,
  type LeadTouchpointFormMode,
} from "@/features/job-search/components/forms/LeadTouchpointFormModal";
import { LoadingState } from "@/features/job-search/components/LoadingState";
import { PageHeader } from "@/features/job-search/components/PageHeader";
import { StatsCard } from "@/features/job-search/components/StatsCard";
import { WeekFilter } from "@/features/job-search/components/WeekFilter";
import { WeeklyLeadActivity } from "@/features/job-search/components/WeeklyLeadActivity";
import {
  ACCEPTANCE_RESPONSE_STATUSES,
  DEFAULT_LEAD_CHANNEL,
  DEFAULT_NEW_LEAD_STATUS,
  DEFAULT_TOUCHPOINT_TYPES,
  EMAIL_TOUCHPOINT_TYPES,
  EMAIL_RESPONSE_STATUSES,
  LEAD_CHANNELS,
  LINKEDIN_TOUCHPOINT_TYPES,
  QUICK_TOUCHPOINT_ACTIONS,
  LINKEDIN_RESPONSE_STATUSES,
} from "@/features/job-search/constants";
import type { QuickTouchpointAction } from "@/features/job-search/constants";
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
  type LeadsViewMode,
} from "@/features/job-search/lib/leadListUtils";
import { getLinkedInProfileUrls } from "@/features/job-search/lib/leadProfileUtils";
import {
  applyBulkTouchpointAction,
  canSelectLeadGroup,
  canSelectLeadForBulkTouchpoint,
  getBulkTouchpointEligibility,
  getCommonLeadChannel,
  setLeadGroupSelection,
} from "@/features/job-search/lib/bulkTouchpoints";
import { buildTemplateMap } from "@/features/job-search/lib/templateUtils";
import {
  countTouchpointsInWeek,
  matchesLeadTouchpointQuery,
} from "@/features/job-search/repositories/leadTouchpointsRepository";
import type { LeadInput } from "@/features/job-search/repositories/leadsRepository";
import type {
  Company,
  Lead,
  LeadChannel,
  LeadTouchpoint,
  LeadWithTouchpoints,
} from "@/features/job-search/types";

type DeleteTarget =
  | { type: "lead"; lead: LeadWithTouchpoints }
  | { type: "companyLeads"; companyName: string; leadIds: number[] }
  | { type: "touchpoint"; touchpoint: LeadTouchpoint; lead: LeadWithTouchpoints };

const VIEW_OPTIONS: { value: LeadsViewMode; label: string }[] = [
  { value: "allLeads", label: "All leads" },
  { value: "byTouchpoint", label: "By touchpoint" },
];

export default function LeadsPage() {
  return <Suspense fallback={<LoadingState message="Loading leads..." />}><LeadsPageContent /></Suspense>;
}

function TypeMultiSelect({
  value,
  options,
  onChange,
}: {
  value: string[];
  options: string[];
  onChange: (types: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonLabel = value.length === 0
    ? "All touchpoint types"
    : value.length === 1
      ? value[0]
      : `${value.length} types selected`;

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Filter by touchpoint type"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-left text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
      >
        <span className="truncate">{buttonLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {options.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">
              <input
                type="checkbox"
                checked={value.includes(type)}
                onChange={(event) => onChange(event.target.checked ? [...value, type] : value.filter((selected) => selected !== type))}
                className="rounded border-zinc-300 dark:border-zinc-600"
              />
              {type}
            </label>
          ))}
          {value.length > 0 ? (
            <button type="button" onClick={() => onChange([])} className="mt-1 w-full rounded-md px-2 py-2 text-left text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">Clear type filter</button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LeadsPageContent() {
  const { companies, addCompany } = useCompanies();
  const {
    addLead,
    addLeads,
    editLead,
    removeLead,
    removeLeads,
  } = useLeads();
  const {
    leadsWithTouchpoints,
    isLoading,
    refresh,
    appendTouchpoint,
    appendTouchpoints,
    editTouchpoint,
    editTouchpoints,
    removeTouchpoint,
  } = useLeadTouchpoints();
  const { templates } = useTemplates();
  const { settings: listSettings } = useLeadListSettings();
  const searchParams = useSearchParams();

  const templateMap = useMemo(
    () => buildTemplateMap(templates),
    [templates],
  );

  const [viewMode, setViewMode] = useState<LeadsViewMode>(
    searchParams.get("view") === "byTouchpoint" ? "byTouchpoint" : "allLeads",
  );
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [alumniOnly, setAlumniOnly] = useState(false);
  const [groupByCompany, setGroupByCompany] = useState(false);
  const [touchpointChannelFilter, setTouchpointChannelFilter] = useState(searchParams.get("touchpointChannel") ?? "");
  const [touchpointTypeFilter, setTouchpointTypeFilter] = useState(searchParams.getAll("touchpointType"));
  const [touchpointStatusFilter, setTouchpointStatusFilter] = useState(searchParams.get("touchpointStatus") ?? "");
  const [touchpointResponseFilter, setTouchpointResponseFilter] = useState(searchParams.get("touchpointResponse") ?? "");
  const [weekFilter, setWeekFilter] = useState<string | null>(null);
  const [activityWeekStart, setActivityWeekStart] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [isBulkActionRunning, setIsBulkActionRunning] = useState(false);
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
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const companyById = useMemo(
    () => new Map(companies.map((company) => [company.id!, company])),
    [companies],
  );

  const knownTouchpointTypes = [...DEFAULT_TOUCHPOINT_TYPES, ...EMAIL_TOUCHPOINT_TYPES, ...LINKEDIN_TOUCHPOINT_TYPES];
  const customTouchpointTypes = listSettings?.touchpointTypes.filter((type) => !knownTouchpointTypes.includes(type)) ?? [];
  const touchpointTypeOptions = touchpointChannelFilter === "Email"
    ? [...EMAIL_TOUCHPOINT_TYPES, ...customTouchpointTypes]
    : touchpointChannelFilter === "LinkedIn"
      ? [...LINKEDIN_TOUCHPOINT_TYPES, ...customTouchpointTypes]
      : (listSettings?.touchpointTypes ?? []);
  const customResponseStatuses = listSettings?.responseStatuses.filter((status) =>
    ![...LINKEDIN_RESPONSE_STATUSES, "Positive Response"].includes(status),
  ) ?? [];
  const touchpointResponseOptions = touchpointChannelFilter === "Email"
    ? [...EMAIL_RESPONSE_STATUSES, ...customResponseStatuses]
    : touchpointChannelFilter === "LinkedIn"
      ? [...LINKEDIN_RESPONSE_STATUSES, ...customResponseStatuses]
      : [...new Set([...(listSettings?.responseStatuses ?? []), ...LINKEDIN_RESPONSE_STATUSES])];

  const currentWeekStart = getCurrentWeekStart();

  const outreachThisWeek = useMemo(
    () => countTouchpointsInWeek(leadsWithTouchpoints, currentWeekStart),
    [leadsWithTouchpoints, currentWeekStart],
  );

  const filtered = useMemo(() => {
    let result = leadsWithTouchpoints;

    if (alumniOnly) {
      result = result.filter((lead) => lead.isAlumni === true);
    }
    if (search) {
      result = result.filter((lead) => matchesLeadTouchpointQuery(lead, search));
    }
    if (companyFilter) {
      result = result.filter(
        (lead) => lead.companyId === Number(companyFilter),
      );
    }
    if (viewMode === "allLeads") {
      if (weekFilter) {
        result = result.filter((lead) => leadCreatedInWeek(lead, weekFilter));
      }
    } else {
      result = result.filter((lead) => lead.touchpoints.some((touchpoint) =>
        (!weekFilter || isTimestampInWeek(touchpoint.occurredAt, weekFilter)) &&
        (!touchpointChannelFilter || touchpoint.channel === touchpointChannelFilter) &&
        (touchpointTypeFilter.length === 0 || touchpointTypeFilter.includes(touchpoint.type)) &&
        (!touchpointStatusFilter || touchpoint.status === touchpointStatusFilter) &&
        (!touchpointResponseFilter || touchpoint.responseStatus === touchpointResponseFilter),
      ));
    }

    return result;
  }, [
    leadsWithTouchpoints,
    search,
    companyFilter,
    alumniOnly,
    touchpointChannelFilter,
    touchpointTypeFilter,
    touchpointStatusFilter,
    touchpointResponseFilter,
    weekFilter,
    viewMode,
  ]);

  const groupedLeads = useMemo(() => {
    if (!groupByCompany) return null;
    return groupLeadsByCompany(filtered, companyById);
  }, [filtered, groupByCompany, companyById]);

  const selectedLeads = useMemo(
    () => leadsWithTouchpoints.filter((lead) => selectedLeadIds.has(lead.id)),
    [leadsWithTouchpoints, selectedLeadIds],
  );
  const selectedChannel: LeadChannel | null =
    getCommonLeadChannel(selectedLeads);
  const selectedActions = useMemo(
    () => {
      if (!selectedChannel) return [];
      return (
        QUICK_TOUCHPOINT_ACTIONS[selectedChannel] ??
        []
      );
    },
    [selectedChannel],
  );
  const bulkUpdateEligibility = useMemo(() => {
    const eligibility = new Map<
      string,
      { touchpointIds: number[]; error?: string }
    >();

    for (const action of selectedActions) {
      if (!action.updateType) continue;
      eligibility.set(
        action.id,
        getBulkTouchpointEligibility(action, selectedLeads),
      );
    }

    return eligibility;
  }, [selectedActions, selectedLeads]);

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
    onEditTouchpoint: (touchpoint: LeadTouchpoint) => {
      setDetailLead(null);
      setActiveLead(lead);
      setEditingTouchpoint(touchpoint);
      setTouchpointFormMode("editTouchpoint");
    },
    onDeleteTouchpoint: (touchpoint: LeadTouchpoint) =>
      setDeleteTarget({ type: "touchpoint", touchpoint, lead }),
    onQuickTouchpointAction: async (
      touchpoint: LeadTouchpoint,
      responseStatus: string,
    ) => {
      await editTouchpoint(touchpoint.id!, { responseStatus });
    },
  });

  const renderAllLeadsList = (leads: LeadWithTouchpoints[]) => (
    <div className="space-y-2">
      {leads.map((lead) => {
        const isSelected = selectedLeadIds.has(lead.id);
        const channelMismatch = !canSelectLeadForBulkTouchpoint(
          selectedLeads,
          lead,
        );
        return (
          <div key={lead.id} className="flex items-center gap-3">
            {isSelectionMode ? (
              <input
                type="checkbox"
                aria-label={`Select ${lead.name}`}
                checked={isSelected}
                disabled={channelMismatch}
                onChange={(event) =>
                  setSelectedLeadIds((current) => {
                    const next = new Set(current);
                    if (event.target.checked) next.add(lead.id);
                    else next.delete(lead.id);
                    return next;
                  })
                }
                className="ml-1 h-4 w-4 shrink-0 rounded border-zinc-300 dark:border-zinc-600"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <LeadListRow
                lead={lead}
                company={companyById.get(lead.companyId)}
                onClick={() => openLeadDetail(lead)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTouchpointCards = (leads: LeadWithTouchpoints[]) => (
    <div className="space-y-4">
      {leads.map((lead) => {
        const isSelected = selectedLeadIds.has(lead.id);
        const channelMismatch = !canSelectLeadForBulkTouchpoint(
          selectedLeads,
          lead,
        );
        return (
          <div key={lead.id} className="flex items-start gap-3">
            {isSelectionMode ? (
              <input
                type="checkbox"
                aria-label={`Select ${lead.name}`}
                checked={isSelected}
                disabled={channelMismatch}
                onChange={(event) =>
                  setSelectedLeadIds((current) => {
                    const next = new Set(current);
                    if (event.target.checked) next.add(lead.id);
                    else next.delete(lead.id);
                    return next;
                  })
                }
                className="ml-1 mt-5 h-4 w-4 shrink-0 rounded border-zinc-300 dark:border-zinc-600"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <LeadTouchpointCard
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
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLeadList = () => {
    if (groupedLeads) {
      return (
        <div className="space-y-6">
          {groupedLeads.map((group) => {
            const groupLeadIds = group.leads.map((lead) => lead.id);
            const companyLeads = leadsWithTouchpoints.filter(
              (lead) => lead.companyId === group.companyId,
            );
            const companyLinkedInProfileUrls =
              getLinkedInProfileUrls(companyLeads);
            const selectedCount = groupLeadIds.filter((id) =>
              selectedLeadIds.has(id),
            ).length;
            const isGroupSelected =
              groupLeadIds.length > 0 &&
              selectedCount === groupLeadIds.length;
            const isGroupPartiallySelected =
              selectedCount > 0 && !isGroupSelected;
            const canSelectGroup = canSelectLeadGroup(
              selectedLeads,
              group.leads,
            );

            return (
              <section key={group.companyId}>
                <div className="mb-3 flex items-center gap-2">
                  {isSelectionMode ? (
                    <input
                      type="checkbox"
                      aria-label={`Select all ${group.companyName} leads`}
                      aria-checked={
                        isGroupPartiallySelected ? "mixed" : isGroupSelected
                      }
                      checked={isGroupSelected}
                      disabled={!isGroupSelected && !canSelectGroup}
                      ref={(element) => {
                        if (element) {
                          element.indeterminate = isGroupPartiallySelected;
                        }
                      }}
                      title={
                        canSelectGroup
                          ? `Select all ${group.leads.length} ${group.companyName} leads`
                          : "All leads in a company must use the same channel, matching the current selection."
                      }
                      onChange={(event) =>
                        setSelectedLeadIds((current) =>
                          setLeadGroupSelection(
                            current,
                            groupLeadIds,
                            event.target.checked,
                          ),
                        )
                      }
                      className="h-4 w-4 shrink-0 rounded border-zinc-300 dark:border-zinc-600"
                    />
                  ) : null}
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {group.companyName}
                    <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                      ({group.leads.length})
                    </span>
                  </h3>
                  {companyLeads.length > 0 ? (
                    <CompanyOverflowMenu
                      label={`${group.companyName} lead options`}
                      onDeleteLeads={() =>
                        setDeleteTarget({
                          type: "companyLeads",
                          companyName: group.companyName,
                          leadIds: companyLeads.map((lead) => lead.id),
                        })
                      }
                      onOpenLinkedInProfiles={
                        companyLinkedInProfileUrls.length > 0
                          ? () => {
                              for (const url of companyLinkedInProfileUrls) {
                                window.open(url, "_blank", "noopener,noreferrer");
                              }
                              toast.success(
                                `Requested ${companyLinkedInProfileUrls.length} LinkedIn profile tab${companyLinkedInProfileUrls.length === 1 ? "" : "s"}. Your browser may block some pop-ups.`,
                              );
                            }
                          : undefined
                      }
                      openLinkedInProfilesLabel={`Open LinkedIn profiles (${companyLinkedInProfileUrls.length})`}
                    />
                  ) : null}
                </div>
                {viewMode === "allLeads"
                  ? renderAllLeadsList(group.leads)
                  : renderTouchpointCards(group.leads)}
              </section>
            );
          })}
        </div>
      );
    }

    return viewMode === "allLeads"
      ? renderAllLeadsList(filtered)
      : renderTouchpointCards(filtered);
  };

  const handleCreateCompany = async (companyName: string) => {
    const normalizedName = companyName.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    const existingCompany = companies.find(
      (company) =>
        company.companyName.trim().replace(/\s+/g, " ").toLocaleLowerCase() ===
        normalizedName,
    );
    if (existingCompany) {
      toast.success("Existing company selected.");
      return existingCompany;
    }

    const company = await addCompany({
      companyName: companyName.trim().replace(/\s+/g, " "),
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

  const handleBulkLeadSubmit = async (
    data: LeadInput[],
    options: { allowNameDuplicates: boolean },
  ) => {
    try {
      await addLeads(data, options);
      await refresh();
      toast.success(`Added ${data.length} leads`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save leads",
      );
      throw error;
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

  const handleQuickTouchpointAction = async (
    action:
      | {
          kind: "create";
          input: Parameters<typeof appendTouchpoint>[1];
        }
      | {
          kind: "update";
          touchpointId: number;
          responseStatus: string;
        },
  ) => {
    try {
      if (!activeLead) throw new Error("No active lead");

      if (action.kind === "create") {
        await appendTouchpoint(activeLead.id, action.input, {
          updateLeadStatus: false,
        });
        toast.success("Touchpoint added");
      } else {
        await editTouchpoint(
          action.touchpointId,
          { responseStatus: action.responseStatus },
          { updateLeadStatus: false },
        );
        toast.success("Touchpoint updated");
      }

      setTouchpointFormMode(null);
      setActiveLead(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save touchpoint",
      );
      throw error;
    }
  };

  const handleBulkQuickTouchpointAction = async (
    action: QuickTouchpointAction,
  ) => {
    if (
      isBulkActionRunning ||
      !selectedChannel ||
      selectedLeads.length === 0
    ) return;

    setIsBulkActionRunning(true);
    try {
      await applyBulkTouchpointAction(
        action,
        selectedLeads,
        { appendTouchpoints, editTouchpoints },
      );

      toast.success(
        `${action.label} applied to ${selectedLeads.length} leads`,
      );
      setSelectedLeadIds(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Could not apply the action to all selected leads. Some may already have been updated: ${error.message}`
          : "Could not apply the action to all selected leads. Some may already have been updated.",
      );
    } finally {
      setIsBulkActionRunning(false);
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
      } else if (deleteTarget.type === "companyLeads") {
        await removeLeads(deleteTarget.leadIds);
        await refresh();
        setSelectedLeadIds((current) => {
          const next = new Set(current);
          for (const id of deleteTarget.leadIds) next.delete(id);
          return next;
        });
        toast.success(
          `Deleted ${deleteTarget.leadIds.length} leads for ${deleteTarget.companyName}`,
        );
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

  useEffect(() => {
    const leadId = Number(searchParams.get("leadId"));
    if (!leadId || detailLead || isLoading) return;
    const target = leadsWithTouchpoints.find((lead) => lead.id === leadId);
    if (target) {
      // The dashboard links to a concrete lead and the detail view is intentionally a modal on this page.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetailLead(target);
    }
  }, [detailLead, isLoading, leadsWithTouchpoints, searchParams]);

  if (isLoading || !listSettings) {
    return <LoadingState message="Loading leads..." />;
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Track contacts and outreach touchpoints at target companies"
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (isSelectionMode) setSelectedLeadIds(new Set());
                setIsSelectionMode((enabled) => !enabled);
              }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {isSelectionMode ? "Cancel selection" : "Select leads"}
            </button>
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
          </div>
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

      <WeeklyLeadActivity
        leads={leadsWithTouchpoints}
        weekStart={activityWeekStart ?? currentWeekStart}
        viewMode={viewMode}
        onWeekChange={setActivityWeekStart}
      />

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

      <div className="mb-6 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_minmax(200px,1fr)_auto_auto]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leads and touchpoints..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <CompanyFilterCombobox value={companyFilter} onChange={setCompanyFilter} companies={companies} />
          <label className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={alumniOnly}
              onChange={(event) => setAlumniOnly(event.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-600"
            />
            Alumni only
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <input type="checkbox" checked={groupByCompany} onChange={(event) => setGroupByCompany(event.target.checked)} className="rounded border-zinc-300 dark:border-zinc-600" />
            Group by company
          </label>
        </div>

        {viewMode === "byTouchpoint" ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Touchpoint filters</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <select
                value={touchpointChannelFilter}
                onChange={(event) => {
                  const nextChannel = event.target.value;
                  setTouchpointChannelFilter(nextChannel);
                  if (nextChannel === "Email" && ACCEPTANCE_RESPONSE_STATUSES.includes(touchpointResponseFilter)) setTouchpointResponseFilter("");
                }}
                aria-label="Touchpoint channel"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">All touchpoint channels</option>
                {LEAD_CHANNELS.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
              </select>
              <TypeMultiSelect value={touchpointTypeFilter} options={touchpointTypeOptions} onChange={setTouchpointTypeFilter} />
              <select
                value={touchpointStatusFilter}
                onChange={(event) => setTouchpointStatusFilter(event.target.value)}
                aria-label="Touchpoint status"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">All touchpoint statuses</option>
                {listSettings.touchpointStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <select
                value={touchpointResponseFilter}
                onChange={(event) => setTouchpointResponseFilter(event.target.value)}
                aria-label="Touchpoint response"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">All responses</option>
                {touchpointResponseOptions.map((response) => <option key={response} value={response}>{response}</option>)}
              </select>
            </div>
          </div>
        ) : null}
      </div>

      {isSelectionMode ? (
        <section className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {selectedLeads.length} lead
              {selectedLeads.length === 1 ? "" : "s"} selected
            </p>
            {selectedLeads.length > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedLeadIds(new Set())}
                className="text-sm font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Clear selection
              </button>
            ) : null}
          </div>
          {selectedLeads.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Select leads from the list to apply a shared touchpoint action.
            </p>
          ) : !selectedChannel ? (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Select leads using the same channel to apply a shared touchpoint.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
                Quick actions for {selectedChannel}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {selectedActions.map((action) => {
                  const eligibility = bulkUpdateEligibility.get(action.id);
                  const disabled =
                    isBulkActionRunning ||
                    Boolean(action.updateType && eligibility?.error);
                  return (
                    <div key={action.id}>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => void handleBulkQuickTouchpointAction(action)}
                        title={eligibility?.error}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        {isBulkActionRunning ? "Applying..." : action.label}
                      </button>
                      {action.updateType && eligibility?.error ? (
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {eligibility.error}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      ) : null}

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
          onQuickTouchpointAction: async () => {},
        })}
      />

      <LeadFormModal
        isOpen={isLeadFormOpen}
        onClose={() => {
          setIsLeadFormOpen(false);
          setEditingLead(null);
        }}
        onSubmit={handleLeadSubmit}
        onSubmitBulk={handleBulkLeadSubmit}
        lead={editingLead}
        companies={companies}
        defaultChannel={DEFAULT_LEAD_CHANNEL}
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
        responseStatusOptions={listSettings.responseStatuses}
        touchpointTypeOptions={listSettings.touchpointTypes}
        onSubmit={handleTouchpointSubmit}
        touchpoints={activeLead?.touchpoints ?? []}
        onQuickAction={handleQuickTouchpointAction}
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
        title={
          deleteTarget?.type === "companyLeads"
            ? "Delete all company leads"
            : "Confirm delete"
        }
        message={
          deleteTarget?.type === "lead"
            ? "Are you sure you want to delete this lead and all touchpoints?"
            : deleteTarget?.type === "companyLeads"
              ? `Delete all ${deleteTarget.leadIds.length} leads for ${deleteTarget.companyName}, including their touchpoints and activity logs? This cannot be undone.`
              : "Are you sure you want to delete this touchpoint?"
        }
      />
    </div>
  );
}
