"use client";

import { useState, useRef } from "react";

const SIZE = 240;
const CR = SIZE / 2;
const OUTER_R = CR - 26;   // outer ring marker radius (1–12)
const INNER_R = CR - 60;   // inner ring marker radius (0, 13–23)
const HAND_OUTER = 75;     // hand length for outer hours
const HAND_INNER = 50;     // hand length for inner hours
const ZONE_THRESHOLD = 72; // distance from center: < this = inner ring

export function AnalogTimePicker({
  value,
  onChange,
  lang = "id",
}: {
  value: string;
  onChange: (v: string) => void;
  lang?: string;
}) {
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const h24 = parseInt(value.split(":")[0], 10) || 0;
  const min = parseInt(value.split(":")[1], 10) || 0;

  const isInnerHour = h24 === 0 || h24 > 12;
  const hourAngle = h24 === 0 ? 0 : h24 <= 12 ? (h24 / 12) * 360 : ((h24 - 12) / 12) * 360;
  const minAngle = (min / 60) * 360;
  const handLength = isInnerHour ? HAND_INNER : HAND_OUTER;

  function pointerInfo(e: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current!.getBoundingClientRect();
    const dx = e.clientX - (rect.left + CR);
    const dy = e.clientY - (rect.top + CR);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = ((Math.atan2(dx, -dy) * (180 / Math.PI)) + 360) % 360;
    return { angle, dist };
  }

  function applyPointer(e: React.PointerEvent<SVGSVGElement>) {
    const { angle, dist } = pointerInfo(e);
    if (mode === "hour") {
      const slot = Math.round(angle / 30) % 12; // 0–11
      let finalH: number;
      if (dist < ZONE_THRESHOLD) {
        // Inner ring: slot 0 → 00:00, slots 1–11 → 13–23
        finalH = slot === 0 ? 0 : slot + 12;
      } else {
        // Outer ring: slot 0 → 12, slots 1–11 → 1–11
        finalH = slot === 0 ? 12 : slot;
      }
      onChange(`${String(finalH).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    } else {
      const newMin = Math.round(angle / 6) % 60;
      onChange(`${String(h24).padStart(2, "0")}:${String(newMin).padStart(2, "0")}`);
    }
  }

  function handXY(angleDeg: number, len: number) {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return { x: CR + Math.cos(rad) * len, y: CR + Math.sin(rad) * len };
  }

  const hourEnd = handXY(hourAngle, handLength);
  const minEnd = handXY(minAngle, 90);

  // Outer markers: 12, 1–11
  const outerMarkers = Array.from({ length: 12 }, (_, i) => {
    const h = i === 0 ? 12 : i;
    const rad = (i * 30 - 90) * (Math.PI / 180);
    const selected = h24 === h;
    return { h, x: CR + Math.cos(rad) * OUTER_R, y: CR + Math.sin(rad) * OUTER_R, selected };
  });

  // Inner markers: 00, 13–23
  const innerMarkers = Array.from({ length: 12 }, (_, i) => {
    const h = i === 0 ? 0 : i + 12;
    const rad = (i * 30 - 90) * (Math.PI / 180);
    const selected = h24 === h;
    return { h, label: i === 0 ? "00" : String(h), x: CR + Math.cos(rad) * INNER_R, y: CR + Math.sin(rad) * INNER_R, selected };
  });

  const minTicks = Array.from({ length: 60 }, (_, i) => {
    const rad = (i * 6 - 90) * (Math.PI / 180);
    const major = i % 5 === 0;
    const inner = CR - (major ? 14 : 9);
    return {
      x1: CR + Math.cos(rad) * inner, y1: CR + Math.sin(rad) * inner,
      x2: CR + Math.cos(rad) * (CR - 5), y2: CR + Math.sin(rad) * (CR - 5),
      major,
    };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 24-hour digital readout — no AM/PM */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setMode("hour")}
          className="text-4xl font-bold font-mono rounded-lg px-2 py-1 transition-colors"
          style={{
            color: mode === "hour" ? "var(--color-terra)" : "rgba(255,255,255,0.5)",
            background: mode === "hour" ? "rgba(255,255,255,0.08)" : "transparent",
          }}
        >
          {String(h24).padStart(2, "0")}
        </button>
        <span className="text-4xl font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>:</span>
        <button
          onClick={() => setMode("minute")}
          className="text-4xl font-bold font-mono rounded-lg px-2 py-1 transition-colors"
          style={{
            color: mode === "minute" ? "var(--color-terra)" : "rgba(255,255,255,0.5)",
            background: mode === "minute" ? "rgba(255,255,255,0.08)" : "transparent",
          }}
        >
          {String(min).padStart(2, "0")}
        </button>
      </div>

      {/* Mode hint */}
      <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
        {mode === "hour"
          ? (lang === "id" ? "Sentuh jam" : "Tap to set hour")
          : (lang === "id" ? "Sentuh menit" : "Tap to set minute")}
      </p>

      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        style={{ touchAction: "none", cursor: "pointer", userSelect: "none" }}
        onPointerDown={(e) => {
          dragging.current = true;
          svgRef.current?.setPointerCapture(e.pointerId);
          applyPointer(e);
        }}
        onPointerMove={(e) => { if (dragging.current) applyPointer(e); }}
        onPointerUp={() => {
          dragging.current = false;
          if (mode === "hour") setMode("minute");
        }}
      >
        {/* Clock face */}
        <circle cx={CR} cy={CR} r={CR - 2} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />

        {/* Dashed separator between inner/outer zones */}
        {mode === "hour" && (
          <circle cx={CR} cy={CR} r={ZONE_THRESHOLD} fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="3 5" />
        )}

        {/* Minute ticks */}
        {mode === "minute" && minTicks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke="rgba(255,255,255,0.25)" strokeWidth={t.major ? 1.5 : 0.8} />
        ))}

        {/* Hour markers */}
        {mode === "hour" && (
          <>
            {outerMarkers.map((m) => (
              <text key={m.h} x={m.x} y={m.y} textAnchor="middle" dominantBaseline="central"
                fontSize={13} fontWeight={600}
                fill={m.selected ? "var(--color-terra)" : "rgba(255,255,255,0.75)"}>
                {m.h}
              </text>
            ))}
            {innerMarkers.map((m) => (
              <text key={m.h} x={m.x} y={m.y} textAnchor="middle" dominantBaseline="central"
                fontSize={10} fontWeight={500}
                fill={m.selected ? "var(--color-terra)" : "rgba(255,255,255,0.4)"}>
                {m.label}
              </text>
            ))}
          </>
        )}

        {/* Hands */}
        <line x1={CR} y1={CR} x2={hourEnd.x} y2={hourEnd.y}
          stroke={mode === "hour" ? "var(--color-terra)" : "rgba(255,255,255,0.45)"}
          strokeWidth={mode === "hour" ? 4 : 3} strokeLinecap="round" />
        <line x1={CR} y1={CR} x2={minEnd.x} y2={minEnd.y}
          stroke={mode === "minute" ? "var(--color-terra)" : "rgba(255,255,255,0.45)"}
          strokeWidth={mode === "minute" ? 3 : 2} strokeLinecap="round" />

        <circle cx={CR} cy={CR} r={5} fill="var(--color-terra)" />
      </svg>
    </div>
  );
}
