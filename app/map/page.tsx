"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import {
  getTodayPrayerContent,
  getTodayTotalCount,
  getIslandStats,
  type DSPrayerContent,
  type DSIslandStat,
} from "@/lib/supabase";

// Polygon points derived from geographic coordinates:
// ViewBox 700×220, x = (lon−95)×700/46, y = (7−lat)×220/18
const ISLANDS = [
  {
    id: "Sumatera",
    labelEn: "Sumatra",
    labelId: "Sumatera",
    // clockwise: NE coast (Malacca Strait side) then SW coast (Indian Ocean)
    points:
      "8,18 30,27 53,37 76,55 99,73 122,92 145,116 167,156 " +
      "155,156 129,141 107,122 84,104 61,86 38,61 15,43",
    cx: 88,
    cy: 97,
  },
  {
    id: "Jawa",
    labelEn: "Java",
    labelId: "Jawa",
    points:
      "167,157 198,157 229,161 259,169 290,177 305,183 308,189 " +
      "282,183 251,179 221,172 198,169 175,165",
    cx: 238,
    cy: 173,
  },
  {
    id: "Kalimantan",
    labelEn: "Kalimantan",
    labelId: "Kalimantan",
    points:
      "69,0 91,0 129,0 183,6 213,31 213,55 206,79 191,104 168,128 137,140 " +
      "107,140 84,128 69,116 54,116 54,86 54,55 61,24",
    cx: 135,
    cy: 68,
  },
  {
    id: "Sulawesi",
    labelEn: "Sulawesi",
    labelId: "Sulawesi",
    // Simplified spider shape: N peninsula + E arm + S arm + W coast
    points:
      "374,73 403,67 441,73 453,80 441,92 435,111 449,122 457,135 " +
      "449,141 434,135 418,153 403,153 388,147 372,135 365,122 " +
      "372,104 374,86",
    cx: 410,
    cy: 108,
  },
  {
    id: "Nusa Tenggara",
    labelEn: "Nusa Tenggara",
    labelId: "Nusa Tenggara",
    points:
      "308,186 328,190 351,192 382,196 404,196 426,202 462,206 " +
      "465,202 434,190 404,190 382,190 351,186 328,183 313,184",
    cx: 386,
    cy: 195,
  },
  {
    id: "Maluku",
    labelEn: "Maluku",
    labelId: "Maluku",
    // Halmahera + surrounding — simplified blob
    points: "482,73 496,67 511,71 518,84 512,97 496,95 482,87",
    cx: 499,
    cy: 82,
  },
  {
    id: "Papua",
    labelEn: "Papua",
    labelId: "Papua",
    points:
      "541,91 565,79 600,67 638,61 670,67 695,79 700,98 686,122 " +
      "655,153 624,171 590,183 562,189 541,174 534,150 534,122 541,104",
    cx: 618,
    cy: 122,
  },
] as const;

// Bali: tiny — render as a small labeled dot, not polygon
const BALI_X = 311;
const BALI_Y = 185;

function formatNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

