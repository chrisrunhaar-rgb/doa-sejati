import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export interface UpcomingContent {
  date: string;
  nameId: string;
  nameEn: string;
  titleId: string;
  titleEn: string;
}

interface ContentRow {
  scheduled_date: string;
  push_title_id: string;
  push_title_en: string;
  ds_people_groups: {
    name_id: string;
    name_en: string;
  } | null;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("ds_prayer_content")
    .select(
      "scheduled_date, push_title_id, push_title_en, ds_people_groups(name_id, name_en)"
    )
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .limit(14);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const upcoming: UpcomingContent[] = ((data ?? []) as unknown as ContentRow[]).map((row) => ({
    date: row.scheduled_date,
    nameId: row.ds_people_groups?.name_id ?? "",
    nameEn: row.ds_people_groups?.name_en ?? "",
    titleId: row.push_title_id,
    titleEn: row.push_title_en,
  }));

  return NextResponse.json({ upcoming });
}
