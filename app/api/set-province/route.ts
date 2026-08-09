import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { userId } = await req.json().catch(() => ({}));
  if (!userId) return NextResponse.json({ ok: false });

  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("ds_users")
    .select("province")
    .eq("id", userId)
    .single();

  if (user?.province) return NextResponse.json({ ok: true, province: user.province });

  // Try Vercel's injected geo headers first (most reliable on Vercel infra)
  const vercelCountry = req.headers.get("x-vercel-ip-country");
  const vercelRegion = req.headers.get("x-vercel-ip-region");

  if (vercelCountry) {
    let province: string | null = null;
    if (vercelCountry === "ID" && vercelRegion) {
      province = vercelRegion;
    } else if (vercelCountry !== "ID") {
      province = "Luar Negeri";
    }
    if (province) {
      await supabase.from("ds_users").update({ province }).eq("id", userId);
    }
    return NextResponse.json({ ok: true, province, source: "vercel-geo" });
  }

  // Fallback: IP-based lookup
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : null;
  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    return NextResponse.json({ ok: false, reason: "no-ip" });
  }

  try {
    const geo = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(3000),
    }).then((r) => r.json());

    let province: string | null = null;
    if (geo?.country_code === "ID" && geo?.region) {
      province = geo.region;
    } else if (geo?.country_code && geo.country_code !== "ID") {
      province = "Luar Negeri";
    }

    if (province) {
      await supabase.from("ds_users").update({ province }).eq("id", userId);
    }

    return NextResponse.json({ ok: true, province, source: "ipapi" });
  } catch {
    return NextResponse.json({ ok: false, reason: "geo-failed" });
  }
}
