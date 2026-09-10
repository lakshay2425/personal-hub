import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_CONTENT_TYPE = "image/png";

export type OgSectionId =
  | "home"
  | "projects"
  | "contentIdeas"
  | "contentCalendar"
  | "planner"
  | "logger"
  | "jobSearch"
  | "companies"
  | "leads"
  | "productOutreach"
  | "peopleDiscover"
  | "peopleNetwork"
  | "applications"
  | "templates";

export type OgSection = {
  id: OgSectionId;
  title: string;
  description: string;
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
    badge: "All-in-one",
    badgeColor: "#4f46e5",
    badgeBackground: "#eef2ff",
    alt: `${SITE_NAME} app preview`,
  },
  projects: {
    id: "projects",
    title: "Projects",
    description:
      "Capture questions in an inbox and organize them into projects with titled answers.",
    badge: "Projects",
    badgeColor: "#4f46e5",
    badgeBackground: "#eef2ff",
    alt: `Projects | ${SITE_NAME}`,
  },
  contentIdeas: {
    id: "contentIdeas",
    title: "Content Ideas",
    description:
      "Capture standalone content ideas with status tracking, published links, and calendar scheduling.",
    badge: "Ideas",
    badgeColor: "#7c3aed",
    badgeBackground: "#f5f3ff",
    alt: `Content Ideas | ${SITE_NAME}`,
  },
  contentCalendar: {
    id: "contentCalendar",
    title: "Content Calendar",
    description:
      "Plan when to publish content ideas. Schedule dates locally — no auto-posting.",
    badge: "Calendar",
    badgeColor: "#db2777",
    badgeBackground: "#fdf2f8",
    alt: `Content Calendar | ${SITE_NAME}`,
  },
  planner: {
    id: "planner",
    title: "Planner",
    description:
      "Plan your week, log your progress, and track activity by priority.",
    badge: "Tasks",
    badgeColor: "#0284c7",
    badgeBackground: "#ecfeff",
    alt: `Planner | ${SITE_NAME}`,
  },
  logger: {
    id: "logger",
    title: "Logger",
    description: "Record and review your daily activity log. Stored locally.",
    badge: "Logs",
    badgeColor: "#0891b2",
    badgeBackground: "#ecfeff",
    alt: `Logger | ${SITE_NAME}`,
  },
  jobSearch: {
    id: "jobSearch",
    title: "Job Search Tracker",
    description:
      "Track companies, leads, touchpoints, applications, and outreach templates — all in one unified leads workflow. Stored locally.",
    badge: "Dashboard",
    badgeColor: "#059669",
    badgeBackground: "#ecfdf5",
    alt: `Job Search Tracker | ${SITE_NAME}`,
  },
  companies: {
    id: "companies",
    title: "Companies",
    description: "Manage companies you're targeting in your job search.",
    badge: "Companies",
    badgeColor: "#059669",
    badgeBackground: "#ecfdf5",
    alt: `Companies | ${SITE_NAME}`,
  },
  leads: {
    id: "leads",
    title: "Leads",
    description:
      "Track contacts and outreach touchpoints at target companies. Log emails, LinkedIn, and X outreach with templates and follow-up planning. Stored locally.",
    badge: "Leads",
    badgeColor: "#2563eb",
    badgeBackground: "#eff6ff",
    alt: `Leads | ${SITE_NAME}`,
  },
  productOutreach: {
    id: "productOutreach",
    title: "Product Outreach",
    description:
      "Log cross-platform product outreach with a timeline of interactions per contact across Instagram, LinkedIn, X, and email. Stored locally.",
    badge: "Product",
    badgeColor: "#9333ea",
    badgeBackground: "#faf5ff",
    alt: `Product Outreach | ${SITE_NAME}`,
  },
  peopleDiscover: {
    id: "peopleDiscover",
    title: "Discover",
    description:
      "Save people you find on LinkedIn and other platforms, then review their profiles when you have time. Stored locally.",
    badge: "Discover",
    badgeColor: "#0f766e",
    badgeBackground: "#f0fdfa",
    alt: `Discover | ${SITE_NAME}`,
  },
  peopleNetwork: {
    id: "peopleNetwork",
    title: "Network",
    description:
      "Keep people you know and the context for how you know them. Stored locally.",
    badge: "Network",
    badgeColor: "#7c3aed",
    badgeBackground: "#f5f3ff",
    alt: `Network | ${SITE_NAME}`,
  },
  applications: {
    id: "applications",
    title: "Applications",
    description: "Track your job applications and their status. Stored locally.",
    badge: "Applications",
    badgeColor: "#ca8a04",
    badgeBackground: "#fefce8",
    alt: `Applications | ${SITE_NAME}`,
  },
  templates: {
    id: "templates",
    title: "Outreach Templates",
    description:
      "Reusable cold email, LinkedIn, X DM, and follow-up templates — link them to lead touchpoints. Copy and customize before sending. Stored locally.",
    badge: "Templates",
    badgeColor: "#ea580c",
    badgeBackground: "#fff7ed",
    alt: `Outreach Templates | ${SITE_NAME}`,
  },
};

export function getOgSection(id: OgSectionId): OgSection {
  return OG_SECTIONS[id];
}
