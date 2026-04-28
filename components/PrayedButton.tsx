"use client";

import { useState, useRef } from "react";
import { useLang } from "./LanguageContext";
import { t, tr } from "@/lib/i18n";

interface PrayedButtonProps {
  onPrayed: () => Promise<void>;
  initialPrayed?: boolean;
}

interface RippleOrigin {
  x: number;
  y: number;
  size: number;
  key: number;
}

export default function PrayedButton({
  onPrayed,
  initialPrayed = false,
}: PrayedButtonProps) {
  const { lang } = useLang();
  const [prayed, setPrayed] = useState(initialPrayed);
  const [loading, setLoading] = useState(false);
  const [ripple, setRipple] = useState<RippleOrigin | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePray = async () => {
    if (prayed || loading) return;

    // Capture button center for ripple origin
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setRipple({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        size: Math.max(rect.width, 60),
        key: Date.now(),
      });
      // Clean up after last ring finishes (1.2s + 360ms delay)
      setTimeout(() => setRipple(null), 2800);
    }

    setLoading(true);
    await onPrayed();
    setPrayed(true);
    setLoading(false);
  };

  if (prayed) {
    return (
      <div className="relative w-full max-w-xs py-4 rounded-2xl bg-[var(--color-prayed)] text-white font-bold text-lg tracking-wide text-center shadow-lg shadow-[var(--color-prayed)]/30">
        {tr(t.prayer.prayedConfirm, lang)}
      </div>
    );
  }

  return (
    <>
      {/* Water rings — fixed, renders over entire screen */}
      {ripple && (
        <div
          key={ripple.key}
          aria-hidden
          style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}
        >
          {[0, 240, 480].map((delay) => (
            <div
              key={delay}
              style={{
                position: "absolute",
                left: ripple.x - ripple.size / 2,
                top: ripple.y - ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
                borderRadius: "50%",
                border: "2.5px solid rgba(255,255,255,0.65)",
                background: "transparent",
                animation: `water-ring 2s cubic-bezier(0.15, 0.5, 0.4, 1) ${delay}ms forwards`,
              }}
            />
          ))}
        </div>
      )}

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
