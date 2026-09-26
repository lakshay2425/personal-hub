import { redirect } from "next/navigation";

export default async function ColdEmailsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  query.set("view", "byTouchpoint");
  for (const [key, value] of Object.entries(params)) {
    if (key === "view") continue;
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      query.append(key, item);
    }
  }
  query.set("touchpointChannel", "Email");
  redirect(`/job-search/leads?${query.toString()}`);
}
