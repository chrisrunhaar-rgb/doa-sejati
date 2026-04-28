"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import BottomNav from "@/components/BottomNav";
import { t, tr } from "@/lib/i18n";

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
  const [todayCount, setTodayCount] = useState(1247);
  const thirtyDayCount = 38640; // mock — replace with Supabase query

  // Simulate live counter ticking up
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayCount((n) => n + Math.floor(Math.random() * 3));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative bg-[var(--color-navy-deep)] min-h-[100svh] flex flex-col overflow-hidden">
        {/* Prayer map IDEOGRAM background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/prayer-map.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            opacity: 0.40,
          }}
        />
        {/* Gradient overlay — readable bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, oklch(14% 0.07 258 / 0.55) 0%, oklch(14% 0.07 258 / 0.25) 35%, oklch(14% 0.07 258 / 0.88) 100%)",
          }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-safe pt-4 pb-2">
          {/* Doa Sejati logo — water drip / ripple mark */}
          <Image
            src="/icons/logo-ds.jpg"
            alt="Doa Sejati"
            width={38}
            height={38}
            className="rounded-xl opacity-95 object-cover"
          />
          <LanguageToggle variant="white" />
        </div>

        {/* Spacer — pushes content to bottom */}
        <div className="flex-1" />

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
                {lang === "id" ? "berdoa 30 hari terakhir" : "prayed last 30 days"}
              </div>
            </div>
          </div>

          <h1 className="font-display text-5xl font-bold text-white tracking-tight mb-2">
            Doa Sejati
          </h1>
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
                  {lang === "id" ? "berdoa hari ini" : "praying today"}
                </div>
                <span className="text-white text-sm font-semibold">
                  {lang === "id" ? "Berdoa →" : "Pray →"}
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* About the movement */}
        <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="/icons/logo-ds.jpg"
              alt="Satu doa, lingkaran yang meluas"
              width={56}
              height={56}
              className="rounded-xl object-cover flex-shrink-0"
            />
            <h3 className="font-display text-xl font-bold text-[var(--color-navy)]">
              {tr(t.landing.aboutMovement, lang)}
            </h3>
          </div>
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
