import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

interface PrayerLog {
  prayed_at: string;
}

interface VolumeEntry {
  date: string;
  count: number;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const since = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data, error } = await supabase
    .from("ds_prayer_logs")
    .select("prayed_at")
    .gte("prayed_at", since);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by date in JS
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as PrayerLog[]) {
    const date = row.prayed_at.split("T")[0];
    counts[date] = (counts[date] ?? 0) + 1;
  }

  // Build full 30-day series (fill zeros for missing days)
  const volume: VolumeEntry[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    volume.push({ date: dateStr, count: counts[dateStr] ?? 0 });
  }

  return NextResponse.json({ volume });
}
