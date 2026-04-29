import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const maxDuration = 15;

async function detectProvince(req: Request): Promise<string | null> {
  // Vercel country header (server-side, always accurate)
  const vercelCountry = req.headers.get("x-vercel-ip-country");

  if (vercelCountry && vercelCountry !== "ID") return "Luar Negeri";

  // Resolve full Indonesian province name via ipapi.co
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : null;
  if (!ip || ip === "127.0.0.1" || ip === "::1") return null;

  try {
    const geo = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(4000),
    }).then((r) => r.json());

    if (geo?.country_code === "ID" && geo?.region) return geo.region as string;
    if (geo?.country_code && geo.country_code !== "ID") return "Luar Negeri";
  } catch {
    // geolocation failed
  }
  return null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { userId, name, language, notification_time, timezone, push_token, user_token } = body;

  if (!userId) return NextResponse.json({ ok: false, error: "missing userId" }, { status: 400 });

  const supabase = createServiceClient();

  // Save profile and detect province concurrently
  const [profileResult, province] = await Promise.all([
    supabase.from("ds_users").upsert(
      { id: userId, name, language, notification_time, timezone, push_token, user_token },
      { onConflict: "id" }
    ),
    detectProvince(req),
  ]);

  if (profileResult.error) {
    return NextResponse.json({ ok: false, error: profileResult.error.message }, { status: 500 });
  }

  if (province) {
    await supabase.from("ds_users").update({ province }).eq("id", userId);
  }

  return NextResponse.json({ ok: true, province });
}
