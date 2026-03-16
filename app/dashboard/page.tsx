import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/client-login");

  const [clientRes, statsRes, meetingsRes] = await Promise.all([
    supabase.from("clients").select("*").eq("id", user.id).single(),
    supabase.from("campaign_stats").select("*").eq("client_id", user.id).order("week_number"),
    supabase.from("meetings").select("*").eq("client_id", user.id).order("meeting_date", { ascending: false }),
  ]);

  return (
    <DashboardClient
      client={clientRes.data}
      stats={statsRes.data ?? []}
      meetings={meetingsRes.data ?? []}
    />
  );
}
