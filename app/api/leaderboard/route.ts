import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export interface ProvinceLeaderboard {
  province: string;
  warrior_count: number;
  prayers_90d: number;
}

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("ds_province_leaderboard")
    .select("*")
    .order("warrior_count", { ascending: false });

  return NextResponse.json({ leaderboard: (data as ProvinceLeaderboard[]) ?? [] });
}
