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

// 6 main regions with all 38 provinces
const REGIONS: { id: string; labelId: string; labelEn: string; provinces: string[] }[] = [
  {
    id: "jawa",
    labelId: "Jawa",
    labelEn: "Java",
    provinces: ["DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur"],
  },
  {
    id: "sumatra",
    labelId: "Sumatera",
    labelEn: "Sumatra",
    provinces: [
      "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
      "Jambi", "Sumatera Selatan", "Kepulauan Bangka Belitung", "Bengkulu", "Lampung",
    ],
  },
  {
    id: "kalimantan",
    labelId: "Kalimantan",
    labelEn: "Kalimantan",
    provinces: [
      "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan",
      "Kalimantan Timur", "Kalimantan Utara",
    ],
  },
  {
    id: "nusatenggara",
    labelId: "Nusa Tenggara & Bali",
    labelEn: "Nusa Tenggara & Bali",
    provinces: ["Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur"],
  },
  {
    id: "sulawesi",
    labelId: "Sulawesi",
    labelEn: "Sulawesi",
    provinces: [
      "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah",
      "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
    ],
  },
  {
    id: "maluku",
    labelId: "Maluku & Papua",
    labelEn: "Maluku & Papua",
    provinces: [
      "Maluku", "Maluku Utara",
      "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah",
      "Papua Pegunungan", "Papua Barat Daya",
    ],
  },
  {
    id: "internasional",
    labelId: "Internasional",
    labelEn: "International",
    provinces: ["Luar Negeri"],
  },
];

// Aliases: some demo data uses short names
const PROVINCE_ALIASES: Record<string, string> = {
  "Bangka Belitung": "Kepulauan Bangka Belitung",
  "Nanggroe Aceh Darussalam": "Aceh",
};

function normalise(p: string): string {
  return PROVINCE_ALIASES[p] ?? p;
}

function formatNum(n: number): string {
  return n.toLocaleString("id-ID");
}

const REGION_COLORS = [
  "var(--color-navy)",
  "oklch(42% 0.13 220)",
  "oklch(40% 0.12 170)",
  "oklch(55% 0.13 38)",
  "oklch(40% 0.12 280)",
  "oklch(38% 0.10 150)",
  "oklch(45% 0.08 300)",
];

