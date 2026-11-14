import type { LeadTouchpoint } from "../types";

export type TouchpointQuickUpdate = Partial<
  Pick<LeadTouchpoint, "status" | "responseStatus">
>;

export interface InlineTouchpointAction {
  id: "accept" | "replied" | "sent";
  label: string;
  update: TouchpointQuickUpdate;
}

const REPLY_TOUCHPOINT_TYPES = new Set([
  "Message Draft",
  "Message",
  "Follow-up",
  "First Follow-up",
  "Second Follow-up",
]);

export function getTouchpointInlineActions(
  touchpoint: LeadTouchpoint,
): InlineTouchpointAction[] {
  const status = touchpoint.status.trim();

  if (
    touchpoint.channel === "LinkedIn" &&
    touchpoint.type === "Message Draft" &&
    status === "Draft"
  ) {
    return [{ id: "sent", label: "Sent", update: { status: "Sent" } }];
  }

  if (status !== "Sent") return [];

  if (
    touchpoint.channel === "LinkedIn" &&
    touchpoint.type === "Connection Request" &&
    touchpoint.responseStatus !== "Accepted"
  ) {
    return [
      {
        id: "accept",
        label: "Accept",
        update: { responseStatus: "Accepted" },
      },
    ];
  }

  if (
    REPLY_TOUCHPOINT_TYPES.has(touchpoint.type) &&
    touchpoint.responseStatus !== "Replied"
  ) {
    return [
      { id: "replied", label: "Replied", update: { responseStatus: "Replied" } },
    ];
  }

  return [];
}
