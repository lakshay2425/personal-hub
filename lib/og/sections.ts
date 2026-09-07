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
  | "outreach"
  | "productOutreach"
  | "applications"
  | "coldEmails"
  | "templates";

export type OgSection = {
  id: OgSectionId;
  title: string;
  description: string;
  badge: string;
  alt: string;
};

export const OG_SECTIONS: Record<OgSectionId, OgSection> = {
  home: {
    id: "home",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    badge: "All-in-one",
    alt: `${SITE_NAME} app preview`,
  },
  projects: {
    id: "projects",
    title: "Projects",
    description:
      "Capture questions in an inbox and organize them into projects with titled answers.",
    badge: "Projects",
    alt: `Projects | ${SITE_NAME}`,
  },
  contentIdeas: {
    id: "contentIdeas",
    title: "Content Ideas",
    description:
      "Capture standalone content ideas with status tracking, published links, and calendar scheduling.",
    badge: "Ideas",
    alt: `Content Ideas | ${SITE_NAME}`,
  },
  contentCalendar: {
    id: "contentCalendar",
    title: "Content Calendar",
    description:
      "Plan when to publish content ideas. Schedule dates locally — no auto-posting.",
    badge: "Calendar",
    alt: `Content Calendar | ${SITE_NAME}`,
  },
  planner: {
    id: "planner",
    title: "Planner",
    description:
      "Plan your week, log your progress, and track activity by priority.",
    badge: "Tasks",
    alt: `Planner | ${SITE_NAME}`,
  },
  logger: {
    id: "logger",
    title: "Logger",
    description: "Record and review your daily activity log. Stored locally.",
    badge: "Logs",
    alt: `Logger | ${SITE_NAME}`,
  },
  jobSearch: {
    id: "jobSearch",
    title: "Job Search",
    description:
      "Track companies, leads, applications, cold emails, and outreach templates — stored locally.",
    badge: "Dashboard",
    alt: `Job Search Tracker | ${SITE_NAME}`,
  },
  companies: {
    id: "companies",
    title: "Companies",
    description: "Manage companies you're targeting in your job search.",
    badge: "Companies",
    alt: `Companies | ${SITE_NAME}`,
  },
  leads: {
    id: "leads",
    title: "Leads",
    description:
      "Track email and other leads at target companies. Copy emails to clipboard, view company info, and link follow-up templates.",
    badge: "Leads",
    alt: `Leads | ${SITE_NAME}`,
  },
  outreach: {
    id: "outreach",
    title: "Outreach",
    description:
      "Track job outreach and product outreach contacts. Job outreach covers LinkedIn and X at target companies.",
    badge: "Job Outreach",
    alt: `Outreach | ${SITE_NAME}`,
  },
  productOutreach: {
    id: "productOutreach",
    title: "Product Outreach",
    description:
      "Log cross-platform product outreach with a timeline of interactions per contact across Instagram, LinkedIn, X, and email.",
    badge: "Product",
    alt: `Product Outreach | ${SITE_NAME}`,
  },
  applications: {
    id: "applications",
    title: "Applications",
    description: "Track your job applications and their status. Stored locally.",
    badge: "Applications",
    alt: `Applications | ${SITE_NAME}`,
  },
  coldEmails: {
    id: "coldEmails",
    title: "Cold Emails",
    description:
      "Track cold email outreach and link Cold Email and follow-up templates to each send. Stored locally.",
    badge: "Cold Email",
    alt: `Cold Emails | ${SITE_NAME}`,
  },
  templates: {
    id: "templates",
    title: "Outreach Templates",
    description:
      "Reusable cold email, LinkedIn, X DM, and follow-up templates — link them to cold emails and outreach leads.",
    badge: "Templates",
    alt: `Outreach Templates | ${SITE_NAME}`,
  },
};

export function getOgSection(id: OgSectionId): OgSection {
  return OG_SECTIONS[id];
}
