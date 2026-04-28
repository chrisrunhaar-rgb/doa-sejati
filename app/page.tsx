"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import BottomNav from "@/components/BottomNav";
import IndonesiaMap from "@/components/IndonesiaMap";
import { t, tr } from "@/lib/i18n";

// Mock live data — replace with Supabase Realtime
const MOCK_PROVINCE_COUNTS: Record<string, number> = {
  Aceh: 312,
  "Sumatera Utara": 187,
  "Jawa Barat": 523,
  "DKI Jakarta": 445,
  "Jawa Tengah": 298,
  "Jawa Timur": 401,
  Bali: 156,
  Sulawesi: 89,
  "Kalimantan Barat": 67,
  "Sulawesi Selatan": 143,
  Maluku: 34,
  Papua: 28,
};

const FEATURED_UPG = {
  nameId: "Orang Aceh",
  nameEn: "The Acehnese",
  province: "Aceh, Sumatera",
  population: "4,1 juta",
  prayerCountToday: 1247,
  imageGradient: "linear-gradient(135deg, #0a1a4a 0%, #1a3a6a 60%, #2d5a8a 100%)",
};

export default function LandingPage() {
  const { lang } = useLang();
  const [totalPraying, setTotalPraying] = useState(1247);
  const [activeProvinces, setActiveProvinces] = useState(22);

  // Simulate live counter
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalPraying((n) => n + Math.floor(Math.random() * 3));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero — navy, full height on mobile */}
      <section className="relative bg-[var(--color-navy-deep)] min-h-[100svh] flex flex-col overflow-hidden">
        {/* Subtle radial gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 80%, oklch(30% 0.10 258 / 0.5) 0%, transparent 70%)",
          }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-safe pt-4 pb-2">
          <Image
            src="/icons/logo-white.png"
            alt="JATI"
            width={40}
            height={40}
            className="opacity-60"
          />
          <LanguageToggle variant="white" />
        </div>

        {/* Map area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-4">
          <IndonesiaMap
            provinceCounts={MOCK_PROVINCE_COUNTS}
            totalPraying={totalPraying}
            className="w-full max-w-md"
          />

          {/* Live stats strip */}
          <div className="flex items-center gap-6 mt-3">
            <div className="text-center">
              <div className="text-xl font-bold text-white font-display">
                {totalPraying.toLocaleString("id")}
              </div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest">
                {tr(t.landing.prayingNow, lang)}
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-xl font-bold text-white font-display">
                {activeProvinces}
              </div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest">
                {tr(t.landing.provinces, lang)}
              </div>
            </div>
          </div>
        </div>

        {/* Hero content — bottom */}
        <div className="relative z-10 px-5 pb-8 pt-4 text-center">
          <h1 className="font-display text-5xl font-bold text-white tracking-tight mb-2">
            Doa Sejati
          </h1>
          <p className="text-white/70 text-sm font-medium tracking-wider uppercase mb-6">
            {tr(t.landing.tagline, lang)}
          </p>

          {/* CTA buttons */}
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
              {tr(t.landing.seeToday, lang)}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured UPG preview */}
      <section className="bg-white px-5 py-8 mb-nav">
        <p className="text-xs font-bold tracking-widest text-[var(--color-muted)] uppercase mb-4">
          {lang === "id" ? "DOA HARI INI" : "TODAY'S PRAYER"}
        </p>

        <Link href="/today" className="block">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: FEATURED_UPG.imageGradient }}
          >
            <div className="p-5">
              <div className="flex gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white/90">
                  {FEATURED_UPG.province}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white/90">
                  {FEATURED_UPG.population} {tr(t.prayer.population, lang)}
                </span>
              </div>

              <h2 className="font-display text-3xl font-bold text-white mb-1">
                {lang === "id" ? FEATURED_UPG.nameId : FEATURED_UPG.nameEn}
              </h2>

              <p className="text-white/70 text-sm mb-4">
                {lang === "id"
                  ? "Hampir tidak ada orang percaya. 4,1 juta jiwa menunggu kabar baik."
                  : "Almost no believers. 4.1 million people waiting for good news."}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-white/60 text-xs">
                  {FEATURED_UPG.prayerCountToday.toLocaleString("id")}{" "}
                  {tr(t.prayer.prayingToday, lang)}
                </div>
                <span className="text-white text-sm font-semibold">
                  {lang === "id" ? "Berdoa →" : "Pray →"}
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* About movement */}
        <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
          <h3 className="font-display text-xl font-bold text-[var(--color-navy)] mb-3">
            {tr(t.landing.aboutMovement, lang)}
          </h3>
          <p className="text-[var(--color-muted)] text-sm leading-relaxed whitespace-pre-line">
            {tr(t.landing.mission, lang)}
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-4 opacity-60">
            {tr(t.landing.poweredBy, lang)}
          </p>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
