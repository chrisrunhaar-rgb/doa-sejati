import { SupabaseClient } from "@supabase/supabase-js";

// Demo accounts are the ~350 "DEMO###"-named ds_users rows Chris loaded
// deliberately to keep the map/activity feed looking alive. This module keeps
// that dataset rolling forward so it never runs dry, and keeps every demo
// prayer log timestamped as morning activity (6:00-10:00 WIB), which is what
// the public-facing "prayers today" / map counts actually surface.

const DEMO_NAME_PATTERN = "DEMO%";
const DAYS_TO_EXTEND = 7; // one week per cleanup cron run, matches the one week of data the cron deletes
const MORNING_START_HOUR_WIB = 6;
const MORNING_WINDOW_HOURS = 4; // 6:00-10:00 WIB
const DEMO_PARTICIPATION_RATE = 0.83; // ~290 of 350 users/day, matches historical 284-308/day range
const INSERT_BATCH_SIZE = 100;

export interface ExtendDemoResult {
  extended: number;
  daysAdded: number;
  fromDate: string | null;
  toDate: string | null;
  skippedDays: string[];
  demoUserCount: number;
}

/** Random timestamp (ISO, UTC) falling within 6:00-10:00 WIB on the given WIB calendar date (YYYY-MM-DD). */
function randomMorningTimeWIB(wibDateISO: string): string {
  const midnightWibAsUTC = new Date(`${wibDateISO}T00:00:00+07:00`);
  const offsetMs =
    (MORNING_START_HOUR_WIB * 3600 + Math.random() * MORNING_WINDOW_HOURS * 3600) * 1000;
  return new Date(midnightWibAsUTC.getTime() + offsetMs).toISOString();
}

/**
 * Extends the demo ds_prayer_logs dataset by one week (rolling window), so the
 * weekly cleanup cron's 40-day deletion is offset by an equal weekly injection
 * of fresh future-dated demo rows instead of letting the static dataset run dry.
 *
 * All generated rows land within 6:00-10:00 WIB per Chris's fix for the
 * "morning prayer count looks low" complaint (root cause: the old static
 * dataset's remaining rows clustered in the evening, 19:00-23:00 WIB).
 */
export async function extendDemoPrayerLogs(
  supabase: SupabaseClient
): Promise<ExtendDemoResult> {
  const { data: demoUsers, error: usersErr } = await supabase
    .from("ds_users")
    .select("id")
    .like("name", DEMO_NAME_PATTERN);

  if (usersErr || !demoUsers?.length) {
    return {
      extended: 0,
      daysAdded: 0,
      fromDate: null,
      toDate: null,
      skippedDays: [],
      demoUserCount: 0,
    };
  }
  const demoUserIds = demoUsers.map((u) => u.id as string);

  // Find the current future ceiling of the demo dataset (latest prayed_at
  // among demo-account rows specifically — filtered via the FK-embedded join
  // so we never have to pass a 350-item id list through a query string).
  const { data: maxRow } = await supabase
    .from("ds_prayer_logs")
    .select("prayed_at, ds_users!inner(name)")
    .ilike("ds_users.name", DEMO_NAME_PATTERN)
    .order("prayed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const maxPrayedAt = maxRow?.prayed_at ? new Date(maxRow.prayed_at as string) : new Date();
  const maxWibDateISO = new Date(maxPrayedAt.getTime() + 7 * 3600000)
    .toISOString()
    .split("T")[0];

  let extended = 0;
  let daysAdded = 0;
  const skippedDays: string[] = [];
  let fromDate: string | null = null;
  let toDate: string | null = null;

  for (let i = 1; i <= DAYS_TO_EXTEND; i++) {
    const targetDate = new Date(`${maxWibDateISO}T00:00:00Z`);
    targetDate.setUTCDate(targetDate.getUTCDate() + i);
    const targetDateISO = targetDate.toISOString().split("T")[0];

    // Every demo row needs a valid content_id (FK -> ds_prayer_content).
    const { data: content } = await supabase
      .from("ds_prayer_content")
      .select("id")
      .eq("scheduled_date", targetDateISO)
      .maybeSingle();

    if (!content) {
      skippedDays.push(targetDateISO);
      continue;
    }

    const participants = demoUserIds.filter(() => Math.random() < DEMO_PARTICIPATION_RATE);
    const rows = participants.map((userId) => ({
      user_id: userId,
      content_id: content.id,
      prayed_at: randomMorningTimeWIB(targetDateISO),
    }));

    for (let b = 0; b < rows.length; b += INSERT_BATCH_SIZE) {
      const batch = rows.slice(b, b + INSERT_BATCH_SIZE);
      const { data: inserted, error } = await supabase
        .from("ds_prayer_logs")
        // upsert + ignoreDuplicates guards the (user_id, content_id) unique
        // constraint in case this ever re-runs over an already-seeded day.
        .upsert(batch, { onConflict: "user_id,content_id", ignoreDuplicates: true })
        .select("id");
      if (!error) extended += inserted?.length ?? 0;
    }

    daysAdded += 1;
    if (!fromDate) fromDate = targetDateISO;
    toDate = targetDateISO;
  }

  return { extended, daysAdded, fromDate, toDate, skippedDays, demoUserCount: demoUserIds.length };
}
