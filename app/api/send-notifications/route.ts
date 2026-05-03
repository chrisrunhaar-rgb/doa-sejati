import { NextResponse } from "next/server";
import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase";

export const maxDuration = 300;

// Indonesian timezone groups (IANA zone names → UTC offset)
const WIB_ZONES  = ["Asia/Jakarta", "Asia/Pontianak"];
const WITA_ZONES = ["Asia/Makassar", "Asia/Ujung_Pandang"];
const WIT_ZONES  = ["Asia/Jayapura", "Asia/Ambon"];

function offsetHHMM(now: Date, offsetHours: number): string {
  const local = new Date(now.getTime() + offsetHours * 3600000);
  return `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`;
}

// Returns the current local HH:MM for a given IANA timezone string
function userLocalTime(tz: string | null, now: Date): string {
  if (!tz || WIB_ZONES.includes(tz))  return offsetHHMM(now, 7);
  if (WITA_ZONES.includes(tz))        return offsetHHMM(now, 8);
  if (WIT_ZONES.includes(tz))         return offsetHHMM(now, 9);
  // Overseas or unknown timezone — use Intl, fallback WIB
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(now);
    const h = parts.find(p => p.type === "hour")?.value ?? "07";
    const m = parts.find(p => p.type === "minute")?.value ?? "00";
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  } catch {
    return offsetHHMM(now, 7);
  }
}

// Called by Vercel Cron every minute — sends pushes to users whose notif_time matches their local time now
export async function GET(request: Request) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();

  // Content date is WIB (canonical Indonesian broadcast date)
  const wibDate = new Date(now.getTime() + 7 * 3600000).toISOString().split("T")[0];
  const { data: content } = await supabase
    .from("ds_prayer_content")
    .select("*, people_group:ds_people_groups(name_id, name_en)")
    .eq("scheduled_date", wibDate)
    .single();

  if (!content) {
    return NextResponse.json({ sent: 0, reason: "no content today" });
  }

  // Current local times for each Indonesian timezone
  const wibTime  = offsetHHMM(now, 7);
  const witaTime = offsetHHMM(now, 8);
  const witTime  = offsetHHMM(now, 9);

  // Fetch users whose notification_time matches any of the 3 local times
  const candidateTimes = [...new Set([wibTime, witaTime, witTime])];
  const { data: candidates } = await supabase
    .from("ds_users")
    .select("id, push_token, language, notification_time, timezone")
    .not("push_token", "is", null)
    .in("notification_time", candidateTimes);

  if (!candidates?.length) {
    return NextResponse.json({ sent: 0, reason: "no users at this time" });
  }

  // Filter to users whose timezone-local time matches their chosen notification_time
  const users = candidates.filter(
    u => u.notification_time.slice(0, 5) === userLocalTime(u.timezone, now)
  );

  if (!users.length) {
    return NextResponse.json({ sent: 0, reason: "no users after tz filter" });
  }

  let sent = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    users.map(async (user) => {
      try {
        const title = user.language === "id" ? content.push_title_id : content.push_title_en;
        const body  = user.language === "id" ? content.push_body_id  : content.push_body_en;
        await webpush.sendNotification(
          user.push_token as webpush.PushSubscription,
          JSON.stringify({ title, body, url: "/today" }),
          { urgency: "high" }
        );
        sent++;
      } catch (err) {
        errors.push(String(err));
        if ((err as { statusCode?: number }).statusCode === 410) {
          await supabase.from("ds_users").update({ push_token: null }).eq("id", user.id);
        }
      }
    })
  );

  return NextResponse.json({
    sent,
    errors: errors.slice(0, 5),
    wib: wibTime,
    wita: witaTime,
    wit: witTime,
    candidates: candidates.length,
    matched: users.length,
  });
}
