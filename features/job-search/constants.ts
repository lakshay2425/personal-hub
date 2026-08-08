import type {
  ApplicationStatus,
  ColdEmailStatus,
  LeadChannel,
  LeadStatus,
  TemplateType,
  TimeFilter,
} from "./types";

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Replied",
  "Inactive",
];

export const LEAD_CHANNELS: LeadChannel[] = [
  "Email",
  "LinkedIn",
  "X",
  "Other",
];

export const OUTREACH_CHANNELS: LeadChannel[] = ["LinkedIn", "X"];

export const LEADS_PAGE_CHANNELS: LeadChannel[] = ["Email", "Other"];

export const DEFAULT_LEAD_CHANNEL: LeadChannel = "LinkedIn";
export const DEFAULT_LEADS_PAGE_CHANNEL: LeadChannel = "Email";
export const LEGACY_LEAD_CHANNEL: LeadChannel = "Email";

export function isLeadChannel(value: unknown): value is LeadChannel {
  return LEAD_CHANNELS.includes(value as LeadChannel);
}

export function isOutreachChannel(channel: LeadChannel): boolean {
  return OUTREACH_CHANNELS.includes(channel);
}

export function getLeadPageHref(channel: LeadChannel): string {
  return isOutreachChannel(channel)
    ? "/job-search/outreach"
    : "/job-search/leads";
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Applied",
  "Interview",
  "Rejected",
  "Offer",
  "Joined",
];

export const COLD_EMAIL_STATUSES: ColdEmailStatus[] = [
  "Draft",
  "Sent",
  "Replied",
  "Rejected",
  "Positive Response",
  "Closed",
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
  { href: "/job-search/outreach", label: "Outreach", exact: false },
  { href: "/job-search/applications", label: "Applications", exact: false },
  { href: "/job-search/cold-emails", label: "Cold Emails", exact: false },
  { href: "/job-search/templates", label: "Templates", exact: false },
] as const;
