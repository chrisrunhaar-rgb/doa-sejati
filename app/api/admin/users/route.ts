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
}

export interface ProvinceEntry {
  province: string;
  warrior_count: number;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const [recentRes, provinceRes] = await Promise.all([
    supabase
      .from("ds_users")
      .select("id, name, language, province, streak_count, created_at, last_prayed_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("ds_province_leaderboard")
      .select("province, warrior_count")
      .order("warrior_count", { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json({
    recent: (recentRes.data ?? []) as AdminUser[],
    provinceTop10: (provinceRes.data ?? []) as ProvinceEntry[],
  });
}
