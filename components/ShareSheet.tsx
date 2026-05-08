"use client";

import { useState } from "react";
import Image from "next/image";
import { useLang } from "./LanguageContext";
import { t, tr } from "@/lib/i18n";

interface ShareSheetProps {
  groupName: string;
  onClose: () => void;
}

export default function ShareSheet({ groupName, onClose }: ShareSheetProps) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);

  const message = t.share.message[lang](groupName);
  const url = "https://doasejati.org";
  const fullMessage = message;

  const shareWhatsApp = () => {
    const text = lang === "id"
      ? `Saya bergabung dalam gerakan doa harian untuk suku-suku terabaikan di Indonesia. Mari bergabung bersama kami dan jadilah bagian dari gerakan transformasi ini! 🙏\n\nwww.doasejati.org`
      : `I joined this daily prayer movement for the unreached peoples of Indonesia. Join us and become part of this transformation movement! 🙏\n\nwww.doasejati.org`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: "Doa Sejati", text: message, url });
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    // Backdrop — full screen, click-outside closes
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet — constrained to max app width */}
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl animate-float-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        {/* DS logo + group name */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-[var(--color-navy-deep)]">
          <Image
            src="/icons/logo-ds-white.png"
            alt="Doa Sejati"
            width={40}
            height={40}
            className="flex-shrink-0"
          />
          <div>
            <div className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">
              {lang === "id" ? "Hari ini saya berdoa untuk" : "Today I prayed for"}
            </div>
            <div className="text-white font-bold text-sm leading-tight">{groupName}</div>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          {/* WhatsApp */}
          <button
            onClick={shareWhatsApp}
            className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-[#25D366]/10 text-[#128C7E] font-semibold"
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 3C9 3 3 9 3 16c0 2.4.65 4.7 1.8 6.7L3 29l6.5-1.7A13 13 0 0016 29c7 0 13-5.8 13-13S23 3 16 3zm7.3 18.3c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.3.1-2.2-.2-.5-.2-1.2-.4-2-.8-3.6-1.5-5.9-5.2-6.1-5.4-.2-.3-1.6-2.1-1.6-4s1-3 1.4-3.5c.4-.4.8-.5 1.1-.5h.8c.3 0 .6.1.9.7l1.2 2.9c.1.3 0 .6-.1.9l-.5.8c-.1.2-.2.5 0 .7.9 1.7 2 2.8 3.7 3.7.3.1.6.1.8-.1l.8-1c.2-.3.5-.3.8-.2l2.8 1.3c.3.1.5.3.5.6 0 0 .1.8-.1 1.5z" />
            </svg>
            WhatsApp
          </button>

          {/* Native share (Other) — only on devices that support it */}
          {hasNativeShare && (
            <button
              onClick={shareNative}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-[var(--color-navy)]/8 text-[var(--color-navy)] font-semibold"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {tr(t.share.other, lang)}
            </button>
          )}

          {/* Copy link */}
          <button
            onClick={copyLink}
            className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-[var(--color-surface)] text-[var(--color-ink)] font-semibold"
          >
            {copied ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
            {copied ? tr(t.share.copied, lang) : tr(t.share.copy, lang)}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 text-[var(--color-muted)] font-medium"
        >
          {tr(t.common.close, lang)}
        </button>
      </div>
    </div>
  );
}
