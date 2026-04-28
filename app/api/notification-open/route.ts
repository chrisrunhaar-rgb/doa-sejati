import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const { userId } = await req.json().catch(() => ({}));
  if (!userId) return NextResponse.json({ ok: false });

  const supabase = createServiceClient();
  await supabase.from("ds_notification_opens").insert({ user_id: userId });

  return NextResponse.json({ ok: true });
}
