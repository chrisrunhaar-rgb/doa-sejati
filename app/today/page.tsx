"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import PrayedButton from "@/components/PrayedButton";
import ShareSheet from "@/components/ShareSheet";
import { t, tr } from "@/lib/i18n";
import {
  getTodayPrayerContent,
  getTodayTotalCount,
  getThirtyDayCount,
  recordPrayer,
  hasPrayedToday,
  type DSPrayerContent,
} from "@/lib/supabase";

const GRADIENT =
  "linear-gradient(170deg, oklch(16% 0.08 258 / 0.95) 0%, oklch(20% 0.09 248 / 0.85) 100%)";

export default function TodayPage() {
  const { lang } = useLang();
  const [showShare, setShowShare] = useState(false);
  const [content, setContent] = useState<DSPrayerContent | null>(null);
  const [prayerCount, setPrayerCount] = useState(0);
  const [thirtyDayCount, setThirtyDayCount] = useState(0);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);

  // Track push notification opens
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("ref") !== "push") return;
    const userId = localStorage.getItem("ds_user_id");
    if (userId) {
      fetch("/api/notification-open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }).catch(() => {});
    }
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  useEffect(() => {
    async function load() {
      const [todayContent, todayCount, thirtyCount] = await Promise.all([
        getTodayPrayerContent(),
        getTodayTotalCount(),
        getThirtyDayCount(),
      ]);
      setContent(todayContent);
      setPrayerCount(todayCount);
      setThirtyDayCount(thirtyCount);

      const userId = localStorage.getItem("ds_user_id");
      if (userId) {
        // Load current streak from profile
        const profileRes = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`);
        if (profileRes.ok) {
          const { profile } = await profileRes.json();
          if (profile?.streak_count) setStreakDays(profile.streak_count);
        }
        // Check if already prayed today
        if (todayContent) {
          const already = await hasPrayedToday(userId, todayContent.id);
          setHasPrayed(already);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const handlePrayed = async () => {
    const userId = localStorage.getItem("ds_user_id");
    if (userId && content) {
      const result = await recordPrayer(userId, content.id);
      if (result.streak) setStreakDays(result.streak);
    }
    setPrayerCount((n) => n + 1);
    setHasPrayed(true);
  };

  const pg = content?.people_group;
  const groupName = pg ? (lang === "id" ? pg.name_id : pg.name_en) : "…";
  const province = pg?.province ?? "";
  const island = pg?.island ?? "";
  const population = pg ? pg.population.toLocaleString("id") : "";
  const context = content
    ? lang === "id"
      ? content.prayer_text_id
      : content.prayer_text_en
    : "";
  const prayerPoints = content
    ? lang === "id"
      ? content.prayer_points_id
      : content.prayer_points_en
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero header */}
      <div className="relative flex flex-col" style={{ minHeight: "44vh" }}>
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/prayer-map.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
        <div className="absolute inset-0 z-0" style={{ background: GRADIENT }} />

        {/* Top nav */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-safe pt-4 pb-2">
          <Link
            href="/"
            className="text-white/60 hover:text-white/90 transition-colors"
            aria-label="Beranda"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="text-center">
            <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">
              {tr(t.prayer.todayPrayer, lang)}
            </div>
            <div className="text-[11px] text-white/70 font-medium mt-0.5">
              {new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle variant="white" />
            <Link
              href="/profile"
              className="text-white/60 hover:text-white/90 transition-colors p-1"
              aria-label="Profil"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* People group info */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-5 pb-6 pt-4">
          {loading ? (
            <div className="h-24 flex items-end">
              <div className="w-32 h-8 rounded-lg bg-white/10 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {province && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white/90">
                    {province}{island ? `, ${island}` : ""}
                  </span>
                )}
                {population && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white/90">
                    {population} {tr(t.prayer.population, lang)}
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl font-bold text-white leading-tight mb-3">
                {groupName}
              </h1>
              <p className="text-white/70 text-sm leading-relaxed">{context}</p>
            </>
          )}
        </div>
      </div>

      {/* Prayer content */}
      <div className="flex-1 bg-white px-5 pt-6 pb-8">
        <h2 className="text-xs font-bold tracking-widest text-[var(--color-muted)] uppercase mb-4">
          {tr(t.prayer.prayPoints, lang)}
        </h2>

        {loading ? (
          <div className="flex flex-col gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 h-12 rounded-lg bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <ol className="flex flex-col gap-4 mb-8">
            {prayerPoints.map((point, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-navy)]/8 text-[var(--color-navy)] font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-[var(--color-ink)] text-sm leading-relaxed pt-0.5">
                  {point}
                </p>
              </li>
            ))}
          </ol>
        )}

        {/* Prayed button */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <PrayedButton onPrayed={handlePrayed} initialPrayed={hasPrayed} />

          <div className="flex items-center gap-5 justify-center">
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--color-navy)] font-display">
                {prayerCount.toLocaleString("id")}
              </div>
              <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest">
                {lang === "id" ? "berdoa hari ini" : "praying today"}
              </div>
            </div>
            <div className="w-px h-8 bg-[var(--color-border)]" />
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--color-navy)] font-display">
                {thirtyDayCount.toLocaleString("id")}
              </div>
              <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest">
                {lang === "id" ? "30 hari terakhir" : "last 30 days"}
              </div>
            </div>
          </div>

          {streakDays > 0 && (
            <div className="streak-badge px-4 py-2 rounded-full text-sm">
              🔥 {tr(t.prayer.streakLabel, lang)} {streakDays}{" "}
              {tr(t.prayer.streakDays, lang)}
            </div>
          )}
        </div>

        {/* Joshua Project attribution — required by their terms of use */}
        <p className="text-[10px] text-[var(--color-muted)] text-center mb-1">
          {lang === "id" ? "Data suku dari" : "People group data from"}{" "}
          <a
            href="https://www.joshuaproject.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Joshua Project
          </a>
        </p>
        <p className="text-[10px] text-[var(--color-muted)] text-center mb-4">
          {lang === "id"
            ? "Doa Sejati · Sebuah proyek dari JATI — Yayasan Jala Transformasi Indonesia"
            : "Doa Sejati · A project of JATI — Yayasan Jala Transformasi Indonesia"}
        </p>

        {/* Action row */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setShowShare(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-ink)] font-semibold text-sm active:bg-[var(--color-surface)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            {tr(t.prayer.share, lang)}
          </button>

          <Link
            href="/map"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-navy)]/5 text-[var(--color-navy)] font-semibold text-sm active:bg-[var(--color-navy)]/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
            {lang === "id" ? "Peta Doa" : "Prayer Map"}
          </Link>
        </div>
      </div>

      {showShare && (
        <ShareSheet
          groupName={groupName}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
