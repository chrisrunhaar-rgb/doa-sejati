"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { t, tr } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import {
  updateUserProfile,
  deleteAccount,
  type DSUser,
} from "@/lib/supabase";

function vapidKeyToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

export default function ProfilePage() {
  const { lang } = useLang();
  const router = useRouter();
  const [user, setUser] = useState<DSUser | null>(null);
  const [totalPrayed, setTotalPrayed] = useState(0);
  const [notifTime, setNotifTime] = useState("07:00");
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pushStatus, setPushStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  useEffect(() => {
    async function load() {
      const userId = localStorage.getItem("ds_user_id");
      if (!userId) { router.replace("/signup"); return; }
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const { profile, totalPrayed } = await res.json();
        if (profile) {
          setUser(profile);
          setEditName(profile.name || "");
          setNotifTime(profile.notification_time || "07:00");
        }
        setTotalPrayed(totalPrayed ?? 0);

        // Check browser-side push subscription state
        if ("serviceWorker" in navigator && "PushManager" in window) {
          try {
            const swReady = Promise.race([
              navigator.serviceWorker.ready,
              new Promise<never>((_, rej) => setTimeout(() => rej(new Error("sw-timeout")), 5000)),
            ]);
            const reg = await swReady;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              setPushStatus("granted");
              // Silently fix missing token in DB (e.g. signed up when VAPID was broken)
              if (!profile?.push_token && userId) {
                await updateUserProfile(userId, { push_token: sub.toJSON() as object });
              }
            } else if (Notification.permission === "denied") {
              setPushStatus("denied");
            }
          } catch {
            // push API unavailable — leave as idle
          }
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const userName = editName || user?.name || "";
  const streakCount = user?.streak_count || 0;
  const memberSince = user
    ? new Date(user.created_at).toLocaleDateString(
        lang === "id" ? "id-ID" : "en-GB",
        { month: "long", year: "numeric" }
      )
    : "";

  const handleEnablePush = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    setPushStatus("requesting");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") { setPushStatus("denied"); return; }
    try {
      const swReady = Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("sw-timeout")), 8000)),
      ]);
      const reg = await swReady;
      // Clear any stale subscription before subscribing fresh
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""),
      });
      const userId = localStorage.getItem("ds_user_id");
      if (userId) {
        await updateUserProfile(userId, { push_token: sub.toJSON() as object });
      }
      setPushStatus("granted");
    } catch (err) {
      console.error("[DS] subscribe failed in profile:", err);
      setPushStatus("idle");
    }
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("ds_user_id");
    if (userId) {
      await updateUserProfile(userId, { name: editName.trim() || undefined, notification_time: notifTime, language: lang });
    }
    setUser((u) => u ? { ...u, name: editName.trim() } : u);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--color-navy-deep)] px-5 pt-safe pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-white/60 hover:text-white/90 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-display text-xl font-bold text-white">
            {tr(t.profile.title, lang)}
          </h1>
          <LanguageToggle variant="white" />
        </div>

        {/* Name + member since */}
        <div className="text-center mb-4">
          {loading ? (
            <div className="h-6 w-32 rounded bg-white/10 animate-pulse mx-auto mb-1" />
          ) : (
            <>
              <div className="text-white text-xl font-bold font-display">
                {userName || (lang === "id" ? "Pejuang Doa" : "Prayer Warrior")}
              </div>
              {user?.user_number && (
                <div className="text-white/50 text-xs font-mono mt-0.5">
                  user #{user.user_number.toLocaleString("id-ID")}
                </div>
              )}
              {memberSince && (
                <div className="text-white/40 text-xs mt-0.5">
                  {lang === "id" ? `Bergabung ${memberSince}` : `Joined ${memberSince}`}
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 rounded-2xl p-4 text-center">
            {loading ? (
              <div className="h-9 w-12 rounded bg-white/10 animate-pulse mx-auto mb-1" />
            ) : (
              <div className="font-display text-3xl font-bold text-white mb-1">
                {streakCount}{streakCount > 0 && " 🔥"}
              </div>
            )}
            <div className="text-white/60 text-xs uppercase tracking-wider">
              {tr(t.profile.prayerStreak, lang)}
            </div>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-4 text-center">
            {loading ? (
              <div className="h-9 w-12 rounded bg-white/10 animate-pulse mx-auto mb-1" />
            ) : (
              <div className="font-display text-3xl font-bold text-white mb-1">
                {totalPrayed}
              </div>
            )}
            <div className="text-white/60 text-xs uppercase tracking-wider">
              {tr(t.profile.totalPrayed, lang)}
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 px-5 pt-6 pb-10">
        <div className="bg-white rounded-2xl overflow-hidden mb-4">
          {/* Name */}
          <div className="px-4 py-4">
            <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
              {lang === "id" ? "Nama" : "Name"}
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={lang === "id" ? "Nama kamu" : "Your name"}
              className="w-full bg-[var(--color-surface)] rounded-xl px-3 py-2.5 text-[var(--color-ink)] font-semibold focus:outline-none"
            />
          </div>

          <div className="border-t border-[var(--color-border)] mx-4" />

          {/* Reminder time */}
          <div className="px-4 py-4">
            <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
              {tr(t.profile.notifTime, lang)}
            </label>
            <input
              type="time"
              value={notifTime}
              onChange={(e) => setNotifTime(e.target.value)}
              className="w-full bg-[var(--color-surface)] rounded-xl px-3 py-2.5 text-[var(--color-ink)] font-semibold focus:outline-none [color-scheme:light]"
            />
          </div>

          <div className="border-t border-[var(--color-border)] mx-4" />

          {/* Push notifications */}
          <div className="px-4 py-4">
            <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
              {lang === "id" ? "Notifikasi Push" : "Push Notifications"}
            </label>
            <button
              onClick={handleEnablePush}
              disabled={pushStatus === "requesting" || pushStatus === "granted"}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all
                bg-[var(--color-navy)]/8 text-[var(--color-navy)]
                disabled:opacity-50"
            >
              {pushStatus === "granted"
                ? (lang === "id" ? "✓ Notifikasi aktif" : "✓ Notifications enabled")
                : pushStatus === "denied"
                ? (lang === "id" ? "Izin ditolak — ubah di pengaturan browser" : "Permission denied — change in browser settings")
                : pushStatus === "requesting"
                ? "..."
                : (lang === "id" ? "Aktifkan notifikasi harian" : "Enable daily notifications")}
            </button>
          </div>

          <div className="border-t border-[var(--color-border)] mx-4" />

          {/* Language */}
          <div className="px-4 py-4">
            <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
              {tr(t.profile.language, lang)}
            </label>
            <LanguageToggle />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl font-bold text-white bg-[var(--color-navy)] mb-4 transition-all"
        >
          {saved ? "✓ " + tr(t.common.save, lang) : tr(t.common.save, lang)}
        </button>

        {/* Legal links */}
        <div className="bg-white rounded-2xl overflow-hidden mb-4">
          <Link
            href="/privacy"
            className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]"
          >
            <span className="text-[var(--color-ink)] text-sm font-medium">
              {tr(t.signup.privacyLink, lang)}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
          <Link
            href="/terms"
            className="flex items-center justify-between px-4 py-4"
          >
            <span className="text-[var(--color-ink)] text-sm font-medium">
              {tr(t.signup.termsLink, lang)}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 text-red-400 text-sm font-semibold"
          >
            {tr(t.profile.deleteAccount, lang)}
          </button>
        ) : (
          <div className="bg-red-50 rounded-2xl p-4">
            <p className="text-red-700 text-sm mb-3">
              {tr(t.profile.deleteConfirm, lang)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white text-[var(--color-ink)] font-semibold text-sm border border-[var(--color-border)]"
              >
                {tr(t.common.cancel, lang)}
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm"
                onClick={async () => {
                  const userId = localStorage.getItem("ds_user_id");
                  if (userId) await deleteAccount(userId);
                  router.replace("/");
                }}
              >
                {tr(t.common.confirm, lang)}
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-6 text-[var(--color-muted)] text-xs">
          <p>Doa Sejati · {lang === "id" ? "Proyek dari" : "A project of"}</p>
          <p className="font-semibold">JATI — Yayasan Jala Transformasi Indonesia</p>
        </div>
      </div>
    </div>
  );
}
