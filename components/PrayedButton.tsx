"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLang } from "./LanguageContext";
import { t, tr } from "@/lib/i18n";

interface PrayedButtonProps {
  onPrayed: () => Promise<void>;
  initialPrayed?: boolean;
}

const RING_DURATION = 2200; // ms per ring — slower = more natural
const RING_STAGGER  = 300;  // ms between rings
const RING_COUNT    = 4;

export default function PrayedButton({
  onPrayed,
  initialPrayed = false,
}: PrayedButtonProps) {
  const { lang } = useLang();
  const [prayed, setPrayed]   = useState(initialPrayed);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number | null>(null);
  const rippleRef = useRef<{ x: number; y: number; maxR: number; t0: number } | null>(null);

  const startRipple = useCallback((originX: number, originY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    const maxR = Math.sqrt(
      Math.pow(Math.max(originX, W - originX), 2) +
      Math.pow(Math.max(originY, H - originY), 2)
    ) + 40;

    rippleRef.current = { x: originX, y: originY, maxR, t0: performance.now() };
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const ctx = canvas.getContext("2d")!;

    function frame(now: number) {
      if (!rippleRef.current) return;
      const { x, y, maxR, t0 } = rippleRef.current;
      const elapsed = now - t0;

      ctx.clearRect(0, 0, W, H);

      let alive = false;
      for (let i = 0; i < RING_COUNT; i++) {
        const re = elapsed - i * RING_STAGGER;
        if (re < 0) { alive = true; continue; }
        const t = re / RING_DURATION;
        if (t >= 1) continue;
        alive = true;

        const r = maxR * t;

        // Soft outer glow
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180,220,255,${((1 - t) * 0.18).toFixed(3)})`;
        ctx.lineWidth   = 28 * (1 - t * 0.6);
        ctx.stroke();

        // Bright thin edge
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${(Math.pow(1 - t, 1.2) * 0.55).toFixed(3)})`;
        ctx.lineWidth   = 2.5 * (1 - t * 0.5);
        ctx.stroke();
      }

      if (alive) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, W, H);
        rippleRef.current = null;
        animRef.current   = null;
      }
    }

    animRef.current = requestAnimationFrame(frame);
  }, []);

  const handlePray = async () => {
    if (prayed || loading) return;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      startRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    setLoading(true);
    await onPrayed();
    setPrayed(true);
    setLoading(false);
  };

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  if (prayed) {
    return (
      <div className="relative w-full max-w-xs py-4 rounded-2xl bg-[var(--color-prayed)] text-white font-bold text-lg tracking-wide text-center shadow-lg shadow-[var(--color-prayed)]/30">
        {tr(t.prayer.prayedConfirm, lang)}
      </div>
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}
      />
      <button
        ref={buttonRef}
        onClick={handlePray}
        disabled={loading}
        className="relative w-full max-w-xs py-4 rounded-2xl font-bold text-lg tracking-wide text-white
          bg-[var(--color-terra)] active:bg-[var(--color-terra-dark)]
          transition-all duration-150 active:scale-[0.97]
          disabled:opacity-60"
        style={{ animation: "prayer-glow 2.8s ease-in-out infinite" }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        ) : (
          tr(t.prayer.prayedBtn, lang)
        )}
      </button>
    </>
  );
}
