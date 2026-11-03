import type { QuickTouchpointAction } from "../constants";
import type {
  LeadChannel,
  LeadWithTouchpoints,
} from "../types";

export interface BulkTouchpointEligibility {
  touchpointIds: number[];
  error?: string;
}

export async function runBulkTouchpointWrites<T>(
  items: T[],
  write: (item: T) => Promise<unknown>,
  refresh: () => Promise<void>,
): Promise<void> {
  try {
    for (const item of items) {
      await write(item);
    }
  } finally {
    await refresh();
  }
}

export interface BulkTouchpointWriters {
  appendTouchpoints: (
    leadIds: number[],
    input: {
      channel: LeadChannel;
      type: string;
      status: string;
      responseStatus: string;
      templateId: null;
      context: string;
      occurredAt: number;
    },
    options: { updateLeadStatus: false },
  ) => Promise<void>;
  editTouchpoints: (
    touchpointIds: number[],
    data: { responseStatus: string },
    options: { updateLeadStatus: false },
  ) => Promise<void>;
}

export function getCommonLeadChannel(
  leads: LeadWithTouchpoints[],
): LeadChannel | null {
  if (leads.length === 0) return null;
  const channel = leads[0].channel;
  return leads.every((lead) => lead.channel === channel) ? channel : null;
}

export function getBulkTouchpointEligibility(
  action: QuickTouchpointAction,
  leads: LeadWithTouchpoints[],
): BulkTouchpointEligibility {
  if (!action.updateType) return { touchpointIds: [] };
  if (leads.length === 0) {
    return { touchpointIds: [], error: "Select at least one lead." };
  }
  if (!getCommonLeadChannel(leads)) {
    return {
      touchpointIds: [],
      error: "Selected leads must use the same channel.",
    };
  }

  const touchpointIds: number[] = [];
  for (const lead of leads) {
    const eligible = lead.touchpoints.filter(
      (touchpoint) =>
        touchpoint.channel === lead.channel &&
        touchpoint.status === "Sent" &&
        action.eligibleTypes?.includes(touchpoint.type) &&
        (action.updateType === "acceptance"
          ? ["Not accepted", "Not responded"].includes(
              touchpoint.responseStatus,
            )
          : touchpoint.responseStatus === "Not responded"),
    );
    if (eligible.length === 0) {
      return {
        touchpointIds: [],
        error:
          action.updateType === "acceptance"
            ? "Every selected lead needs an unanswered connection request."
            : "Every selected lead needs an unanswered message or follow-up.",
      };
    }

    const latestOccurredAt = Math.max(
      ...eligible.map((touchpoint) => touchpoint.occurredAt),
    );
    const latest = eligible.filter(
      (touchpoint) => touchpoint.occurredAt === latestOccurredAt,
    );
    if (latest.length !== 1 || latest[0].id === undefined) {
      return {
        touchpointIds: [],
        error:
          "Each selected lead must have one clear latest touchpoint to update.",
      };
    }
    touchpointIds.push(latest[0].id);
  }

  return { touchpointIds };
}

export async function applyBulkTouchpointAction(
  action: QuickTouchpointAction,
  leads: LeadWithTouchpoints[],
  writers: BulkTouchpointWriters,
  now: () => number = Date.now,
): Promise<void> {
  const channel = getCommonLeadChannel(leads);
  if (!channel) {
    throw new Error(
      leads.length === 0
        ? "Select at least one lead."
        : "Selected leads must use the same channel.",
    );
  }

  if (action.updateType) {
    const eligibility = getBulkTouchpointEligibility(action, leads);
    if (eligibility.error) throw new Error(eligibility.error);
    await writers.editTouchpoints(
      eligibility.touchpointIds,
      { responseStatus: action.responseStatus },
      { updateLeadStatus: false },
    );
    return;
  }

  await writers.appendTouchpoints(
    leads.map((lead) => lead.id),
    {
      channel,
      type: action.type,
      status: action.status,
      responseStatus: action.responseStatus,
      templateId: null,
      context: "",
      occurredAt: now(),
    },
    { updateLeadStatus: false },
  );
}

export function canSelectLeadForBulkTouchpoint(
  selectedLeads: LeadWithTouchpoints[],
  candidate: LeadWithTouchpoints,
): boolean {
  return (
    selectedLeads.length === 0 ||
    selectedLeads.every((lead) => lead.channel === candidate.channel)
  );
}

export function canSelectLeadGroup(
  selectedLeads: LeadWithTouchpoints[],
  groupLeads: LeadWithTouchpoints[],
): boolean {
  const groupChannel = getCommonLeadChannel(groupLeads);
  return (
    groupChannel !== null &&
    selectedLeads.every((lead) => lead.channel === groupChannel)
  );
}

export function setLeadGroupSelection(
  selectedIds: ReadonlySet<number>,
  groupLeadIds: number[],
  shouldSelect: boolean,
): Set<number> {
  const next = new Set(selectedIds);
  for (const id of groupLeadIds) {
    if (shouldSelect) next.add(id);
    else next.delete(id);
  }
  return next;
}
