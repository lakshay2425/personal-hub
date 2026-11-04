import type { LeadTouchpoint } from "../types";

export interface InlineTouchpointAction {
  id: "accept" | "replied";
  label: string;
  responseStatus: string;
}

const REPLY_TOUCHPOINT_TYPES = new Set([
  "Message",
  "Follow-up",
  "First Follow-up",
  "Second Follow-up",
]);

export function getTouchpointInlineActions(
  touchpoint: LeadTouchpoint,
): InlineTouchpointAction[] {
  const status = touchpoint.status.trim();
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
        responseStatus: "Accepted",
      },
    ];
  }

  if (
    REPLY_TOUCHPOINT_TYPES.has(touchpoint.type) &&
    touchpoint.responseStatus !== "Replied"
  ) {
    return [
      {
        id: "replied",
        label: "Replied",
        responseStatus: "Replied",
      },
    ];
  }

  return [];
}
