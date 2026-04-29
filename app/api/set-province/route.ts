import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

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

    return NextResponse.json({ ok: true, province });
  } catch {
    return NextResponse.json({ ok: false, reason: "geo-failed" });
  }
}
