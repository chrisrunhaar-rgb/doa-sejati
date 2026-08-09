import csv
import json
import os
import requests
import re
import sys

SUPABASE_URL = "https://api.supabase.com/v1/projects/miegjduhwekszuaestzh/database/query"
ACCESS_TOKEN = os.environ["SUPABASE_ACCESS_TOKEN"]  # set before running: export SUPABASE_ACCESS_TOKEN=sbp_...
CSV_PATH = r"C:\Users\user\Documents\Doa Sejati\Data\New Microsoft Excel Worksheet - UPDATE 29042026.csv"

def slugify(s):
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def run_sql(sql):
    resp = requests.post(
        SUPABASE_URL,
        headers={"Authorization": f"Bearer {ACCESS_TOKEN}", "Content-Type": "application/json"},
        json={"query": sql},
        timeout=30,
    )
    return resp.json()

# ── Load CSV ──────────────────────────────────────────────────────────────────
with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"Loaded {len(rows)} rows from CSV")

# ── Build unique UPGs (slug-keyed) ────────────────────────────────────────────
upgs = {}
for row in rows:
    name_en = row["UPG Name (EN)"].strip()
    uid = slugify(name_en)
    if uid not in upgs:
        upgs[uid] = {
            "id": uid,
            "name_en": name_en,
            "name_id": row["UPG Name (ID)"].strip(),
            "province": row["Province"].strip(),
            "island": row["Island"].strip(),
            "population": int(row["Population"].replace(",", "").strip()),
            "religion": row["Religion"].strip(),
            "progress_scale": int(row["Gospel Progress (0-6)"].strip()),
        }

print(f"Unique UPGs: {len(upgs)}")

# ── Upsert UPGs in batches of 50 ─────────────────────────────────────────────
upg_list = list(upgs.values())
errors = []

for i in range(0, len(upg_list), 50):
    batch = upg_list[i : i + 50]
    vals = ",\n".join(
        f"({esc(u['id'])},{esc(u['name_en'])},{esc(u['name_id'])},{esc(u['province'])},{esc(u['island'])},{u['population']},{esc(u['religion'])},{u['progress_scale']},'none')"
        for u in batch
    )
    sql = f"""
INSERT INTO ds_people_groups (id,name_en,name_id,province,island,population,religion,progress_scale,bible_access)
VALUES {vals}
ON CONFLICT (id) DO UPDATE SET
  name_en=EXCLUDED.name_en, name_id=EXCLUDED.name_id,
  province=EXCLUDED.province, island=EXCLUDED.island,
  population=EXCLUDED.population, religion=EXCLUDED.religion,
  progress_scale=EXCLUDED.progress_scale;
"""
    result = run_sql(sql)
    if isinstance(result, list) and len(result) == 0:
        print(f"  UPG batch {i//50+1}: OK")
    else:
        print(f"  UPG batch {i//50+1}: {result}")
        if isinstance(result, dict) and "message" in result:
            errors.append(("upg", i, result))

if errors:
    print("Errors in UPG upsert — stopping.")
    sys.exit(1)

# ── Upsert prayer content in batches of 20 ───────────────────────────────────
for i in range(0, len(rows), 20):
    batch = rows[i : i + 20]
    vals = []
    for row in batch:
        d = row["Date"].strip().split("/")
        date_str = f"{d[2]}-{d[1]}-{d[0]}"  # dd/mm/yyyy -> yyyy-mm-dd

        name_en = row["UPG Name (EN)"].strip()
        upg_id = slugify(name_en)

        pp_en = json.dumps([
            row["Prayer Point 1 (EN)"].strip(),
            row["Prayer Point 2 (EN)"].strip(),
            row["Prayer Point 3 (EN)"].strip(),
        ])
        pp_id = json.dumps([
            row["Prayer Point 1 (ID)"].strip(),
            row["Prayer Point 2 (ID)"].strip(),
            row["Prayer Point 3 (ID)"].strip(),
        ])

        vals.append(
            f"(gen_random_uuid(),{esc(upg_id)},{esc(date_str)},"
            f"{esc(row['Push Title (EN)'].strip())},{esc(row['Push Title (ID)'].strip())},"
            f"{esc(row['Push Body (EN)'].strip())},{esc(row['Push Body (ID)'].strip())},"
            f"{esc(row['Prayer Text (EN)'].strip())},{esc(row['Prayer Text (ID)'].strip())},"
            f"{esc(pp_en)}::jsonb,{esc(pp_id)}::jsonb)"
        )

    sql = f"""
INSERT INTO ds_prayer_content
  (id,people_group_id,scheduled_date,
   push_title_en,push_title_id,push_body_en,push_body_id,
   prayer_text_en,prayer_text_id,prayer_points_en,prayer_points_id)
VALUES {','.join(vals)}
ON CONFLICT (scheduled_date) DO UPDATE SET
  people_group_id=EXCLUDED.people_group_id,
  push_title_en=EXCLUDED.push_title_en, push_title_id=EXCLUDED.push_title_id,
  push_body_en=EXCLUDED.push_body_en, push_body_id=EXCLUDED.push_body_id,
  prayer_text_en=EXCLUDED.prayer_text_en, prayer_text_id=EXCLUDED.prayer_text_id,
  prayer_points_en=EXCLUDED.prayer_points_en, prayer_points_id=EXCLUDED.prayer_points_id;
"""
    result = run_sql(sql)
    if isinstance(result, list) and len(result) == 0:
        print(f"  Content batch {i//20+1}/{(len(rows)-1)//20+1}: OK ({date_str})")
    else:
        print(f"  Content batch {i//20+1}: {result}")
        errors.append(("content", i, result))

if errors:
    print(f"\n{len(errors)} error(s):")
    for e in errors:
        print(e)
else:
    print(f"\nDone. {len(upgs)} UPGs + {len(rows)} content rows upserted.")
