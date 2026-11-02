import type {
  ApplicationStatus,
  LeadChannel,
  ProductOutreachChannel,
  TemplateType,
  TimeFilter,
} from "./types";

export const DEFAULT_NEW_LEAD_STATUS = "New";
export const DEFAULT_CONTACTED_LEAD_STATUS = "Contacted";
export const DEFAULT_TOUCHPOINT_STATUS = "Draft";
export const DEFAULT_RESPONSE_STATUS = "Not responded";
export const LEGACY_REPLIED_TOUCHPOINT_STATUS = "Replied";

export const DEFAULT_LEAD_STATUSES = [
  DEFAULT_NEW_LEAD_STATUS,
  DEFAULT_CONTACTED_LEAD_STATUS,
];

export const DEFAULT_TOUCHPOINT_STATUSES = ["Draft", "Sent"];

export const DEFAULT_RESPONSE_STATUSES = [
  DEFAULT_RESPONSE_STATUS,
  LEGACY_REPLIED_TOUCHPOINT_STATUS,
];

export const DEFAULT_TOUCHPOINT_TYPES = [
  "Initial",
  "Follow-up",
  "Connection Request",
  "Message",
  "Reply",
  "Other",
];

export const LINKEDIN_TOUCHPOINT_TYPES = [
  "Connection Request",
  "Follow-up",
  "Message",
  "Reply",
];

export const EMAIL_TOUCHPOINT_TYPES = [
  "Message",
  "First Follow-up",
  "Second Follow-up",
  "Reply",
];

export const ACCEPTANCE_RESPONSE_STATUSES = ["Accepted", "Not accepted"];
export const EMAIL_RESPONSE_STATUSES = ["Not responded", "Replied"];
export const LINKEDIN_RESPONSE_STATUSES = [
  "Not responded",
  "Replied",
  ...ACCEPTANCE_RESPONSE_STATUSES,
];

export interface QuickTouchpointAction {
  id: string;
  label: string;
  type: string;
  status: string;
  responseStatus: string;
  updateType?: "reply" | "acceptance";
  eligibleTypes?: string[];
}

export const QUICK_TOUCHPOINT_ACTIONS: Partial<
  Record<LeadChannel, QuickTouchpointAction[]>
> = {
  LinkedIn: [
    {
      id: "connection-request-sent",
      label: "Connection request sent",
      type: "Connection Request",
      status: "Sent",
      responseStatus: "Not accepted",
    },
    {
      id: "connection-accepted",
      label: "Connection accepted",
      type: "Connection Request",
      status: "Sent",
      responseStatus: "Accepted",
      updateType: "acceptance",
      eligibleTypes: ["Connection Request"],
    },
    {
      id: "linkedin-message-sent",
      label: "Message sent",
      type: "Message",
      status: "Sent",
      responseStatus: "Not responded",
    },
    {
      id: "linkedin-reply-received",
      label: "Reply received",
      type: "Message",
      status: "Sent",
      responseStatus: "Replied",
      updateType: "reply",
      eligibleTypes: ["Message"],
    },
  ],
  Email: [
    {
      id: "email-sent",
      label: "Email sent",
      type: "Message",
      status: "Sent",
      responseStatus: "Not responded",
    },
    {
      id: "email-reply-received",
      label: "Reply received",
      type: "Message",
      status: "Sent",
      responseStatus: "Replied",
      updateType: "reply",
      eligibleTypes: ["Message", "First Follow-up", "Second Follow-up"],
    },
  ],
  X: [
    {
      id: "x-message-sent",
      label: "DM sent",
      type: "Message",
      status: "Sent",
      responseStatus: "Not responded",
    },
    {
      id: "x-reply-received",
      label: "Reply received",
      type: "Message",
      status: "Sent",
      responseStatus: "Replied",
      updateType: "reply",
      eligibleTypes: ["Message", "Follow-up"],
    },
  ],
};

