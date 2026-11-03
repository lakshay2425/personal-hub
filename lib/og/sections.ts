import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_CONTENT_TYPE = "image/png";

export type OgSectionId =
  | "home"
  | "projects"
  | "projectDetail"
  | "projectSettings"
  | "contentIdeas"
  | "contentCalendar"
  | "planner"
  | "plannerDashboard"
  | "plannerSettings"
  | "logger"
  | "loggerDaily"
  | "loggerSettings"
  | "jobSearch"
  | "companies"
  | "companyDetail"
  | "leads"
  | "outreach"
  | "jobSearchSettings"
  | "legacyColdEmails"
  | "productOutreach"
  | "people"
  | "peopleDiscover"
  | "peopleNetwork"
  | "peopleSettings"
  | "applications"
  | "templates";

export type OgSection = {
  id: OgSectionId;
  title: string;
  description: string;
  keywords?: string[];
  noIndex?: boolean;
  badge: string;
  badgeColor: string;
  badgeBackground: string;
  alt: string;
};

export const OG_SECTIONS: Record<OgSectionId, OgSection> = {
  home: {
    id: "home",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    keywords: [
      "local-first productivity app",
      "personal productivity hub",
      "project and question management",
      "content creation planner",
      "weekly task planner",
      "job search tracker",
      "professional outreach",
    ],
    badge: "All-in-one",
    badgeColor: "#4f46e5",
    badgeBackground: "#eef2ff",
    alt: `${SITE_NAME} app preview`,
  },
  projects: {
    id: "projects",
    title: "Projects & Questions",
    description:
      "Organize questions, answers, and project work in one local-first workspace. Capture ideas in an inbox and build a searchable project knowledge base.",
    keywords: [
      "project management",
      "question tracker",
      "project knowledge base",
      "personal project organizer",
    ],
    badge: "Projects",
    badgeColor: "#4f46e5",
    badgeBackground: "#eef2ff",
    alt: `Projects | ${SITE_NAME}`,
  },
  projectDetail: {
    id: "projectDetail",
    title: "Project Workspace",
    description:
      "Work through project questions, answers, content ideas, and feature plans in one organized workspace.",
    badge: "Workspace",
    badgeColor: "#4f46e5",
    badgeBackground: "#eef2ff",
    alt: `Project Workspace | ${SITE_NAME}`,
    noIndex: true,
  },
  projectSettings: {
    id: "projectSettings",
    title: "Project Settings",
    description:
      "Manage project priorities and preferences for your local project workspace.",
    badge: "Settings",
    badgeColor: "#4f46e5",
    badgeBackground: "#eef2ff",
    alt: `Project Settings | ${SITE_NAME}`,
    noIndex: true,
  },
  contentIdeas: {
    id: "contentIdeas",
    title: "Content Creation",
    description:
      "Capture and organize content ideas, track their progress, and keep published work and links in one place.",
    keywords: [
      "content creation planner",
      "content ideas",
      "content calendar",
      "content planning",
    ],
    badge: "Ideas",
    badgeColor: "#7c3aed",
    badgeBackground: "#f5f3ff",
    alt: `Content Creation | ${SITE_NAME}`,
  },
  contentCalendar: {
    id: "contentCalendar",
    title: "Content Calendar",
    description:
      "Plan when to publish content ideas. Schedule dates locally — no auto-posting.",
    keywords: ["content calendar", "content publishing schedule", "editorial calendar"],
    badge: "Calendar",
    badgeColor: "#db2777",
    badgeBackground: "#fdf2f8",
    alt: `Content Calendar | ${SITE_NAME}`,
  },
  planner: {
    id: "planner",
    title: "Weekly Task Planner",
    description:
      "Plan your week, organize tasks into sprints and recurring practices, and break work into manageable subtasks.",
    keywords: [
      "weekly task planner",
      "weekly planning",
      "task management",
      "subtask planner",
    ],
    badge: "Tasks",
    badgeColor: "#0284c7",
    badgeBackground: "#ecfeff",
    alt: `Planner | ${SITE_NAME}`,
  },
  plannerDashboard: {
    id: "plannerDashboard",
    title: "Planning Dashboard",
    description:
      "Review weekly planning progress, completed work, and activity at a glance.",
    badge: "Dashboard",
    badgeColor: "#0284c7",
    badgeBackground: "#ecfeff",
    alt: `Planning Dashboard | ${SITE_NAME}`,
    noIndex: true,
  },
  plannerSettings: {
    id: "plannerSettings",
    title: "Planner Settings",
    description:
      "Customize planner priorities and weekly planning preferences.",
    badge: "Settings",
    badgeColor: "#0284c7",
    badgeBackground: "#ecfeff",
    alt: `Planner Settings | ${SITE_NAME}`,
    noIndex: true,
  },
  logger: {
    id: "logger",
    title: "Daily Logger",
    description:
      "Record what you worked on throughout the day and review your timestamped activity history.",
    keywords: ["daily activity log", "work log", "personal logger", "daily journal"],
    badge: "Logs",
    badgeColor: "#0891b2",
    badgeBackground: "#ecfeff",
    alt: `Logger | ${SITE_NAME}`,
  },
  loggerDaily: {
    id: "loggerDaily",
    title: "Daily Activity Log",
    description:
      "Review and update your activity entries for a selected day.",
    badge: "Daily Log",
    badgeColor: "#0891b2",
    badgeBackground: "#ecfeff",
    alt: `Daily Activity Log | ${SITE_NAME}`,
    noIndex: true,
  },
  loggerSettings: {
    id: "loggerSettings",
    title: "Logger Settings",
    description:
      "Manage categories and preferences for your local daily activity log.",
    badge: "Settings",
    badgeColor: "#0891b2",
    badgeBackground: "#ecfeff",
    alt: `Logger Settings | ${SITE_NAME}`,
    noIndex: true,
  },
  jobSearch: {
    id: "jobSearch",
    title: "Job Search Tracker",
    description:
      "Organize target companies, leads, job applications, and outreach activity with a local-first job search tracker.",
    keywords: [
      "job search tracker",
      "job application tracker",
      "job search organizer",
      "outreach tracker",
    ],
    badge: "Dashboard",
    badgeColor: "#059669",
    badgeBackground: "#ecfdf5",
    alt: `Job Search Tracker | ${SITE_NAME}`,
  },
  companies: {
    id: "companies",
    title: "Target Companies",
    description:
      "Organize companies you're targeting, review lead and application activity, and keep job-search research together.",
    keywords: ["target company tracker", "job search companies", "company research"],
    badge: "Companies",
    badgeColor: "#059669",
    badgeBackground: "#ecfdf5",
    alt: `Companies | ${SITE_NAME}`,
  },
  companyDetail: {
    id: "companyDetail",
    title: "Company Job Search Profile",
    description:
      "Review a target company's details, associated leads, and job applications in one place.",
    badge: "Company",
    badgeColor: "#059669",
    badgeBackground: "#ecfdf5",
    alt: `Company Job Search Profile | ${SITE_NAME}`,
    noIndex: true,
  },
  leads: {
    id: "leads",
    title: "Job Search Lead Tracker",
    description:
      "Track contacts and outreach touchpoints at target companies. Log emails, LinkedIn, and X outreach with templates and follow-up planning. Stored locally.",
    keywords: [
      "job search lead tracker",
      "LinkedIn outreach tracker",
      "email follow-up tracker",
      "contact management",
    ],
    badge: "Leads",
    badgeColor: "#2563eb",
    badgeBackground: "#eff6ff",
    alt: `Leads | ${SITE_NAME}`,
  },
  outreach: {
    id: "outreach",
    title: "LinkedIn & X Job Outreach",
    description:
      "Track LinkedIn and X job-search outreach, log messages and connection requests, and manage replies and follow-ups.",
    keywords: [
      "LinkedIn job outreach",
      "X outreach tracker",
      "connection request tracker",
      "job search networking",
    ],
    badge: "Outreach",
    badgeColor: "#2563eb",
    badgeBackground: "#eff6ff",
    alt: `LinkedIn and X Job Outreach | ${SITE_NAME}`,
    noIndex: true,
  },
  jobSearchSettings: {
    id: "jobSearchSettings",
    title: "Job Search Settings",
    description:
      "Customize lead statuses, touchpoint options, and weekly targets for your job search tracker.",
    badge: "Settings",
    badgeColor: "#059669",
    badgeBackground: "#ecfdf5",
    alt: `Job Search Settings | ${SITE_NAME}`,
    noIndex: true,
  },
  legacyColdEmails: {
    id: "legacyColdEmails",
    title: "Email Outreach",
    description:
      "Email outreach is managed in the job-search leads and touchpoints workspace.",
    badge: "Email",
    badgeColor: "#2563eb",
    badgeBackground: "#eff6ff",
    alt: `Email Outreach | ${SITE_NAME}`,
    noIndex: true,
  },
  productOutreach: {
    id: "productOutreach",
    title: "Product Outreach",
    description:
      "Log cross-platform product outreach with a timeline of interactions per contact across Instagram, LinkedIn, X, and email. Stored locally.",
    keywords: [
      "product outreach tracker",
      "customer discovery outreach",
      "social outreach log",
      "contact interaction history",
    ],
    badge: "Product",
    badgeColor: "#9333ea",
    badgeBackground: "#faf5ff",
    alt: `Product Outreach | ${SITE_NAME}`,
  },
  people: {
    id: "people",
    title: "People & Network",
    description:
      "Keep a private record of people you discover and relationships you want to nurture.",
    keywords: ["people tracker", "professional networking", "relationship manager"],
    badge: "People",
    badgeColor: "#0f766e",
    badgeBackground: "#f0fdfa",
    alt: `People and Network | ${SITE_NAME}`,
  },
  peopleDiscover: {
    id: "peopleDiscover",
    title: "People Discovery",
    description:
      "Save people you find on LinkedIn and other platforms, then review their profiles when you have time. Stored locally.",
    keywords: ["people discovery", "LinkedIn people tracker", "contact discovery"],
    badge: "Discover",
    badgeColor: "#0f766e",
    badgeBackground: "#f0fdfa",
    alt: `Discover | ${SITE_NAME}`,
  },
  peopleNetwork: {
    id: "peopleNetwork",
    title: "Professional Network",
    description:
      "Keep people you know and the context for how you know them. Stored locally.",
    keywords: ["professional network tracker", "relationship tracking", "personal CRM"],
    badge: "Network",
    badgeColor: "#7c3aed",
    badgeBackground: "#f5f3ff",
    alt: `Network | ${SITE_NAME}`,
  },
  peopleSettings: {
    id: "peopleSettings",
    title: "People Settings",
    description:
      "Customize platforms, statuses, and relationship types in your local people tracker.",
    badge: "Settings",
    badgeColor: "#0f766e",
    badgeBackground: "#f0fdfa",
    alt: `People Settings | ${SITE_NAME}`,
    noIndex: true,
  },
  applications: {
    id: "applications",
    title: "Job Application Tracker",
    description:
      "Track job applications, application dates, and progress from submission through interviews and offers.",
    keywords: [
      "job application tracker",
      "application status tracker",
      "job search progress",
    ],
    badge: "Applications",
    badgeColor: "#ca8a04",
    badgeBackground: "#fefce8",
    alt: `Applications | ${SITE_NAME}`,
  },
  templates: {
    id: "templates",
    title: "Job Outreach Message Templates",
    description:
      "Reusable cold email, LinkedIn, X DM, and follow-up templates — link them to lead touchpoints. Copy and customize before sending. Stored locally.",
    keywords: [
      "job outreach templates",
      "cold email templates",
      "LinkedIn message templates",
      "follow-up message templates",
    ],
    badge: "Templates",
    badgeColor: "#ea580c",
    badgeBackground: "#fff7ed",
    alt: `Outreach Templates | ${SITE_NAME}`,
  },
};

export function getOgSection(id: OgSectionId): OgSection {
  return OG_SECTIONS[id];
}
