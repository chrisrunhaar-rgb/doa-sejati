import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export interface UpcomingContent {
  date: string;
  nameId: string;
  nameEn: string;
  titleId: string;
  titleEn: string;
  prayerTextId: string;
  prayerTextEn: string;
  prayerPointsId: string[];
  prayerPointsEn: string[];
  population: number;
  province: string;
  island: string;
}

interface ContentRow {
  scheduled_date: string;
  push_title_id: string;
  push_title_en: string;
  prayer_text_id: string;
  prayer_text_en: string;
  prayer_points_id: string[];
  prayer_points_en: string[];
  ds_people_groups: {
    name_id: string;
    name_en: string;
    province: string;
    island: string;
    population: number;
  } | null;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const today = new Date(Date.now() + 7 * 3600000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("ds_prayer_content")
    .select(
      "scheduled_date, push_title_id, push_title_en, prayer_text_id, prayer_text_en, prayer_points_id, prayer_points_en, ds_people_groups(name_id, name_en, province, island, population)"
    )
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const upcoming: UpcomingContent[] = ((data ?? []) as unknown as ContentRow[]).map((row) => ({
    date: row.scheduled_date,
    nameId: row.ds_people_groups?.name_id ?? "",
    nameEn: row.ds_people_groups?.name_en ?? "",
    titleId: row.push_title_id,
    titleEn: row.push_title_en,
    prayerTextId: row.prayer_text_id ?? "",
    prayerTextEn: row.prayer_text_en ?? "",
    prayerPointsId: row.prayer_points_id ?? [],
    prayerPointsEn: row.prayer_points_en ?? [],
    population: row.ds_people_groups?.population ?? 0,
    province: row.ds_people_groups?.province ?? "",
    island: row.ds_people_groups?.island ?? "",
  }));

  return NextResponse.json({ upcoming });
}
