"use client";

import { useState } from "react";
import { useLang } from "./LanguageContext";
import { t, tr } from "@/lib/i18n";

interface PrayedButtonProps {
  onPrayed: () => Promise<void>;
  initialPrayed?: boolean;
}

export default function PrayedButton({
  onPrayed,
  initialPrayed = false,
}: PrayedButtonProps) {
  const { lang } = useLang();
  const [prayed, setPrayed] = useState(initialPrayed);
  const [loading, setLoading] = useState(false);

  const handlePray = async () => {
    if (prayed || loading) return;
    setLoading(true);
    await onPrayed();
    setPrayed(true);
    setLoading(false);
  };

  if (prayed) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="animate-check-pop flex items-center justify-center gap-3 w-full max-w-xs py-4 rounded-2xl bg-[var(--color-prayed)] text-white font-bold text-lg tracking-wide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {tr(t.prayer.prayedConfirm, lang)}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handlePray}
      disabled={loading}
      className="relative w-full max-w-xs py-4 rounded-2xl font-bold text-lg tracking-wide text-white
        bg-[var(--color-terra)] active:bg-[var(--color-terra-dark)]
        transition-all duration-150 active:scale-[0.97]
        disabled:opacity-60
        shadow-lg shadow-[var(--color-terra)]/30"
      style={{ animation: "prayer-glow 2.5s infinite" }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      ) : (
        <>
          <span className="flex items-center justify-center gap-2">
            🙏 {tr(t.prayer.prayedBtn, lang)}
          </span>
          <span className="absolute -inset-1 rounded-2xl animate-[pulse-ring_2s_ease-out_infinite] border-2 border-[var(--color-terra)] opacity-30 pointer-events-none" />
        </>
      )}
    </button>
  );
}
