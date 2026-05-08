import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServiceClient();

  const wibDate = new Date(Date.now() + 7 * 3600000).toISOString().split("T")[0];
  const todayStart = new Date(wibDate + "T00:00:00+07:00").toISOString();
  const todayEnd = new Date(wibDate + "T24:00:00+07:00").toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const now = new Date().toISOString();

  const [todayRes, thirtyRes] = await Promise.all([
    supabase
      .from("ds_prayer_logs")
      .select("id", { count: "exact", head: true })
      .gte("prayed_at", todayStart)
      .lte("prayed_at", now),
    supabase
      .from("ds_prayer_logs")
      .select("id", { count: "exact", head: true })
      .gte("prayed_at", thirtyDaysAgo)
      .lte("prayed_at", now),
  ]);

  return NextResponse.json({
    todayPrayers: todayRes.count ?? 0,
    thirtyDayPrayers: thirtyRes.count ?? 0,
  });
}
