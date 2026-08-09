import { NextResponse } from "next/server";
import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase";

export const maxDuration = 300;

// Manual-trigger route for ONE-OFF promotional pushes (e.g. "share Doa Sejati with your
// church"). NOT on any cron schedule — must be called explicitly with { slug } in the body.
// Scaffolded 2026-08-02 per THEO push-infra task. NOT wired up to send to real users yet —
// requires: (1) migration in doa_sejati_promo_push_migration.sql applied, (2) a row inserted
// into ds_push_campaigns, (3) explicit manual POST with CRON_SECRET, per Chris's approval.
//
// Respects:
//  - ds_users.push_optout_promo — users who opted out of promo pushes are skipped
//  - ds_push_sends unique(campaign_id, user_id) — a user can't be double-sent the same
//    campaign even if this route is called twice
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await request.json().catch(() => ({ slug: null }));
  if (!slug) {
    return NextResponse.json({ error: "Missing campaign slug" }, { status: 400 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const supabase = createServiceClient();

  const { data: campaign } = await supabase
    .from("ds_push_campaigns")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Users eligible: have a push token, have NOT opted out of promo pushes,
  // have NOT already received this specific campaign.
  const { data: alreadySent } = await supabase
    .from("ds_push_sends")
    .select("user_id")
    .eq("campaign_id", campaign.id);
  const alreadySentIds = new Set((alreadySent ?? []).map((r) => r.user_id));

  const { data: candidates } = await supabase
    .from("ds_users")
    .select("id, push_token, language")
    .not("push_token", "is", null)
    .eq("push_optout_promo", false);

  const users = (candidates ?? []).filter((u) => !alreadySentIds.has(u.id));

  if (!users.length) {
    return NextResponse.json({ sent: 0, reason: "no eligible users" });
  }

  let sent = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    users.map(async (user) => {
      try {
        const title = user.language === "id" ? campaign.title_id : campaign.title_en;
        const body  = user.language === "id" ? campaign.body_id  : campaign.body_en;
        await webpush.sendNotification(
          user.push_token as webpush.PushSubscription,
          JSON.stringify({ title, body, url: campaign.url }),
          { urgency: "high", TTL: 60 }
        );
        sent++;
        await supabase.from("ds_push_sends").insert({
          campaign_id: campaign.id,
          user_id: user.id,
        });
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
    eligible: users.length,
    messageType: campaign.message_type,
  });
}
