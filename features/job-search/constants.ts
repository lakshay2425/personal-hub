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

export const DEFAULT_LEAD_STATUSES = [
  DEFAULT_NEW_LEAD_STATUS,
  DEFAULT_CONTACTED_LEAD_STATUS,
];

export const DEFAULT_TOUCHPOINT_STATUSES = ["Draft", "Sent", "Replied"];

export const DEFAULT_TOUCHPOINT_TYPES = [
  "Initial",
  "Follow-up",
  "Connection Request",
  "Message",
  "Reply",
  "Other",
];

export const DEFAULT_CONTACTED_TRIGGER_STATUSES = ["Sent", "Replied"];

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
  | "touchpointTypes";
