import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const maxDuration = 300;

// Called by Vercel Cron daily — inserts prayer logs for 80% of seed users
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Today's date in WIB
  const today = new Date(Date.now() + 7 * 3600000).toISOString().split("T")[0];

  // Get today's prayer content
  const { data: content } = await supabase
    .from("ds_prayer_content")
    .select("id")
    .eq("scheduled_date", today)
    .single();

  if (!content) {
    return NextResponse.json({ seeded: 0, reason: "no content today" });
  }

  // Get all seed users who haven't prayed today yet
  const { data: seedUsers } = await supabase
    .from("ds_users")
    .select("id, streak_count, streak_last_date, timezone")
    .eq("is_seed_user", true);

  if (!seedUsers?.length) {
    return NextResponse.json({ seeded: 0, reason: "no seed users" });
  }

  // Filter out users who already prayed today
  const { data: alreadyPrayed } = await supabase
    .from("ds_prayer_logs")
    .select("user_id")
    .eq("content_id", content.id)
    .in("user_id", seedUsers.map(u => u.id));

  const alreadyPrayedIds = new Set((alreadyPrayed ?? []).map(r => r.user_id));
  const eligible = seedUsers.filter(u => !alreadyPrayedIds.has(u.id));

  // 80% pray today
  const topray = eligible.filter(() => Math.random() < 0.80);
  if (!topray.length) {
    return NextResponse.json({ seeded: 0, reason: "no eligible users" });
  }

  // Spread prayer times across the day (01:00–14:00 UTC = 08:00–21:00 WIB)
  const logs = topray.map(user => {
    const hourUTC = 1 + Math.floor(Math.random() * 13);
    const min = Math.floor(Math.random() * 60);
    const prayedAt = new Date(`${today}T${String(hourUTC).padStart(2, "0")}:${String(min).padStart(2, "0")}:00Z`).toISOString();
    return { user_id: user.id, content_id: content.id, prayed_at: prayedAt };
  });

  // Insert prayer logs in batches (ignore conflicts)
  const BATCH = 100;
  let seeded = 0;
  for (let i = 0; i < logs.length; i += BATCH) {
    const { error } = await supabase
      .from("ds_prayer_logs")
      .insert(logs.slice(i, i + BATCH));
    if (!error) seeded += Math.min(BATCH, logs.length - i);
  }

  // Update streaks for prayed users
  for (const user of topray) {
    function localDate(tz: string, base = new Date()): string {
      try { return base.toLocaleDateString("en-CA", { timeZone: tz }); }
      catch { return new Date(base.getTime() + 7 * 3600000).toISOString().split("T")[0]; }
    }
    const userTz = user.timezone || "Asia/Jakarta";
    const userToday = localDate(userTz);
    const userYesterday = localDate(userTz, new Date(Date.now() - 86400000));
    const newStreak = user.streak_last_date === userYesterday
      ? (user.streak_count || 0) + 1 : 1;
    await supabase
      .from("ds_users")
      .update({ streak_count: newStreak, streak_last_date: userToday, last_prayed_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  return NextResponse.json({ seeded, total_seed_users: seedUsers.length, today });
}
