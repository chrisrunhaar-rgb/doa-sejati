import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

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

  // Server-side aggregation in WIB (UTC+7) — avoids 1000-row client limit
  const { data, error } = await supabase.rpc("get_prayer_volume", { days_back: 30 });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build counts map from RPC result
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { day: string; cnt: number }[]) {
    counts[row.day] = Number(row.cnt);
  }

  // Full 30-day series in WIB, fill zeros for missing days
  const wibDate = (msOffset: number) =>
    new Date(Date.now() + 7 * 3600000 - msOffset).toISOString().split("T")[0];

  const volume: VolumeEntry[] = [];
  for (let i = 29; i >= 0; i--) {
    const dateStr = wibDate(i * 86400000);
    volume.push({ date: dateStr, count: counts[dateStr] ?? 0 });
  }

  return NextResponse.json({ volume });
}
