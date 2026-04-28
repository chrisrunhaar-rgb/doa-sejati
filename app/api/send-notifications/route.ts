import { NextResponse } from "next/server";
import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase";

// Called by Vercel Cron — sends pushes to users whose notif_time matches now
export async function GET(request: Request) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  // Verify cron secret to prevent public triggers
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get today's prayer content
  const today = new Date().toISOString().split("T")[0];
  const { data: content } = await supabase
    .from("ds_prayer_content")
    .select("*, people_group:ds_people_groups(name_id, name_en)")
    .eq("scheduled_date", today)
    .single();

  if (!content) {
    return NextResponse.json({ sent: 0, reason: "no content today" });
  }

  // Current time in HH:MM (UTC — users' notification_time should be stored in their local time)
  // For MVP: compare against UTC time; refine to per-timezone later
  const now = new Date();
  const hhmm = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;

  // Get users due for notification now (within the current minute)
  const { data: users } = await supabase
    .from("ds_users")
    .select("id, push_token, language, notification_time")
    .not("push_token", "is", null)
    .eq("notification_time", hhmm);

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0, time: hhmm });
  }

  let sent = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    users.map(async (user) => {
      try {
        const title =
          user.language === "id" ? content.push_title_id : content.push_title_en;
        const body =
          user.language === "id" ? content.push_body_id : content.push_body_en;

        await webpush.sendNotification(
          user.push_token as webpush.PushSubscription,
          JSON.stringify({ title, body, url: "/today" })
        );
        sent++;
      } catch (err) {
        errors.push(String(err));
        // Remove expired/invalid subscriptions
        if ((err as { statusCode?: number }).statusCode === 410) {
          await supabase
            .from("ds_users")
            .update({ push_token: null })
            .eq("id", user.id);
        }
      }
    })
  );

  return NextResponse.json({ sent, errors: errors.slice(0, 5), time: hhmm });
}
