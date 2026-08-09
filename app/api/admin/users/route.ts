import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  name: string | null;
  language: string | null;
  province: string | null;
  streak_count: number | null;
  created_at: string;
  last_prayed_at: string | null;
  user_number: number | null;
}

export interface ProvinceEntry {
  province: string;
  warrior_count: number;
}

export interface NotifTimeEntry {
  notification_time: string;
  user_count: number;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const [recentRes, provinceRes, notifTimeRes] = await Promise.all([
    supabase
      .from("ds_users")
      .select("id, name, language, province, streak_count, created_at, last_prayed_at, user_number")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("ds_province_leaderboard")
      .select("province, warrior_count")
      .order("warrior_count", { ascending: false })
      .limit(10),
    supabase
      .from("ds_users")
      .select("notification_time")
      .not("notification_time", "is", null),
  ]);

  // Aggregate notification times in code (no GROUP BY in Supabase JS client)
  const timeCounts: Record<string, number> = {};
  for (const row of (notifTimeRes.data ?? []) as { notification_time: string }[]) {
    const t = row.notification_time;
    timeCounts[t] = (timeCounts[t] ?? 0) + 1;
  }
  const notifTop5: NotifTimeEntry[] = Object.entries(timeCounts)
    .map(([notification_time, user_count]) => ({ notification_time, user_count }))
    .sort((a, b) => b.user_count - a.user_count)
    .slice(0, 5);

  return NextResponse.json({
    recent: (recentRes.data ?? []) as AdminUser[],
    provinceTop10: (provinceRes.data ?? []) as ProvinceEntry[],
    notifTop5,
  });
}