export default function MapPage() {
  const { lang } = useLang();
  const [content, setContent] = useState<DSPrayerContent | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [islandStats, setIslandStats] = useState<DSIslandStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [c, count, stats] = await Promise.all([
        getTodayPrayerContent(),
        getTodayTotalCount(),
        getIslandStats(),
      ]);
      setContent(c);
      setTodayCount(count);
      setIslandStats(stats);
      setLoading(false);
    }
    load();
  }, []);

  const statsByIsland = Object.fromEntries(islandStats.map((s) => [s.island, s]));
  const todayIsland = content?.people_group?.island ?? null;
  const todayUPG = content?.people_group
    ? lang === "id" ? content.people_group.name_id : content.people_group.name_en
    : null;

  const totalPrayers = islandStats.reduce((a, s) => a + s.total_prayers, 0);
  const totalUPGs = islandStats.reduce((a, s) => a + s.upg_count, 0);

  const baliStat = statsByIsland["Bali"];
  const baliToday = todayIsland === "Bali";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-navy-deep)]">
      {/* Header */}
      <div className="px-5 pt-safe pt-4 pb-4 flex items-center justify-between">
        <Link href="/today" className="text-white/60 hover:text-white/90 p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-display text-lg font-bold text-white">
          {lang === "id" ? "Peta Doa" : "Prayer Map"}
        </h1>
        <LanguageToggle variant="white" />
      </div>

      {/* Today's focus banner */}
      {!loading && todayUPG && (
        <div className="mx-5 mb-4 bg-white/8 rounded-2xl px-4 py-3">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-0.5">
            {lang === "id" ? "Doakan hari ini" : "Today's prayer"}
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-white font-bold text-base font-display">{todayUPG}</div>
            <div className="text-[var(--color-terra)] font-bold text-xl">
              {formatNum(todayCount)}{" "}
              <span className="text-white/50 text-xs font-normal">
                {lang === "id" ? "doa" : "prayers"}
              </span>
            </div>
          </div>
          {content?.people_group?.province && (
            <div className="text-white/40 text-xs mt-0.5">
              {content.people_group.province} · {todayIsland}
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="px-3 mb-1">
        <svg
          viewBox="0 0 700 218"
          className="w-full"
          style={{ maxHeight: 210 }}
          aria-label={lang === "id" ? "Peta Indonesia" : "Map of Indonesia"}
        >
          {/* Ocean background */}
          <rect width="700" height="218" fill="oklch(18% 0.06 230)" rx="12" />

          {/* Island polygons */}
          {ISLANDS.map((island) => {
            const stat = statsByIsland[island.id];
            const isToday = island.id === todayIsland;
            const hasPrayers = (stat?.total_prayers ?? 0) > 0;
            const fill = isToday
              ? "oklch(55% 0.13 38)"
              : hasPrayers
              ? "oklch(33% 0.09 258)"
              : "oklch(26% 0.07 258)";
            const stroke = isToday ? "oklch(70% 0.15 38)" : "oklch(42% 0.08 258)";

            return (
              <g key={island.id}>
                <polygon
                  points={island.points}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isToday ? 1.5 : 0.8}
                  style={{ transition: "fill 0.25s" }}
                />

                {/* Pulsing dot for today */}
                {isToday && (
                  <>
                    <circle cx={island.cx} cy={island.cy} r="4" fill="white" opacity="0.85">
                      <animate attributeName="r" values="3;9;3" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={island.cx} cy={island.cy} r="3.5" fill="white" />
                  </>
                )}

                {/* Prayer count badge */}
                {hasPrayers && (
                  <text
                    x={island.cx}
                    y={island.cy + (isToday ? 14 : 4)}
                    textAnchor="middle"
                    fill="white"
                    fontSize={isToday ? "9" : "8"}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    opacity={isToday ? "1" : "0.8"}
                  >
                    {formatNum(stat.total_prayers)}
                  </text>
                )}

                {/* Island label */}
                <text
                  x={island.cx}
                  y={island.cy + (isToday ? 25 : 15)}
                  textAnchor="middle"
                  fill={isToday ? "oklch(82% 0.12 38)" : "oklch(58% 0.04 258)"}
                  fontSize="6.5"
                  fontFamily="sans-serif"
                  pointerEvents="none"
                >
                  {lang === "id" ? island.labelId : island.labelEn}
                </text>
              </g>
            );
          })}

          {/* Bali — tiny dot */}
          <g>
            <circle
              cx={BALI_X}
              cy={BALI_Y}
              r={baliToday ? 5 : 4}
              fill={baliToday ? "oklch(55% 0.13 38)" : (baliStat?.total_prayers ?? 0) > 0 ? "oklch(33% 0.09 258)" : "oklch(26% 0.07 258)"}
              stroke={baliToday ? "oklch(70% 0.15 38)" : "oklch(42% 0.08 258)"}
              strokeWidth="0.8"
            />
            <text x={BALI_X} y={BALI_Y + 13} textAnchor="middle"
              fill="oklch(50% 0.04 258)" fontSize="6" fontFamily="sans-serif">
              Bali
            </text>
          </g>

          {/* Legend */}
          <g transform="translate(8,205)">
            <rect x="0" y="0" width="7" height="7" rx="1.5" fill="oklch(55% 0.13 38)" />
            <text x="10" y="6.5" fill="oklch(58% 0.04 258)" fontSize="6.5" fontFamily="sans-serif">
              {lang === "id" ? "Fokus hari ini" : "Today's focus"}
            </text>
            <rect x="80" y="0" width="7" height="7" rx="1.5" fill="oklch(33% 0.09 258)" />
            <text x="90" y="6.5" fill="oklch(58% 0.04 258)" fontSize="6.5" fontFamily="sans-serif">
              {lang === "id" ? "Sudah didoakan" : "Prayed for"}
            </text>
          </g>
        </svg>
      </div>

      {/* Data cards */}
      <div className="flex-1 bg-[var(--color-cream)] rounded-t-3xl px-5 pt-5 pb-10">
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-white rounded-2xl p-4 text-center">
            <div className="font-display text-2xl font-bold text-[var(--color-navy)]">
              {loading ? "—" : formatNum(totalPrayers)}
            </div>
            <div className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
              {lang === "id" ? "Total Doa" : "Total Prayers"}
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-4 text-center">
            <div className="font-display text-2xl font-bold text-[var(--color-navy)]">
              {loading ? "—" : totalUPGs}
            </div>
            <div className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
              {lang === "id" ? "Suku Belum Terjangkau" : "Unreached Groups"}
            </div>
          </div>
        </div>

        <h2 className="font-display font-bold text-[var(--color-ink)] text-base mb-3">
          {lang === "id" ? "Doa per Wilayah" : "Prayers by Region"}
        </h2>

        <div className="space-y-2">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-2xl bg-white animate-pulse" />
              ))
            : islandStats
                .slice()
                .sort((a, b) => b.upg_count - a.upg_count)
                .map((stat) => {
                  const isToday = stat.island === todayIsland;
                  const maxUPGs = Math.max(...islandStats.map((s) => s.upg_count));

                  return (
                    <div
                      key={stat.island}
                      className={`bg-white rounded-2xl px-4 py-3 ${isToday ? "ring-2 ring-[var(--color-terra)]" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {isToday && (
                            <span className="w-2 h-2 rounded-full bg-[var(--color-terra)] flex-shrink-0" />
                          )}
                          <span className="font-semibold text-[var(--color-ink)] text-sm">
                            {stat.island}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                          <span>{stat.upg_count} {lang === "id" ? "suku" : "UPGs"}</span>
                          {stat.total_prayers > 0 && (
                            <span className="font-bold text-[var(--color-terra)]">
                              {formatNum(stat.total_prayers)} {lang === "id" ? "doa" : "prayers"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(stat.upg_count / maxUPGs) * 100}%`,
                            background: isToday ? "var(--color-terra)" : "var(--color-navy-light)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
        </div>

        <p className="text-center text-[var(--color-muted)] text-xs mt-6">
          {lang === "id"
            ? "234 suku belum terjangkau di seluruh Indonesia · Data dari Joshua Project"
            : "234 unreached people groups across Indonesia · Data from Joshua Project"}
        </p>
      </div>
    </div>
  );
}
