export type LeadStatus = "New" | "Contacted" | "Replied" | "Inactive";

export type ApplicationStatus =
  | "Applied"
  | "Interview"
  | "Rejected"
  | "Offer"
  | "Joined";

export type ColdEmailStatus =
  | "Draft"
  | "Sent"
  | "Replied"
  | "Rejected"
  | "Positive Response"
  | "Closed";

export type EntityType =
  | "company"
  | "lead"
  | "application"
  | "coldEmail";

export interface Company {
  id?: number;
  companyName: string;
  sector: string;
  website: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Lead {
  id?: number;
  companyId: number;
  name: string;
  role: string;
  type: string;
  email: string;
  linkedin: string;
  status: LeadStatus;
  firstFollowUpDate: string;
  secondFollowUpDate: string;
  notes: string;
  createdAt: number;
}

export interface Application {
  id?: number;
  companyId: number;
  role: string;
  portal: string;
  jobLink: string;
  appliedDate: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: number;
}

export interface ColdEmail {
  id?: number;
  companyId: number;
  leadId: number;
  role: string;
  sentDate: string;
  status: ColdEmailStatus;
  firstFollowUpDate: string;
  secondFollowUpDate: string;
  templateName: string;
  notes: string;
  createdAt: number;
}

export interface ActivityLog {
  id?: number;
  entityType: EntityType;
  entityId: number;
  action: string;
  timestamp: number;
}

export interface CompanyWithCounts extends Company {
  id: number;
  leadsCount: number;
  applicationsCount: number;
}

export interface FollowUpItem {
  id: number;
  entityType: "lead" | "coldEmail";
  companyName: string;
  leadName: string;
  role: string;
  followUpType: "First" | "Second";
  entityId: number;
}

export interface GlobalSearchResult {
  type: "company" | "lead" | "application";
  id: number;
  title: string;
  subtitle: string;
  href: string;
}

export type TimeFilter =
  | "today"
  | "last7"
  | "last30"
  | "last90"
  | "all";

export interface DashboardStats {
  totalCompanies: number;
  totalLeads: number;
  totalApplications: number;
  interviews: number;
  offers: number;
}
