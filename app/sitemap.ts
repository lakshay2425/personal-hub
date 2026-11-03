import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

const routes = [
  "/",
  "/projects",
  "/projects/settings",
  "/content-ideas",
  "/content-ideas/calendar",
  "/planner",
  "/planner/logger",
  "/planner/logger/daily",
  "/planner/logger/settings",
  "/planner/dashboard",
  "/planner/settings",
  "/job-search",
  "/job-search/companies",
  "/job-search/leads",
  "/job-search/outreach",
  "/job-search/applications",
  "/job-search/templates",
  "/job-search/settings",
  "/product-outreach",
  "/people",
  "/people/discover",
  "/people/network",
  "/people/settings",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: new URL(route, SITE_URL).toString(),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
