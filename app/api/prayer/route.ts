import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const { userId, contentId } = await req.json();
  if (!userId || !contentId) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Ensure user row exists (FK constraint on prayer_logs)
  await supabase.from("ds_users").upsert(
    { id: userId, language: "id", notification_time: "07:00", timezone: "Asia/Jakarta" },
    { onConflict: "id", ignoreDuplicates: true }
  );

  // Geolocate from IP on first prayer (sets province for leaderboard)
  const { data: existingUser } = await supabase
    .from("ds_users").select("province").eq("id", userId).single();
  if (!existingUser?.province) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : null;
    if (ip && ip !== "127.0.0.1" && ip !== "::1") {
      try {
        const geo = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: AbortSignal.timeout(3000),
        }).then((r) => r.json());
        if (geo?.country_code === "ID" && geo?.region) {
          await supabase.from("ds_users").update({ province: geo.region }).eq("id", userId);
        }
      } catch {
        // geolocation failed — continue without province
      }
    }
  }

  // Insert prayer log (unique constraint: one per user+content)
  const { error: logError } = await supabase.from("ds_prayer_logs").insert({
    user_id: userId,
    content_id: contentId,
    prayed_at: new Date().toISOString(),
  });

  // Conflict = already prayed — not an error for the caller
  if (logError && logError.code !== "23505") {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  // Update streak
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const { data: profile } = await supabase
    .from("ds_users")
    .select("streak_count, streak_last_date, language, notification_time, timezone")
    .eq("id", userId)
    .single();

  if (profile?.streak_last_date === today) {
    return NextResponse.json({ ok: true, alreadyCounted: true });
  }

  const newStreak =
    profile?.streak_last_date === yesterday
      ? (profile.streak_count || 0) + 1
      : 1;

  await supabase.from("ds_users").upsert(
    {
      id: userId,
      streak_count: newStreak,
      streak_last_date: today,
      last_prayed_at: new Date().toISOString(),
      language: profile?.language ?? "id",
      notification_time: profile?.notification_time ?? "07:00",
      timezone: profile?.timezone ?? "Asia/Jakarta",
    },
    { onConflict: "id" }
  );

  return NextResponse.json({ ok: true, streak: newStreak });
}
