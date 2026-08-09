import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import path from "path";

const supabase = createClient(
  "https://miegjduhwekszuaestzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZWdqZHVod2Vrc3p1YWVzdHpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU2MDgxOCwiZXhwIjoyMDkyMTM2ODE4fQ.5XBGwjaA-AaMWSa4KWxLD--pNcWzD-SWk_OkSCnPgKY"
);

const OUT = "C:/Users/user/Documents/Doa Sejati/Data/prayer-content-export.csv";

function csvEscape(val) {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

async function main() {
  let allRows = [];
  let from = 0;
  const pageSize = 200;

  while (true) {
    const { data, error } = await supabase
      .from("ds_prayer_content")
      .select("scheduled_date, prayer_text_en, prayer_text_id, prayer_points_en, prayer_points_id, push_title_en, push_title_id, push_body_en, push_body_id, people_group:ds_people_groups(name_en, name_id, province, island, population, religion, progress_scale)")
      .order("scheduled_date")
      .range(from, from + pageSize - 1);

    if (error) { console.error(error); process.exit(1); }
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Fetched ${allRows.length} rows`);

  const headers = [
    "Date",
    "UPG Name (EN)", "UPG Name (ID)",
    "Province", "Island", "Population", "Religion", "Gospel Progress (0-6)",
    "Push Title (EN)", "Push Title (ID)",
    "Push Body (EN)", "Push Body (ID)",
    "Prayer Text (EN)", "Prayer Text (ID)",
    "Prayer Point 1 (EN)", "Prayer Point 2 (EN)", "Prayer Point 3 (EN)",
    "Prayer Point 1 (ID)", "Prayer Point 2 (ID)", "Prayer Point 3 (ID)",
  ];

  const lines = [headers.map(csvEscape).join(",")];

  for (const row of allRows) {
    const pg = row.people_group;
    const ptsEn = row.prayer_points_en || [];
    const ptsId = row.prayer_points_id || [];
    const cols = [
      row.scheduled_date,
      pg?.name_en, pg?.name_id,
      pg?.province, pg?.island, pg?.population, pg?.religion, pg?.progress_scale,
      row.push_title_en, row.push_title_id,
      row.push_body_en, row.push_body_id,
      row.prayer_text_en, row.prayer_text_id,
      ptsEn[0], ptsEn[1], ptsEn[2],
      ptsId[0], ptsId[1], ptsId[2],
    ];
    lines.push(cols.map(csvEscape).join(","));
  }

  writeFileSync(OUT, lines.join("\r\n"), "utf8");
  console.log(`✅ Exported to: ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
