import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

async function verifyToken(req: Request, userId: string, supabase: ReturnType<typeof createServiceClient>): Promise<boolean> {
  const userToken = req.headers.get("x-user-token");
  if (!userToken) return true; // legacy accounts without token — allow through
  const { data } = await supabase
    .from("ds_users")
    .select("id")
    .eq("id", userId)
    .eq("user_token", userToken)
    .single();
  return !!data;
}

// POST /api/pwa-install — record that a user installed the app as a PWA
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { userId } = body;
  if (!userId) return NextResponse.json({ ok: false, error: "missing userId" }, { status: 400 });

  const supabase = createServiceClient();
  if (!(await verifyToken(req, userId, supabase))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Don't overwrite an existing timestamp (idempotent — appinstalled can fire more than once)
  const { data: existing } = await supabase
    .from("ds_users")
    .select("pwa_installed_at")
    .eq("id", userId)
    .single();

  if (!existing?.pwa_installed_at) {
    const { error } = await supabase
      .from("ds_users")
      .update({ pwa_installed_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