export const DEFAULT_CONTACTED_TRIGGER_STATUSES = ["Sent"];

export function separateResponseFromStatus(
  status: string | undefined,
  responseStatus: string | undefined,
): { status: string; responseStatus: string } {
  const trimmedStatus = status?.trim() || DEFAULT_TOUCHPOINT_STATUS;
  const trimmedResponse = responseStatus?.trim() ?? "";

  if (trimmedResponse) {
    return { status: trimmedStatus, responseStatus: trimmedResponse };
  }

  if (trimmedStatus === LEGACY_REPLIED_TOUCHPOINT_STATUS) {
    return {
      status: "Sent",
      responseStatus: LEGACY_REPLIED_TOUCHPOINT_STATUS,
    };
  }

  return {
    status: trimmedStatus,
    responseStatus: DEFAULT_RESPONSE_STATUS,
  };
}

export const LEAD_CHANNELS: LeadChannel[] = [
  "Email",
  "LinkedIn",
  "X",
  "Other",
];

export const DEFAULT_LEAD_CHANNEL: LeadChannel = "LinkedIn";
export const LEGACY_LEAD_CHANNEL: LeadChannel = "Email";

export function isLeadChannel(value: unknown): value is LeadChannel {
  return LEAD_CHANNELS.includes(value as LeadChannel);
}

export const PRODUCT_OUTREACH_CHANNELS: ProductOutreachChannel[] = [
  "Instagram",
  "LinkedIn",
  "X",
  "Email",
];

export const DEFAULT_PRODUCT_OUTREACH_CHANNEL: ProductOutreachChannel =
  "Instagram";

export function isProductOutreachChannel(
  value: unknown,
): value is ProductOutreachChannel {
  return PRODUCT_OUTREACH_CHANNELS.includes(value as ProductOutreachChannel);
}

export function normalizeProductOutreachHandle(
  channel: ProductOutreachChannel,
  raw: string,
): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (channel === "Instagram") {
    const withoutAt = trimmed.replace(/^@+/, "");
    const username = withoutAt.split(/[/?#]/)[0] ?? "";
    return username.trim();
  }

  if (channel === "X") {
    const withoutAt = trimmed.replace(/^@+/, "");
    if (/^https?:\/\//i.test(withoutAt) || withoutAt.includes(".")) {
      return withoutAt;
    }
    return withoutAt.split(/[/?#]/)[0]?.trim() ?? "";
  }

  if (channel === "Email") {
    return trimmed.toLowerCase();
  }

  return trimmed;
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Applied",
  "Interview",
  "Rejected",
  "Offer",
  "Joined",
];

export const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 Days" },
  { value: "last30", label: "Last 30 Days" },
  { value: "last90", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
];

export const TEMPLATE_TYPES: TemplateType[] = [
  "Cold Email",
  "LinkedIn Message",
  "X DM",
  "Follow-up",
];

export const TEMPLATE_TYPE_FILTERS: {
  value: TemplateType | "all";
  label: string;
}[] = [
  { value: "all", label: "All" },
  ...TEMPLATE_TYPES.map((type) => ({ value: type, label: type })),
];

export const NAV_ITEMS = [
  { href: "/job-search", label: "Dashboard", exact: true },
  { href: "/job-search/companies", label: "Companies", exact: false },
  { href: "/job-search/leads", label: "Leads", exact: false },
  { href: "/job-search/applications", label: "Applications", exact: false },
  { href: "/job-search/templates", label: "Templates", exact: false },
  { href: "/job-search/settings", label: "Settings", exact: false },
] as const;

export function getNavItems(showApplications: boolean) {
  return NAV_ITEMS.filter(
    (item) =>
      showApplications || item.href !== "/job-search/applications",
  );
}

export const LIST_SETTINGS_ID = 1 as const;

export type ListSettingsField =
  | "leadStatuses"
  | "touchpointStatuses"
  | "responseStatuses"
  | "touchpointTypes";
