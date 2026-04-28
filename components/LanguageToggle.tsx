"use client";

import { useLang } from "./LanguageContext";

export default function LanguageToggle({
  variant = "default",
}: {
  variant?: "default" | "white";
}) {
  const { lang, setLang } = useLang();

  const base =
    "text-xs font-bold tracking-widest px-2 py-1 rounded transition-all";
  const active =
    variant === "white"
      ? "text-white"
      : "text-[var(--color-navy)]";
  const inactive =
    variant === "white"
      ? "text-white/40"
      : "text-[var(--color-muted)]";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLang("id")}
        className={`${base} ${lang === "id" ? active : inactive}`}
        aria-pressed={lang === "id"}
      >
        🇮🇩 ID
      </button>
      <span className={variant === "white" ? "text-white/30" : "text-[var(--color-border)]"}>
        |
      </span>
      <button
        onClick={() => setLang("en")}
        className={`${base} ${lang === "en" ? active : inactive}`}
        aria-pressed={lang === "en"}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