export default function MapPage() {
  const { lang } = useLang();
  const [leaderboard, setLeaderboard] = useState<ProvinceRow[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [thirtyCount, setThirtyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [lbRes, today, thirty] = await Promise.all([
        fetch("/api/leaderboard").then((r) => r.json()),
        getTodayTotalCount(),
        getThirtyDayCount(),
      ]);
      const rows: ProvinceRow[] = (lbRes.leaderboard ?? []).map((r: ProvinceRow) => ({
        ...r,
        province: normalise(r.province),
      }));
      setLeaderboard(rows);
      setTodayCount(today);
      setThirtyCount(thirty);
      setLoading(false);
    }
    load();
  }, []);

  const byProvince = Object.fromEntries(leaderboard.map((r) => [r.province, r]));

  // Aggregate per region
  const regionStats = REGIONS.map((region) => {
    const warriors = region.provinces.reduce(
      (sum, p) => sum + (byProvince[p]?.warrior_count ?? 0), 0
    );
    const prayers = region.provinces.reduce(
      (sum, p) => sum + (byProvince[p]?.prayers_90d ?? 0), 0
    );
    return { ...region, warriors, prayers };
  }).sort((a, b) => b.warriors - a.warriors);

  const maxRegionWarriors = regionStats[0]?.warriors ?? 1;
  const totalWarriors = regionStats.reduce((a, r) => a + r.warriors, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-navy-deep)]">
      {/* Header with photo background */}
      <div
        className="relative px-5 pt-safe pt-4 pb-8"
        style={{
          backgroundImage: "url('/header-prayer.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "200px",
        }}
      >
        {/* Overlay — lighter so the photo comes through */}
        <div className="absolute inset-0 bg-[var(--color-navy-deep)]/50" />

        <div className="relative flex items-center justify-between mb-6">
          <Link href="/today" className="text-white/70 hover:text-white p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle variant="white" />
            <Link href="/profile" className="text-white/60 hover:text-white/90 transition-colors p-1" aria-label="Profil">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="relative text-center pb-2">
          <h1 className="font-display text-2xl font-bold text-white drop-shadow-md">
            {lang === "id" ? "Peta Pejuang Doa" : "Prayer Warriors"}
          </h1>
          <p className="text-white/70 text-[11px] uppercase tracking-widest mt-1 drop-shadow">
            {lang === "id" ? "Dari mana kita berdoa" : "Where we pray from"}
          </p>
        </div>
      </div>

      {/* Top summary */}
      <div className="px-5 pb-4 pt-4 grid grid-cols-3 gap-3">
        {[
          { value: totalWarriors, labelId: "Pejuang Doa", labelEn: "Warriors" },
          { value: todayCount, labelId: "Berdoa Hari Ini", labelEn: "Today" },
          { value: thirtyCount, labelId: "30 Hari Terakhir", labelEn: "Last 30 Days" },
        ].map(({ value, labelId, labelEn }) => (
          <div key={labelId} className="bg-white/10 rounded-2xl p-3 text-center">
            {loading ? (
              <div className="h-6 w-12 rounded bg-white/10 animate-pulse mx-auto mb-1" />
            ) : (
              <div className="font-display text-lg font-bold text-white leading-tight">
                {formatNum(value)}
              </div>
            )}
            <div className="text-white/50 text-[9px] uppercase tracking-wider leading-tight mt-0.5">
              {lang === "id" ? labelId : labelEn}
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 bg-[var(--color-cream)] rounded-t-3xl px-5 pt-5 pb-10">

        {/* Region scoreboard */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-[var(--color-ink)] text-base">
            {lang === "id" ? "6 Wilayah Utama" : "6 Main Regions"}
          </h2>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-[var(--color-terra)] font-semibold">{lang === "id" ? "● doa (90 hr)" : "● prayers (90d)"}</span>
            <span className="text-[var(--color-navy)] font-semibold">{lang === "id" ? "● pejuang" : "● warriors"}</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-2xl bg-white animate-pulse" />
              ))
            : regionStats.map((region, i) => (
                <div key={region.id}>
                  <button
                    className="w-full bg-white rounded-2xl px-4 py-3 text-left"
                    onClick={() =>
                      setExpandedRegion(expandedRegion === region.id ? null : region.id)
                    }
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: REGION_COLORS[i] }}
                        />
                        <span className="font-bold text-[var(--color-ink)] text-sm">
                          {lang === "id" ? region.labelId : region.labelEn}
                        </span>
                        <span className="text-[var(--color-muted)] text-xs">
                          {region.provinces.length} {lang === "id" ? "prov." : "prov."}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-[var(--color-navy)] text-sm">
                            {formatNum(region.warriors)}
                          </span>
                          <span className="text-[var(--color-muted)] text-xs ml-1">
                            {lang === "id" ? "pejuang" : "warriors"}
                          </span>
                        </div>
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          className={`text-[var(--color-muted)] transition-transform ${expandedRegion === region.id ? "rotate-180" : ""}`}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(region.warriors / maxRegionWarriors) * 100}%`,
                          background: REGION_COLORS[i],
                        }}
                      />
                    </div>
                  </button>

                  {/* Province breakdown — expandable */}
                  {expandedRegion === region.id && (
                    <div className="mt-1 ml-4 space-y-1">
                      {region.provinces
                        .map((p) => ({ province: p, warrior_count: byProvince[p]?.warrior_count ?? 0, prayers_90d: byProvince[p]?.prayers_90d ?? 0 }))
                        .sort((a, b) => b.warrior_count - a.warrior_count)
                        .map((prov) => (
                          <div
                            key={prov.province}
                            className="bg-white/80 rounded-xl px-4 py-2.5 flex items-center justify-between"
                          >
                            <span className="text-[var(--color-ink)] text-sm">
                              {prov.province}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                              {prov.prayers_90d > 0 && (
                                <span className="text-[var(--color-terra)] font-semibold">
                                  {formatNum(prov.prayers_90d)} {lang === "id" ? "doa" : "prayers"}
                                </span>
                              )}
                              <span className="font-semibold text-[var(--color-navy)]">
                                {formatNum(prov.warrior_count)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
        </div>

        <p className="text-center text-[var(--color-muted)] text-xs mt-6">
          {lang === "id"
            ? "Lokasi berdasarkan IP · 90 hari terakhir"
            : "Location via IP address · Last 90 days"}
        </p>
        <p className="text-center text-[var(--color-muted)] text-[10px] mt-2">
          {lang === "id"
            ? "Doa Sejati · Sebuah proyek dari JATI — Yayasan Jala Transformasi Indonesia"
            : "Doa Sejati · A project of JATI — Yayasan Jala Transformasi Indonesia"}
        </p>
      </div>
    </div>
  );
}
