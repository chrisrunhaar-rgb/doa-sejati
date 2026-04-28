"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import PrayedButton from "@/components/PrayedButton";
import ShareSheet from "@/components/ShareSheet";
import { t, tr } from "@/lib/i18n";

// Mock prayer data — will be fetched from Supabase in production
const PRAYER_DATA = {
  peopleGroupId: "aceh-aceh",
  nameId: "Orang Aceh",
  nameEn: "The Acehnese",
  province: "Aceh",
  island: "Sumatera",
  population: "4.100.000",
  religionId: "Islam (99.8%)",
  religionEn: "Islam (99.8%)",
  bibleAccessId: "Sebagian (Perjanjian Baru tersedia)",
  bibleAccessEn: "Partial (New Testament available)",
  believersId: "< 0.1%",
  believersEn: "< 0.1%",
  progressScale: 2,
  jpUrl: "https://joshuaproject.net/people_groups/10087/ID",
  contextId:
    "Orang Aceh adalah salah satu suku terbesar di Indonesia, dengan sekitar 4,1 juta jiwa yang tinggal di ujung barat Sumatera. Hampir seluruhnya beragama Islam, dan hampir tidak ada orang percaya di antara mereka.",
  contextEn:
    "The Acehnese are one of Indonesia's largest people groups, with around 4.1 million people living at the western tip of Sumatra. They are almost entirely Muslim, with very few known believers among them.",
  prayerPointsId: [
    "Doakan agar orang Aceh yang mencari kedamaian sejati dapat berjumpa dengan Yesus melalui mimpi atau kesaksian yang nyata.",
    "Doakan agar Alkitab dalam bahasa Aceh dapat dibaca dan disebarluaskan di antara orang-orang yang rindu kebenaran.",
    "Doakan agar para pelayan dan pekerja yang tinggal di tengah orang Aceh dapat hidup dengan integritas, kasih, dan keberanian.",
  ],
  prayerPointsEn: [
    "Pray that Acehnese seeking true peace would encounter Jesus through dreams or a genuine witness.",
    "Pray that the Acehnese New Testament would be read and distributed among those who hunger for truth.",
    "Pray for workers and servants living among the Acehnese to live with integrity, love, and courage.",
  ],
  prayerCountToday: 1247,
  streakDays: 0,
};

const GRADIENT =
  "linear-gradient(170deg, oklch(16% 0.08 258 / 0.95) 0%, oklch(20% 0.09 248 / 0.85) 100%)";

export default function TodayPage() {
  const { lang } = useLang();
  const [showShare, setShowShare] = useState(false);
  const [prayerCount, setPrayerCount] = useState(PRAYER_DATA.prayerCountToday);
  const thirtyDayCount = 38640; // mock — replace with Supabase query
  const [streakDays, setStreakDays] = useState(PRAYER_DATA.streakDays);
  const [hasPrayed, setHasPrayed] = useState(false);

  const groupName =
    lang === "id" ? PRAYER_DATA.nameId : PRAYER_DATA.nameEn;
  const prayerPoints =
    lang === "id"
      ? PRAYER_DATA.prayerPointsId
      : PRAYER_DATA.prayerPointsEn;

  const handlePrayed = async () => {
    // In production: call Supabase to record prayer
    setPrayerCount((n) => n + 1);
    setStreakDays((n) => n + 1);
    setHasPrayed(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero header */}
      <div
        className="relative flex flex-col"
        style={{ minHeight: "44vh" }}
      >
        {/* Background: people group photo (placeholder: prayer-map) */}
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
            <LanguageToggle variant="white" />
          </div>
        </div>

        {/* People group info */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-5 pb-6 pt-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white/90">
              {PRAYER_DATA.province}, {PRAYER_DATA.island}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white/90">
              {PRAYER_DATA.population} {tr(t.prayer.population, lang)}
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-3">
            {groupName}
          </h1>

          <p className="text-white/70 text-sm leading-relaxed">
            {lang === "id" ? PRAYER_DATA.contextId : PRAYER_DATA.contextEn}
          </p>
        </div>
      </div>

      {/* Prayer content */}
      <div className="flex-1 bg-white px-5 pt-6 mb-nav">
        {/* Prayer points */}
        <h2 className="text-xs font-bold tracking-widest text-[var(--color-muted)] uppercase mb-4">
          {tr(t.prayer.prayPoints, lang)}
        </h2>

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

        {/* Prayed button */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <PrayedButton onPrayed={handlePrayed} initialPrayed={hasPrayed} />

          {/* Live counters — today + last 30 days */}
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

          {/* Streak */}
          {streakDays > 0 && (
            <div className="streak-badge px-4 py-2 rounded-full text-sm">
              🔥 {tr(t.prayer.streakLabel, lang)} {streakDays}{" "}
              {tr(t.prayer.streakDays, lang)}
            </div>
          )}
        </div>

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
            href="/signup"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-navy)]/5 text-[var(--color-navy)] font-semibold text-sm active:bg-[var(--color-navy)]/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {lang === "id" ? "Ingatkan saya" : "Remind me"}
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
