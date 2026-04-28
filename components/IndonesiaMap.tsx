"use client";

import { useEffect, useState } from "react";

// Simplified province dots — approximate positions within the island layout
// Coordinates are within a 800x260 viewBox representing the Indonesian archipelago
const PROVINCES: Array<{
  name: string;
  island: string;
  cx: number;
  cy: number;
}> = [
  // Sumatera (left)
  { name: "Aceh", island: "Sumatera", cx: 62, cy: 60 },
  { name: "Sumatera Utara", island: "Sumatera", cx: 88, cy: 82 },
  { name: "Riau", island: "Sumatera", cx: 112, cy: 108 },
  { name: "Sumatera Barat", island: "Sumatera", cx: 92, cy: 112 },
  { name: "Jambi", island: "Sumatera", cx: 116, cy: 128 },
  { name: "Sumatera Selatan", island: "Sumatera", cx: 126, cy: 148 },
  { name: "Bengkulu", island: "Sumatera", cx: 106, cy: 142 },
  { name: "Lampung", island: "Sumatera", cx: 132, cy: 166 },
  { name: "Kepulauan Bangka Belitung", island: "Sumatera", cx: 148, cy: 148 },
  { name: "Kepulauan Riau", island: "Sumatera", cx: 152, cy: 108 },

  // Jawa (center-left)
  { name: "DKI Jakarta", island: "Jawa", cx: 210, cy: 168 },
  { name: "Banten", island: "Jawa", cx: 196, cy: 170 },
  { name: "Jawa Barat", island: "Jawa", cx: 224, cy: 172 },
  { name: "Jawa Tengah", island: "Jawa", cx: 248, cy: 172 },
  { name: "DI Yogyakarta", island: "Jawa", cx: 258, cy: 178 },
  { name: "Jawa Timur", island: "Jawa", cx: 274, cy: 170 },

  // Kalimantan (center)
  { name: "Kalimantan Barat", island: "Kalimantan", cx: 218, cy: 130 },
  { name: "Kalimantan Tengah", island: "Kalimantan", cx: 244, cy: 128 },
  { name: "Kalimantan Selatan", island: "Kalimantan", cx: 258, cy: 148 },
  { name: "Kalimantan Timur", island: "Kalimantan", cx: 272, cy: 118 },
  { name: "Kalimantan Utara", island: "Kalimantan", cx: 278, cy: 98 },

  // Bali & Nusa Tenggara
  { name: "Bali", island: "Bali", cx: 292, cy: 180 },
  { name: "Nusa Tenggara Barat", island: "NTB", cx: 312, cy: 180 },
  { name: "Nusa Tenggara Timur", island: "NTT", cx: 350, cy: 186 },

  // Sulawesi (center-right)
  { name: "Sulawesi Utara", island: "Sulawesi", cx: 352, cy: 102 },
  { name: "Sulawesi Barat", island: "Sulawesi", cx: 330, cy: 140 },
  { name: "Sulawesi Tengah", island: "Sulawesi", cx: 348, cy: 128 },
  { name: "Gorontalo", island: "Sulawesi", cx: 360, cy: 112 },
  { name: "Sulawesi Tenggara", island: "Sulawesi", cx: 352, cy: 152 },
  { name: "Sulawesi Selatan", island: "Sulawesi", cx: 336, cy: 158 },

  // Maluku
  { name: "Maluku Utara", island: "Maluku", cx: 412, cy: 118 },
  { name: "Maluku", island: "Maluku", cx: 420, cy: 148 },

  // Papua
  { name: "Papua Barat", island: "Papua", cx: 492, cy: 130 },
  { name: "Papua", island: "Papua", cx: 580, cy: 148 },
];

interface ProvinceCounts {
  [province: string]: number;
}

function getPrayerIntensity(count: number): number {
  if (count === 0) return 0;
  if (count < 10) return 0.2;
  if (count < 50) return 0.4;
  if (count < 200) return 0.6;
  if (count < 500) return 0.8;
  return 1;
}

function getProvinceColor(intensity: number): string {
  if (intensity === 0) return "oklch(70% 0.02 258)"; // pale, no prayers
  // Interpolate from pale blue to bright terracotta/gold glow
  if (intensity < 0.4)
    return `oklch(${72 + intensity * 20}% ${0.05 + intensity * 0.12} 55)`;
  return `oklch(${70 + intensity * 22}% ${0.12 + intensity * 0.1} 38)`;
}

export default function IndonesiaMap({
  provinceCounts = {},
  totalPraying = 0,
  className = "",
}: {
  provinceCounts?: ProvinceCounts;
  totalPraying?: number;
  className?: string;
}) {
  const [pulsingProvince, setPulsingProvince] = useState<string | null>(null);

  // Randomly pulse a province to simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const withPrayers = PROVINCES.filter(
        (p) => (provinceCounts[p.name] ?? 0) > 0
      );
      if (withPrayers.length > 0) {
        const pick = withPrayers[Math.floor(Math.random() * withPrayers.length)];
        setPulsingProvince(pick.name);
        setTimeout(() => setPulsingProvince(null), 1200);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [provinceCounts]);

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 40 660 160"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-label="Peta doa Indonesia"
      >
        {/* Background */}
        <rect x="0" y="0" width="660" height="260" fill="transparent" />

        {/* Province dots */}
        {PROVINCES.map((p) => {
          const count = provinceCounts[p.name] ?? 0;
          const intensity = getPrayerIntensity(count);
          const isPulsing = pulsingProvince === p.name;
          const color = getProvinceColor(intensity);
          const r = intensity === 0 ? 3.5 : 4 + intensity * 2;

          return (
            <g key={p.name}>
              {/* Pulse ring */}
              {isPulsing && (
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={r + 4}
                  fill="none"
                  stroke="oklch(75% 0.14 45)"
                  strokeWidth="1.5"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    from={r + 2}
                    to={r + 14}
                    dur="1s"
                    fill="freeze"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0"
                    dur="1s"
                    fill="freeze"
                  />
                </circle>
              )}

              {/* Glow for active provinces */}
              {intensity > 0 && (
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={r + 6}
                  fill={color}
                  opacity={0.12 * intensity}
                />
              )}

              {/* Main dot */}
              <circle
                cx={p.cx}
                cy={p.cy}
                r={r}
                fill={color}
                opacity={intensity === 0 ? 0.35 : 0.85}
              />
            </g>
          );
        })}
      </svg>

      {/* Total counter */}
      {totalPraying > 0 && (
        <div className="absolute top-0 right-0 text-right">
          <div className="text-2xl font-bold text-white font-display">
            {totalPraying.toLocaleString("id")}
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            berdoa sekarang
          </div>
        </div>
      )}
    </div>
  );
}
