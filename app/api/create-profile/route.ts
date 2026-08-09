import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const maxDuration = 15;

// ISO 3166-2:ID subdivision code → Indonesian province name
const ID_PROVINCES: Record<string, string> = {
  AC: "Aceh",
  BA: "Bali",
  BB: "Kepulauan Bangka Belitung",
  BE: "Bengkulu",
  BT: "Banten",
  GO: "Gorontalo",
  JA: "Jambi",
  JB: "Jawa Barat",
  JI: "Jawa Timur",
  JK: "DKI Jakarta",
  JT: "Jawa Tengah",
  KB: "Kalimantan Barat",
  KI: "Kalimantan Timur",
  KR: "Kepulauan Riau",
  KS: "Kalimantan Selatan",
  KT: "Kalimantan Tengah",
  KU: "Kalimantan Utara",
  LA: "Lampung",
  MA: "Maluku",
  MU: "Maluku Utara",
  NB: "Nusa Tenggara Barat",
  NT: "Nusa Tenggara Timur",
  PA: "Papua",
  PB: "Papua Barat",
  PD: "Papua Barat Daya",
  PE: "Papua Pegunungan",
  PS: "Papua Selatan",
  PT: "Papua Tengah",
  RI: "Riau",
  SA: "Sulawesi Utara",
  SB: "Sumatera Barat",
  SG: "Sulawesi Tenggara",
  SN: "Sulawesi Selatan",
  SR: "Sulawesi Barat",
  SS: "Sumatera Selatan",
  ST: "Sulawesi Tengah",
  SU: "Sumatera Utara",
  YO: "DI Yogyakarta",
};

// Uses Vercel's built-in geo headers (MaxMind GeoIP2) — no external API, no rate limits
function detectProvince(req: Request): string | null {
  const country = req.headers.get("x-vercel-ip-country");
  if (!country) return null;
  if (country !== "ID") return "Luar Negeri";

  const region = req.headers.get("x-vercel-ip-country-region");
  if (!region) return null;

  return ID_PROVINCES[region] ?? null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { userId, name, language, notification_time, timezone, push_token, user_token, pwa_installed_at } = body;

  if (!userId) return NextResponse.json({ ok: false, error: "missing userId" }, { status: 400 });

  const supabase = createServiceClient();

  const province = detectProvince(req);

  const profileResult = await supabase.from("ds_users").upsert(
    { id: userId, name, language, notification_time, timezone, push_token, user_token, pwa_installed_at },
    { onConflict: "id" }
  );

  if (profileResult.error) {
    return NextResponse.json({ ok: false, error: profileResult.error.message }, { status: 500 });
  }

  if (province) {
    await supabase.from("ds_users").update({ province }).eq("id", userId);
  }

  return NextResponse.json({ ok: true, province });
}
