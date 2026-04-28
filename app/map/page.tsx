"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { getTodayTotalCount, getThirtyDayCount } from "@/lib/supabase";

interface ProvinceRow {
  province: string;
  warrior_count: number;
  prayers_90d: number;
}

function formatNum(n: number) {
  return n.toLocaleString("id-ID");
}

// Island groupings for visual sections
const ISLAND_ORDER: Record<string, string> = {
  "DKI Jakarta": "Jawa",
  "Jawa Barat": "Jawa",
  "Jawa Tengah": "Jawa",
  "Jawa Timur": "Jawa",
  "DI Yogyakarta": "Jawa",
  "Banten": "Jawa",
  "Sumatera Utara": "Sumatera",
  "Sumatera Barat": "Sumatera",
  "Sumatera Selatan": "Sumatera",
  "Riau": "Sumatera",
  "Kepulauan Riau": "Sumatera",
  "Lampung": "Sumatera",
  "Aceh": "Sumatera",
  "Bengkulu": "Sumatera",
  "Jambi": "Sumatera",
  "Bangka Belitung": "Sumatera",
  "Kalimantan Barat": "Kalimantan",
  "Kalimantan Tengah": "Kalimantan",
  "Kalimantan Selatan": "Kalimantan",
  "Kalimantan Timur": "Kalimantan",
  "Kalimantan Utara": "Kalimantan",
  "Sulawesi Utara": "Sulawesi",
  "Sulawesi Tengah": "Sulawesi",
  "Sulawesi Selatan": "Sulawesi",
  "Sulawesi Tenggara": "Sulawesi",
  "Gorontalo": "Sulawesi",
  "Sulawesi Barat": "Sulawesi",
  "Bali": "Bali & Nusa Tenggara",
  "Nusa Tenggara Barat": "Bali & Nusa Tenggara",
  "Nusa Tenggara Timur": "Bali & Nusa Tenggara",
  "Maluku": "Maluku & Papua",
  "Maluku Utara": "Maluku & Papua",
  "Papua": "Maluku & Papua",
  "Papua Barat": "Maluku & Papua",
};

export default function MapPage() {
  const { lang } = useLang();
  const [leaderboard, setLeaderboard] = useState<ProvinceRow[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [thirtyCount, setThirtyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [lbRes, today, thirty] = await Promise.all([
        fetch("/api/leaderboard").then((r) => r.json()),
        getTodayTotalCount(),
        getThirtyDayCount(),
      ]);
      setLeaderboard(lbRes.leaderboard ?? []);
      setTodayCount(today);
      setThirtyCount(thirty);
      setLoading(false);
    }
    load();
  }, []);

  const totalWarriors = leaderboard.reduce((a, r) => a + r.warrior_count, 0);
  const maxWarriors = leaderboard[0]?.warrior_count ?? 1;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-navy-deep)]">
      {/* Header */}
      <div className="px-5 pt-safe pt-4 pb-5 flex items-center justify-between">
        <Link href="/today" className="text-white/60 hover:text-white/90 p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="text-center">
          <h1 className="font-display text-lg font-bold text-white">
            {lang === "id" ? "Peta Pejuang Doa" : "Prayer Warriors"}
          </h1>
          <p className="text-white/40 text-[10px] uppercase tracking-wider">
            {lang === "id" ? "Dari mana mereka berdoa" : "Where they pray from"}
          </p>
        </div>
        <LanguageToggle variant="white" />
      </div>

      {/* Summary stats */}
      <div className="px-5 pb-5 grid grid-cols-3 gap-3">
        <div className="bg-white/10 rounded-2xl p-3 text-center">
          {loading ? (
            <div className="h-7 w-14 rounded bg-white/10 animate-pulse mx-auto mb-1" />
          ) : (
            <div className="font-display text-xl font-bold text-white">
              {formatNum(totalWarriors)}
            </div>
          )}
          <div className="text-white/50 text-[9px] uppercase tracking-wider leading-tight">
            {lang === "id" ? "Pejuang Doa" : "Warriors"}
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-3 text-center">
          {loading ? (
            <div className="h-7 w-14 rounded bg-white/10 animate-pulse mx-auto mb-1" />
          ) : (
            <div className="font-display text-xl font-bold text-white">
              {formatNum(todayCount)}
            </div>
          )}
          <div className="text-white/50 text-[9px] uppercase tracking-wider leading-tight">
            {lang === "id" ? "Berdoa Hari Ini" : "Praying Today"}
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-3 text-center">
          {loading ? (
            <div className="h-7 w-14 rounded bg-white/10 animate-pulse mx-auto mb-1" />
          ) : (
            <div className="font-display text-xl font-bold text-white">
              {formatNum(thirtyCount)}
            </div>
          )}
          <div className="text-white/50 text-[9px] uppercase tracking-wider leading-tight">
            {lang === "id" ? "30 Hari Terakhir" : "Last 30 Days"}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 bg-[var(--color-cream)] rounded-t-3xl px-5 pt-5 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[var(--color-ink)] text-base">
            {lang === "id" ? "Peringkat Provinsi" : "Province Rankings"}
          </h2>
          <span className="text-[var(--color-muted)] text-xs">
            {lang === "id" ? "90 hari terakhir" : "last 90 days"}
          </span>
        </div>

        <div className="space-y-2">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white animate-pulse" />
              ))
            : leaderboard.map((row, i) => (
                <div key={row.province} className="bg-white rounded-2xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <span className={`font-display font-bold text-sm w-6 text-right flex-shrink-0 ${
                        i === 0 ? "text-[var(--color-terra)]" :
                        i === 1 ? "text-[var(--color-navy)]" :
                        i === 2 ? "text-[var(--color-navy)]/70" :
                        "text-[var(--color-muted)]"
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--color-ink)] text-sm">
                          {row.province}
                        </span>
                        <span className="text-[var(--color-muted)] text-[10px] ml-1.5">
                          {ISLAND_ORDER[row.province] ?? "Indonesia"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-[var(--color-navy)] text-sm">
                        {formatNum(row.warrior_count)}
                      </div>
                      <div className="text-[var(--color-muted)] text-[10px]">
                        {lang === "id" ? "pejuang" : "warriors"}
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(row.warrior_count / maxWarriors) * 100}%`,
                        background: i === 0
                          ? "var(--color-terra)"
                          : i < 3
                          ? "var(--color-navy)"
                          : "var(--color-navy-light)",
                      }}
                    />
                  </div>
                </div>
              ))}
        </div>

        <p className="text-center text-[var(--color-muted)] text-xs mt-6">
          {lang === "id"
            ? "Lokasi berdasarkan IP · Diperbarui setiap hari"
            : "Location based on IP address · Updated daily"}
        </p>
      </div>
    </div>
  );
}
