"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { t, tr } from "@/lib/i18n";

export default function LandingPage() {
  const { lang } = useLang();
  const [todayCount, setTodayCount] = useState(1247);
  const thirtyDayCount = 38640;

  useEffect(() => {
    const interval = setInterval(() => {
      setTodayCount((n) => n + Math.floor(Math.random() * 3));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <section className="relative bg-[var(--color-navy-deep)] min-h-[100svh] flex flex-col overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/prayer-map.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            opacity: 0.70,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, oklch(14% 0.07 258 / 0.35) 0%, oklch(14% 0.07 258 / 0.10) 40%, oklch(14% 0.07 258 / 0.80) 100%)",
          }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-end gap-2 px-5 pt-safe pt-4 pb-2">
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

        {/* Centered logo over the image */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <Image
            src="/icons/logo-ds-white.png"
            alt="Doa Sejati"
            width={160}
            height={160}
            className="opacity-90"
          />
        </div>

        {/* Hero content — pinned bottom */}
        <div className="relative z-10 px-5 pb-8 pt-4 text-center">
          {/* Live stats */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white font-display">
                {todayCount.toLocaleString("id")}
              </div>
              <div className="text-[10px] text-white/55 uppercase tracking-widest">
                {lang === "id" ? "berdoa hari ini" : "praying today"}
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white font-display">
                {thirtyDayCount.toLocaleString("id")}
              </div>
              <div className="text-[10px] text-white/55 uppercase tracking-widest">
                {lang === "id" ? "30 hari terakhir" : "last 30 days"}
              </div>
            </div>
          </div>

          <p className="text-white/70 text-sm font-medium tracking-wider uppercase mb-6">
            {lang === "id"
              ? "Gerakan Doa untuk Indonesia"
              : "A Prayer Movement for Indonesia"}
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link
              href="/today"
              className="block w-full py-4 rounded-2xl font-bold text-white text-lg tracking-wide bg-[var(--color-terra)] active:bg-[var(--color-terra-dark)] transition-transform active:scale-[0.97] shadow-lg shadow-black/30"
            >
              {tr(t.landing.joinCTA, lang)}
            </Link>
            <Link
              href="/signup"
              className="block w-full py-3 rounded-2xl font-semibold text-white/80 text-sm border border-white/20 active:bg-white/10 transition-colors"
            >
              {lang === "id" ? "Bergabung dengan gerakan →" : "Join the movement →"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
