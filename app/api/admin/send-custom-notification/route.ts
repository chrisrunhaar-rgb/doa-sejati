import { NextResponse } from "next/server";
import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase";

export const maxDuration = 120;

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title_id, body_id, title_en, body_en, url = "/today" } = await req.json();

  if (!title_id || !body_id || !title_en || !body_en) {
    return NextResponse.json({ error: "Missing required fields: title_id, body_id, title_en, body_en" }, { status: 400 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const supabase = createServiceClient();

  const { data: users } = await supabase
    .from("ds_users")
    .select("id, push_token, language")
    .not("push_token", "is", null);

  if (!users?.length) {
    return NextResponse.json({ sent: 0, reason: "no push-enabled users" });
  }

  let sent = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    users.map(async (user) => {
      try {
        const title = user.language === "id" ? title_id : title_en;
        const body  = user.language === "id" ? body_id  : body_en;
        await webpush.sendNotification(
          user.push_token as webpush.PushSubscription,
          JSON.stringify({ title, body, url }),
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

  return NextResponse.json({ sent, total: users.length, errors: errors.slice(0, 5) });
}
