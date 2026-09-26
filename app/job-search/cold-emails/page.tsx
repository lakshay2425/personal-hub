import { redirect } from "next/navigation";

export default async function ColdEmailsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  query.set("view", "byTouchpoint");
  query.set("touchpointChannel", "Email");
  if (typeof params.status === "string") query.set("touchpointStatus", params.status);
  redirect(`/job-search/leads?${query.toString()}`);
}
