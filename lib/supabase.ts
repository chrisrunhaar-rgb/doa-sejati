import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (service role) — only use in API routes / server actions
export function createServiceClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY!);
}

// Types matching the database schema
export interface DSUser {
  id: string;
  name: string;
  email: string | null;
  push_token: object | null;
  language: "id" | "en";
  notification_time: string; // HH:MM format
  timezone: string;
  created_at: string;
  last_prayed_at: string | null;
  streak_count: number;
  streak_last_date: string | null;
}

export interface DSPeopleGroup {
  id: string; // Joshua Project code
  name_id: string;
  name_en: string;
  province: string;
  island: string;
  population: number;
  religion: string;
  progress_scale: number; // 0–6
  bible_access: "full" | "partial" | "none";
  photo_url: string | null;
  jp_profile_url: string | null;
}

export interface DSPrayerContent {
  id: string;
  people_group_id: string;
  scheduled_date: string;
  push_title_id: string;
  push_title_en: string;
  push_body_id: string;
  push_body_en: string;
  prayer_text_id: string;
  prayer_text_en: string;
  prayer_points_id: string[];
  prayer_points_en: string[];
  people_group?: DSPeopleGroup;
}

export interface DSPrayerLog {
  id: string;
  user_id: string;
  content_id: string;
  prayed_at: string;
}

export interface DSProvinceDailyCount {
  province_name: string;
  date: string;
  prayer_count: number;
}

export interface DSUPGDailyCount {
  people_group_id: string;
  date: string;
  prayer_count: number;
}

export interface DSPrayerTeam {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

// Helper: get today's prayer content
export async function getTodayPrayerContent(): Promise<DSPrayerContent | null> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("ds_prayer_content")
    .select("*, people_group:ds_people_groups(*)")
    .eq("scheduled_date", today)
    .single();

  if (error || !data) return null;
  return data as DSPrayerContent;
}

// Helper: get today's prayer count for a content item
export async function getTodayPrayerCount(
  peopleGroupId: string
): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("ds_upg_daily_counts")
    .select("prayer_count")
    .eq("people_group_id", peopleGroupId)
    .eq("date", today)
    .single();
  return data?.prayer_count ?? 0;
}

// Helper: record a prayer
export async function recordPrayer(
  userId: string,
  contentId: string
): Promise<boolean> {
  const { error } = await supabase.from("ds_prayer_logs").insert({
    user_id: userId,
    content_id: contentId,
    prayed_at: new Date().toISOString(),
  });
  return !error;
}

// Helper: check if user has already prayed today
export async function hasPrayedToday(
  userId: string,
  contentId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("ds_prayer_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .single();
  return !!data;
}

// Helper: get province counts for map
export async function getProvinceCounts(): Promise<
  Record<string, number>
> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("ds_province_daily_counts")
    .select("province_name, prayer_count")
    .eq("date", today);

  if (!data) return {};
  return Object.fromEntries(data.map((r) => [r.province_name, r.prayer_count]));
}

// Helper: upsert user profile after signup
export async function saveUserProfile(
  userId: string,
  profile: {
    name: string;
    language: "id" | "en";
    notification_time: string;
    timezone: string;
    push_token: object | null;
  }
): Promise<boolean> {
  const { error } = await supabase.from("ds_users").upsert(
    { id: userId, ...profile },
    { onConflict: "id" }
  );
  return !error;
}

// Helper: get 30-day prayer count across all UPGs
export async function getThirtyDayCount(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { count } = await supabase
    .from("ds_prayer_logs")
    .select("id", { count: "exact", head: true })
    .gte("prayed_at", thirtyDaysAgo.toISOString());
  return count ?? 0;
}

// Helper: get today's total prayer count
export async function getTodayTotalCount(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("ds_upg_daily_counts")
    .select("prayer_count")
    .eq("date", today);
  if (!data) return 0;
  return data.reduce((sum, r) => sum + r.prayer_count, 0);
}
