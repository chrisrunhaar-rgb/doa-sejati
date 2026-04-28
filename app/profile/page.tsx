"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { t, tr } from "@/lib/i18n";

// Mock data — replace with Supabase user data
const MOCK_USER = {
  email: null,
  streakCount: 0,
  totalPrayed: 0,
  notifTime: "07:00",
  memberSince: "April 2026",
};

export default function ProfilePage() {
  const { lang } = useLang();
  const [notifTime, setNotifTime] = useState(MOCK_USER.notifTime);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production: update Supabase user record
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--color-navy-deep)] px-5 pt-safe pt-4 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl font-bold text-white">
            {tr(t.profile.title, lang)}
          </h1>
          <LanguageToggle variant="white" />
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 rounded-2xl p-4 text-center">
            <div className="font-display text-3xl font-bold text-white mb-1">
              {MOCK_USER.streakCount}
              {MOCK_USER.streakCount > 0 && " 🔥"}
            </div>
            <div className="text-white/60 text-xs uppercase tracking-wider">
              {tr(t.profile.prayerStreak, lang)}
            </div>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-4 text-center">
            <div className="font-display text-3xl font-bold text-white mb-1">
              {MOCK_USER.totalPrayed}
            </div>
            <div className="text-white/60 text-xs uppercase tracking-wider">
              {tr(t.profile.totalPrayed, lang)}
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 px-5 pt-6 pb-nav mb-nav">
        <div className="bg-white rounded-2xl overflow-hidden mb-4">
          {/* Reminder time */}
          <div className="px-4 py-4">
            <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
              {tr(t.profile.notifTime, lang)}
            </label>
            <select
              value={notifTime}
              onChange={(e) => setNotifTime(e.target.value)}
              className="w-full bg-[var(--color-surface)] rounded-xl px-3 py-2.5 text-[var(--color-ink)] font-semibold focus:outline-none"
            >
              <option value="07:00">🌅 {tr(t.signup.morning, lang)}</option>
              <option value="12:00">☀️ {tr(t.signup.noon, lang)}</option>
              <option value="20:00">🌙 {tr(t.signup.evening, lang)}</option>
            </select>
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

        {/* Delete account */}
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
              <button className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm">
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
