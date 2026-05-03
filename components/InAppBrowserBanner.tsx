"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LanguageContext";

function detectContext(): { isInApp: boolean; platform: "ios" | "android" | "unknown" } {
  if (typeof window === "undefined") return { isInApp: false, platform: "unknown" };
  const ua = navigator.userAgent;

  const uaInApp = /WhatsApp|Telegram\/|Instagram|FBAN|FBAV|FB_IAB|Line\/|MicroMessenger|Twitter|TikTok/.test(ua);
  const telegramProxy = "TelegramWebviewProxy" in window;
  const noServiceWorker = typeof navigator.serviceWorker === "undefined";

  const isInApp = uaInApp || telegramProxy || noServiceWorker;
  const platform: "ios" | "android" | "unknown" = /iPhone|iPad|iPod/.test(ua)
    ? "ios"
    : /Android/.test(ua)
    ? "android"
    : "unknown";
  return { isInApp, platform };
}

export default function InAppBrowserBanner() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "unknown">("unknown");

  useEffect(() => {
    if (sessionStorage.getItem("iab-dismissed")) return;
    const { isInApp, platform } = detectContext();
    if (isInApp) {
      setShow(true);
      setPlatform(platform);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    sessionStorage.setItem("iab-dismissed", "1");
    setShow(false);
  };

  const browserName = platform === "ios" ? "Safari" : "Chrome";

  const title =
    lang === "id"
      ? `Buka di ${browserName} untuk pengalaman penuh`
      : `Open in ${browserName} for the full experience`;

  const body =
    lang === "id"
      ? `Notifikasi doa dan instalasi aplikasi tidak tersedia di browser bawaan. Ketuk ⋮ lalu "Buka di ${browserName}".`
      : `Prayer notifications and app install don't work in this browser. Tap ⋮ then "Open in ${browserName}".`;

  return (
    <div className="fixed top-0 inset-x-0 z-[200] flex justify-center px-3 pt-3 pointer-events-none">
      <div
        className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 shadow-xl pointer-events-auto flex gap-3 items-start"
        role="alert"
      >
        <svg
          className="mt-0.5 flex-shrink-0 text-amber-600"
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-amber-900 text-sm font-bold leading-snug">{title}</p>
          <p className="text-amber-800 text-xs leading-snug mt-0.5">{body}</p>
        </div>
        <button
          onClick={dismiss}
          className="flex-shrink-0 text-amber-500 hover:text-amber-700 p-1 -mt-0.5 -mr-1"
          aria-label="Tutup"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
