import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const maxDuration = 60;

// Called by Vercel Cron weekly — deletes prayer logs older than 40 days
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const cutoff = new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString();

  const { count, error } = await supabase
    .from("ds_prayer_logs")
    .delete({ count: "exact" })
    .lt("prayed_at", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    deleted: count ?? 0,
    cutoff,
    message: `Deleted ${count ?? 0} prayer logs older than 40 days`,
  });
}
