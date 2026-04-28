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

// Simplified island shapes for the Indonesia archipelago
// Each shape: { id, label, cx, cy, rx, ry, rotate } — ellipse-based
// Positioned in a 500×280 viewBox
const ISLAND_SHAPES: {
  id: string;
  labelEn: string;
  labelId: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate?: number;
  textY?: number;
}[] = [
  { id: "Sumatera",      labelEn: "Sumatra",       labelId: "Sumatera",      cx: 68,  cy: 130, rx: 20, ry: 62, rotate: -18, textY: 202 },
  { id: "Jawa",          labelEn: "Java",           labelId: "Jawa",          cx: 185, cy: 200, rx: 68, ry: 16, rotate: 2,   textY: 224 },
  { id: "Kalimantan",    labelEn: "Kalimantan",     labelId: "Kalimantan",    cx: 210, cy: 110, rx: 52, ry: 56, rotate: 0,   textY: 170 },
  { id: "Bali",          labelEn: "Bali",           labelId: "Bali",          cx: 260, cy: 200, rx: 10, ry: 9,  rotate: 0,   textY: 216 },
  { id: "Nusa Tenggara", labelEn: "Nusa Tenggara",  labelId: "Nusa Tenggara", cx: 312, cy: 212, rx: 38, ry: 11, rotate: 3,   textY: 232 },
  { id: "Sulawesi",      labelEn: "Sulawesi",       labelId: "Sulawesi",      cx: 330, cy: 120, rx: 22, ry: 52, rotate: 5,   textY: 180 },
  { id: "Maluku",        labelEn: "Maluku",         labelId: "Maluku",        cx: 390, cy: 148, rx: 14, ry: 42, rotate: 8,   textY: 198 },
  { id: "Indonesia",     labelEn: "National",       labelId: "Nasional",      cx: 150, cy: 148, rx: 18, ry: 12, rotate: 0,   textY: 168 },
];

// Papua is not in the UPG island list but worth showing
const PAPUA = { cx: 455, cy: 140, rx: 34, ry: 44, rotate: 0 };

const NAVY_DEEP = "oklch(14% 0.07 258)";
const TERRA = "oklch(55% 0.13 38)";

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
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);

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

  const statsByIsland = Object.fromEntries(
    islandStats.map((s) => [s.island, s])
  );

  const todayIsland = content?.people_group?.island ?? null;
  const todayUPG = content?.people_group
    ? lang === "id"
      ? content.people_group.name_id
      : content.people_group.name_en
    : null;

  const totalPrayers = islandStats.reduce((a, s) => a + s.total_prayers, 0);
  const totalUPGs = islandStats.reduce((a, s) => a + s.upg_count, 0);

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

      {/* Today's focus */}
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
      <div className="px-4 mb-2">
        <svg
          viewBox="0 0 500 260"
          className="w-full"
          style={{ maxHeight: 220 }}
          aria-label={lang === "id" ? "Peta Indonesia" : "Map of Indonesia"}
        >
          {/* Ocean background */}
          <rect width="500" height="260" fill="oklch(18% 0.06 230)" rx="16" />

          {/* Papua (not in UPG island list) */}
          <ellipse
            cx={PAPUA.cx} cy={PAPUA.cy} rx={PAPUA.rx} ry={PAPUA.ry}
            transform={`rotate(${PAPUA.rotate} ${PAPUA.cx} ${PAPUA.cy})`}
            fill="oklch(28% 0.06 258)"
            stroke="oklch(40% 0.08 258)"
            strokeWidth="1"
          />
          <text x={PAPUA.cx} y={PAPUA.cy + PAPUA.ry + 12} textAnchor="middle"
            fill="oklch(55% 0.04 258)" fontSize="8" fontFamily="sans-serif">
            Papua
          </text>

          {/* Islands */}
          {ISLAND_SHAPES.map((shape) => {
            const stat = statsByIsland[shape.id];
            const isToday = shape.id === todayIsland;
            const isHovered = hoveredIsland === shape.id;
            const hasPrayers = (stat?.total_prayers ?? 0) > 0;

            const fill = isToday
              ? TERRA
              : hasPrayers
              ? "oklch(35% 0.09 258)"
              : "oklch(28% 0.06 258)";

            const stroke = isToday
              ? "oklch(70% 0.15 38)"
              : isHovered
              ? "oklch(55% 0.08 258)"
              : "oklch(38% 0.08 258)";

            return (
              <g
                key={shape.id}
                onMouseEnter={() => setHoveredIsland(shape.id)}
                onMouseLeave={() => setHoveredIsland(null)}
                style={{ cursor: "pointer" }}
              >
                <ellipse
                  cx={shape.cx} cy={shape.cy}
                  rx={shape.rx} ry={shape.ry}
                  transform={`rotate(${shape.rotate ?? 0} ${shape.cx} ${shape.cy})`}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isToday ? 1.5 : 1}
                  style={{ transition: "fill 0.2s, stroke 0.2s" }}
                />

                {/* Pulsing dot for today's island */}
                {isToday && (
                  <>
                    <circle cx={shape.cx} cy={shape.cy} r="5" fill="white" opacity="0.9">
                      <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0;0.9" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={shape.cx} cy={shape.cy} r="4" fill="white" opacity="0.95" />
                  </>
                )}

                {/* Prayer count badge */}
                {hasPrayers && (
                  <text
                    x={shape.cx}
                    y={shape.cy + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={isToday ? "10" : "8"}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {formatNum(stat.total_prayers)}
                  </text>
                )}

                {/* Island label below */}
                <text
                  x={shape.cx}
                  y={shape.textY ?? shape.cy + shape.ry + 12}
                  textAnchor="middle"
                  fill={isToday ? "oklch(80% 0.12 38)" : "oklch(55% 0.04 258)"}
                  fontSize="7"
                  fontFamily="sans-serif"
                >
                  {lang === "id" ? shape.labelId : shape.labelEn}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <circle cx="14" cy="244" r="4" fill={TERRA} />
          <text x="22" y="248" fill="oklch(55% 0.04 258)" fontSize="7" fontFamily="sans-serif">
            {lang === "id" ? "Fokus hari ini" : "Today's focus"}
          </text>
          <circle cx="100" cy="244" r="4" fill="oklch(35% 0.09 258)" />
          <text x="108" y="248" fill="oklch(55% 0.04 258)" fontSize="7" fontFamily="sans-serif">
            {lang === "id" ? "Sudah didoakan" : "Prayed for"}
          </text>
        </svg>
      </div>

      {/* Island breakdown */}
      <div className="flex-1 bg-[var(--color-cream)] rounded-t-3xl px-5 pt-5 pb-10">
        {/* Summary stats */}
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
                  const barWidth = (stat.upg_count / maxUPGs) * 100;

                  return (
                    <div
                      key={stat.island}
                      className={`bg-white rounded-2xl px-4 py-3 ${isToday ? "ring-2 ring-[var(--color-terra)]" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {isToday && (
                            <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-terra)]" />
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
                            width: `${barWidth}%`,
                            background: isToday
                              ? "var(--color-terra)"
                              : "var(--color-navy-light)",
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
