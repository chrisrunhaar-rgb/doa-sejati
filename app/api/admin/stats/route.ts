import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // WIB = UTC+7 — all day-boundary calculations use WIB midnight as a UTC timestamp
  const wibDay = (offsetMs = 0) =>
    new Date(Date.now() + 7 * 3600000 - offsetMs).toISOString().split("T")[0];
  const todayWib = wibDay();
  // WIB midnight as a UTC ISO string (e.g. "2026-04-28T17:00:00.000Z" for WIB Apr 29)
  const todayWibStartUTC = new Date(todayWib + "T00:00:00+07:00").toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const now = new Date().toISOString();

  const [
    totalUsersRes, todayNewUsersRes, pushTokenRes,
    totalPrayersRes, todayPrayersRes, thirtyDayPrayersRes,
    avgStreakRes, streak7Res, streak30Res, pushOpensRes,
  ] = await Promise.all([
    supabase.from("ds_users").select("*", { count: "exact", head: true }),
    supabase.from("ds_users").select("*", { count: "exact", head: true }).gte("created_at", todayWibStartUTC),
    supabase.from("ds_users").select("*", { count: "exact", head: true }).not("push_token", "is", null),
    supabase.from("ds_prayer_logs").select("*", { count: "exact", head: true }).lte("prayed_at", now),
    supabase.from("ds_prayer_logs").select("*", { count: "exact", head: true }).gte("prayed_at", todayWibStartUTC).lte("prayed_at", now),
    supabase.from("ds_prayer_logs").select("*", { count: "exact", head: true }).gte("prayed_at", thirtyDaysAgo).lte("prayed_at", now),
    supabase.from("ds_users").select("streak_count").gt("streak_count", 0),
    supabase.from("ds_users").select("*", { count: "exact", head: true }).gte("streak_count", 7),
    supabase.from("ds_users").select("*", { count: "exact", head: true }).gte("streak_count", 30),
    supabase.from("ds_notification_opens").select("*", { count: "exact", head: true }).gte("opened_at", new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);

  let avgStreak = 0;
  if (avgStreakRes.data && avgStreakRes.data.length > 0) {
    const streaks = avgStreakRes.data as { streak_count: number }[];
    const sum = streaks.reduce((acc, r) => acc + (r.streak_count ?? 0), 0);
    avgStreak = Math.round((sum / streaks.length) * 10) / 10;
  }

  return NextResponse.json({
    totalUsers: totalUsersRes.count ?? 0,
    todayNewUsers: todayNewUsersRes.count ?? 0,
    usersWithPushToken: pushTokenRes.count ?? 0,
    totalPrayers: totalPrayersRes.count ?? 0,
    todayPrayers: todayPrayersRes.count ?? 0,
    thirtyDayPrayers: thirtyDayPrayersRes.count ?? 0,
    avgStreak,
    usersWithStreakOver7: streak7Res.count ?? 0,
    usersWithStreakOver30: streak30Res.count ?? 0,
    pushOpens30d: pushOpensRes.count ?? 0,
  });
}
