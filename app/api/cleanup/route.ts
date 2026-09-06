import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { extendDemoPrayerLogs } from "@/lib/demo-data";

export const maxDuration = 60;

// Called by Vercel Cron weekly — deletes prayer logs older than 40 days,
// then extends the rolling demo dataset by one week so it stays self-sustaining
// (see lib/demo-data.ts for why: the demo dataset was a static one-time load
// that this same weekly deletion was otherwise running dry with no refill).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Deletion logic unchanged — do not modify the threshold or behavior here.
  const cutoff = new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString();

  const { count, error } = await supabase
    .from("ds_prayer_logs")
    .delete({ count: "exact" })
    .lt("prayed_at", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let extension: Awaited<ReturnType<typeof extendDemoPrayerLogs>> | null = null;
  try {
    extension = await extendDemoPrayerLogs(supabase);
  } catch (e) {
    // Never let a demo-data generation failure mask/undo the (already-committed) deletion above.
    return NextResponse.json({
      deleted: count ?? 0,
      cutoff,
      message: `Deleted ${count ?? 0} prayer logs older than 40 days`,
      extension_error: e instanceof Error ? e.message : String(e),
    });
  }

  return NextResponse.json({
    deleted: count ?? 0,
    cutoff,
    message: `Deleted ${count ?? 0} prayer logs older than 40 days`,
    extended: extension.extended,
    extension_days_added: extension.daysAdded,
    extension_from_date: extension.fromDate,
    extension_to_date: extension.toDate,
    extension_skipped_days: extension.skippedDays,
    demo_user_count: extension.demoUserCount,
  });
}
