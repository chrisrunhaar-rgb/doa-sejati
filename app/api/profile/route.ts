import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET /api/profile?userId=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "missing userId" }, { status: 400 });

  const supabase = createServiceClient();

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("ds_users").select("*").eq("id", userId).single(),
    supabase.from("ds_prayer_logs").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  return NextResponse.json({ profile: profile ?? null, totalPrayed: count ?? 0 });
}

// PATCH /api/profile — update name, notification_time, language
export async function PATCH(req: Request) {
  const { userId, updates } = await req.json();
  if (!userId) return NextResponse.json({ error: "missing userId" }, { status: 400 });

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("ds_users")
    .upsert({ id: userId, ...updates }, { onConflict: "id" });

  return NextResponse.json({ ok: !error, error: error?.message });
}

// DELETE /api/profile — delete all user data
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "missing userId" }, { status: 400 });

  const supabase = createServiceClient();
  await supabase.from("ds_prayer_logs").delete().eq("user_id", userId);
  await supabase.from("ds_users").delete().eq("id", userId);

  return NextResponse.json({ ok: true });
}
