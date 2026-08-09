import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const contentId = searchParams.get("contentId");
  if (!userId || !contentId) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("ds_prayer_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .single();
  return NextResponse.json({ hasPrayed: !!data });
}

export async function POST(req: Request) {
  const { userId, contentId } = await req.json();
  if (!userId || !contentId) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify user token when provided (new accounts always have one)
  const userToken = req.headers.get("x-user-token");
  if (userToken) {
    const { data: tokenCheck } = await supabase
      .from("ds_users")
      .select("id")
      .eq("id", userId)
      .eq("user_token", userToken)
      .single();
    if (!tokenCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Ensure user row exists (FK constraint on prayer_logs)
  await supabase.from("ds_users").upsert(
    { id: userId, language: "id", notification_time: "07:00", timezone: "Asia/Jakarta" },
    { onConflict: "id", ignoreDuplicates: true }
  );

  // Geolocate from Vercel headers on first prayer (fallback if create-profile didn't set it)
  const { data: existingUser } = await supabase
    .from("ds_users").select("province").eq("id", userId).single();
  if (!existingUser?.province) {
    const country = req.headers.get("x-vercel-ip-country");
    if (country && country !== "ID") {
      await supabase.from("ds_users").update({ province: "Luar Negeri" }).eq("id", userId);
    } else if (country === "ID") {
      const region = req.headers.get("x-vercel-ip-country-region");
      if (region) {
        const ID_PROVINCES: Record<string, string> = {
          AC: "Aceh", BA: "Bali", BB: "Kepulauan Bangka Belitung", BE: "Bengkulu",
          BT: "Banten", GO: "Gorontalo", JA: "Jambi", JB: "Jawa Barat",
          JI: "Jawa Timur", JK: "DKI Jakarta", JT: "Jawa Tengah",
          KB: "Kalimantan Barat", KI: "Kalimantan Timur", KR: "Kepulauan Riau",
          KS: "Kalimantan Selatan", KT: "Kalimantan Tengah", KU: "Kalimantan Utara",
          LA: "Lampung", MA: "Maluku", MU: "Maluku Utara",
          NB: "Nusa Tenggara Barat", NT: "Nusa Tenggara Timur",
          PA: "Papua", PB: "Papua Barat", PD: "Papua Barat Daya",
          PE: "Papua Pegunungan", PS: "Papua Selatan", PT: "Papua Tengah",
          RI: "Riau", SA: "Sulawesi Utara", SB: "Sumatera Barat",
          SG: "Sulawesi Tenggara", SN: "Sulawesi Selatan", SR: "Sulawesi Barat",
          SS: "Sumatera Selatan", ST: "Sulawesi Tengah", SU: "Sumatera Utara",
          YO: "DI Yogyakarta",
        };
        const province = ID_PROVINCES[region];
        if (province) await supabase.from("ds_users").update({ province }).eq("id", userId);
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

  // Update streak — use user's own timezone for correct day boundaries
  function localDate(tz: string, base = new Date()): string {
    try { return base.toLocaleDateString("en-CA", { timeZone: tz }); }
    catch { return new Date(base.getTime() + 7 * 3600000).toISOString().split("T")[0]; }
  }

  const { data: profile } = await supabase
    .from("ds_users")
    .select("streak_count, streak_last_date, language, notification_time, timezone")
    .eq("id", userId)
    .single();

  const userTz    = profile?.timezone || "Asia/Jakarta";
  const today     = localDate(userTz);
  const yesterday = localDate(userTz, new Date(Date.now() - 86400000));

  if (profile?.streak_last_date === today) {
    return NextResponse.json({ ok: true, alreadyCounted: true, streak: profile.streak_count });
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
