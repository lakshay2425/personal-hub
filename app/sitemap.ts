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
  "/product-outreach",
  "/people/discover",
  "/people/network",
  "/people/settings",
  "/job-search/applications",
  "/job-search/templates",
  "/job-search/settings",
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
