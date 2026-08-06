import type {
  ApplicationStatus,
  ColdEmailStatus,
  LeadStatus,
  TimeFilter,
} from "./types";

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Replied",
  "Inactive",
];

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

export const NAV_ITEMS = [
  { href: "/job-search", label: "Dashboard", exact: true },
  { href: "/job-search/companies", label: "Companies", exact: false },
  { href: "/job-search/leads", label: "Leads", exact: false },
  { href: "/job-search/applications", label: "Applications", exact: false },
  { href: "/job-search/cold-emails", label: "Cold Emails", exact: false },
] as const;
