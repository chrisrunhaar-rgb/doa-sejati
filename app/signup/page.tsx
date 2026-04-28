"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import { t, tr } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface FormData {
  language: Lang;
  name: string;
  email: string;
  notifTime: "07:00" | "12:00" | "20:00" | string;
  consent: boolean;
}

export default function SignupPage() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    language: "id",
    name: "",
    email: "",
    notifTime: "07:00",
    consent: false,
  });
  const [notifGranted, setNotifGranted] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Capture PWA install prompt (Android Chrome)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Platform detection
  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).standalone === true
    );
  }, []);

  const handleLanguageChoice = (l: Lang) => {
    setForm((f) => ({ ...f, language: l }));
    setLang(l);
    setStep(2);
  };

  const handleNameStep = () => {
    if (!form.name.trim()) return;
    setStep(3);
  };

  const handleTimeStep = () => setStep(5);

  const handleNotifRequest = async () => {
    if (!("Notification" in window)) {
      setStep(6);
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifGranted(permission === "granted");

    if (permission === "granted" && "serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
        });
      } catch {
        // VAPID key not configured yet — continue gracefully
      }
    }

    setStep(6);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (installPrompt as any).prompt();
    if (result?.outcome === "accepted") {
      setInstalled(true);
    }
  };

  const handleFinish = () => {
    // In production: save user to Supabase
    router.push("/today");
  };

  const totalSteps = 6;

  return (
    <div className="min-h-screen bg-[var(--color-navy-deep)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-2">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            className="text-white/60 hover:text-white/90 p-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <Link href="/" className="text-white/60 hover:text-white/90 p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        )}

        {/* Progress */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? "w-6 bg-[var(--color-terra)]"
                  : i + 1 < step
                  ? "w-3 bg-white/50"
                  : "w-3 bg-white/15"
              }`}
            />
          ))}
        </div>

        <div className="w-10" />
      </div>

      {/* Logo */}
      <div className="flex justify-center py-6">
        <div className="text-center">
          <Image
            src="/icons/logo-ds.jpg"
            alt="Doa Sejati"
            width={60}
            height={60}
            className="mx-auto mb-3 rounded-xl object-cover"
          />
          <h1 className="font-display text-2xl font-bold text-white">
            Doa Sejati
          </h1>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-5 pb-8">

        {/* Step 1 — Language */}
        {step === 1 && (
          <div className="animate-float-in text-center">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              {tr(t.signup.welcome, lang)}
            </h2>
            <p className="text-white/60 mb-8">
              {tr(t.signup.chooseLanguage, lang)}
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                onClick={() => handleLanguageChoice("id")}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
              >
                <span className="text-3xl">🇮🇩</span>
                <div className="text-left">
                  <div className="font-bold text-white">Bahasa Indonesia</div>
                  <div className="text-white/50 text-sm">Bahasa utama</div>
                </div>
              </button>
              <button
                onClick={() => handleLanguageChoice("en")}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
              >
                <span className="text-3xl">🇬🇧</span>
                <div className="text-left">
                  <div className="font-bold text-white">English</div>
                  <div className="text-white/50 text-sm">Secondary language</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Name + Email */}
        {step === 2 && (
          <div className="animate-float-in">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              {lang === "id" ? "Siapa namamu?" : "What's your name?"}
            </h2>
            <p className="text-white/60 text-sm mb-6">
              {lang === "id"
                ? "Nama kamu akan muncul di streak dan tim doa kamu."
                : "Your name will appear in your streak and prayer teams."}
            </p>

            <input
              ref={nameRef}
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={lang === "id" ? "Nama kamu" : "Your name"}
              autoComplete="given-name"
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-white/40 mb-3"
            />

            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder={lang === "id" ? "Email (opsional)" : "Email (optional)"}
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-white/40 mb-1"
            />
            <p className="text-white/35 text-xs mb-5 px-1">
              {lang === "id"
                ? "Untuk rekap doa bulanan. Bisa ditambahkan nanti."
                : "For monthly prayer recaps. Can be added later."}
            </p>

            <button
              onClick={handleNameStep}
              disabled={!form.name.trim()}
              className="w-full py-4 rounded-2xl font-bold text-white bg-[var(--color-terra)] disabled:opacity-40 transition-opacity"
            >
              {tr(t.signup.continueBtn, lang)}
            </button>
          </div>
        )}

        {/* Step 3 — Install app */}
        {step === 3 && (
          <div className="animate-float-in">
            {isStandalone || installed ? (
              <>
                <div className="p-5 rounded-2xl bg-[var(--color-prayed)]/20 border border-[var(--color-prayed)]/30 text-center mb-6">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-white font-bold text-lg">
                    {lang === "id" ? "Aplikasi sudah terpasang!" : "App already installed!"}
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    {lang === "id" ? "Kamu sudah menggunakan Doa Sejati sebagai app." : "You are already using Doa Sejati as an app."}
                  </p>
                </div>
                <button
                  onClick={() => setStep(4)}
                  className="w-full py-4 rounded-2xl font-bold text-white bg-[var(--color-terra)]"
                >
                  {tr(t.signup.continueBtn, lang)}
                </button>
              </>
            ) : isIOS ? (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  {lang === "id" ? "Pasang di iPhone kamu" : "Add to your iPhone"}
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  {lang === "id"
                    ? "Buka Doa Sejati langsung dari layar utama — tanpa app store."
                    : "Open Doa Sejati straight from your home screen — no app store needed."}
                </p>
                <div className="p-4 rounded-2xl bg-white/8 border border-white/10 mb-6">
                  <ol className="flex flex-col gap-4">
                    {(lang === "id"
                      ? [
                          { icon: "⬆️", text: "Tap ikon Bagikan (kotak dengan panah ke atas) di bagian bawah Safari" },
                          { icon: "📋", text: "Scroll ke bawah dan pilih Tambahkan ke Layar Utama" },
                          { icon: "✅", text: "Tap Tambahkan di pojok kanan atas" },
                        ]
                      : [
                          { icon: "⬆️", text: "Tap the Share icon (box with arrow) at the bottom of Safari" },
                          { icon: "📋", text: "Scroll down and tap Add to Home Screen" },
                          { icon: "✅", text: "Tap Add in the top right corner" },
                        ]
                    ).map(({ icon, text }, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="text-xl w-7 flex-shrink-0 text-center">{icon}</span>
                        <span className="text-white/80 text-sm leading-snug pt-0.5">{text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <button
                  onClick={() => setStep(4)}
                  className="w-full py-4 rounded-2xl font-bold text-white bg-[var(--color-terra)] mb-3"
                >
                  {lang === "id" ? "Sudah ditambahkan →" : "Done, I added it →"}
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="w-full py-3 text-white/40 text-sm"
                >
                  {tr(t.signup.laterBtn, lang)}
                </button>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  {tr(t.signup.installApp, lang)}
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  {tr(t.signup.installHint, lang)}
                </p>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/8 border border-white/10 mb-6">
                  <Image src="/icons/logo-ds.jpg" alt="" width={48} height={48} className="rounded-xl flex-shrink-0" />
                  <div>
                    <div className="font-bold text-white">Doa Sejati</div>
                    <div className="text-white/50 text-sm">doasejati.net</div>
                  </div>
                </div>
                {installPrompt ? (
                  <>
                    <button
                      onClick={handleInstall}
                      className="w-full py-4 rounded-2xl font-bold text-white bg-[var(--color-terra)] mb-3"
                    >
                      {tr(t.signup.installBtn, lang)}
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="w-full py-3 text-white/40 text-sm"
                    >
                      {tr(t.signup.laterBtn, lang)}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setStep(4)}
                    className="w-full py-4 rounded-2xl font-bold text-white bg-[var(--color-terra)]"
                  >
                    {tr(t.signup.continueBtn, lang)}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 4 — Notification time */}
        {step === 4 && (
          <div className="animate-float-in">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              {tr(t.signup.reminderTime, lang)}
            </h2>
            <p className="text-white/60 text-sm mb-6">
              {lang === "id"
                ? "Zona waktu WIB akan terdeteksi secara otomatis."
                : "Your timezone will be detected automatically."}
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {[
                { value: "07:00", icon: "🌅", label: tr(t.signup.morning, lang) },
                { value: "12:00", icon: "☀️", label: tr(t.signup.noon, lang) },
                { value: "20:00", icon: "🌙", label: tr(t.signup.evening, lang) },
              ].map(({ value, icon, label }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, notifTime: value }))}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    form.notifTime === value
                      ? "bg-[var(--color-terra)]/20 border-[var(--color-terra)] text-white"
                      : "bg-white/8 border-white/10 text-white/80"
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="font-semibold">{label}</span>
                  {form.notifTime === value && (
                    <svg className="ml-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleTimeStep}
              className="w-full py-4 rounded-2xl font-bold text-white bg-[var(--color-terra)]"
            >
              {tr(t.signup.continueBtn, lang)}
            </button>
          </div>
        )}

        {/* Step 5 — Notification permission */}
        {step === 5 && (
          <div className="animate-float-in text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              {tr(t.signup.enableNotif, lang)}
            </h2>
            <p className="text-white/60 text-sm mb-8">
              {tr(t.signup.notifHint, lang)}
            </p>

            <button
              onClick={handleNotifRequest}
              className="w-full max-w-xs mx-auto py-4 rounded-2xl font-bold text-white bg-[var(--color-terra)] block mb-3"
            >
              {tr(t.signup.allowNotif, lang)}
            </button>
            <button
              onClick={() => setStep(6)}
              className="w-full max-w-xs mx-auto py-3 text-white/50 text-sm block"
            >
              {tr(t.common.cancel, lang)}
            </button>
          </div>
        )}

        {/* Step 6 — Consent + Start */}
        {step === 6 && (
          <div className="animate-float-in">
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              {lang === "id" ? "Hampir selesai!" : "Almost there!"}
            </h2>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, consent: e.target.checked }))
                }
                className="mt-1 w-5 h-5 rounded accent-[var(--color-terra)] flex-shrink-0"
              />
              <span className="text-white/70 text-sm leading-relaxed">
                {tr(t.signup.consent, lang)}
                <Link href="/privacy" className="text-[var(--color-terra)] font-semibold">
                  {tr(t.signup.privacyLink, lang)}
                </Link>
                {tr(t.signup.andWord, lang)}
                <Link href="/terms" className="text-[var(--color-terra)] font-semibold">
                  {tr(t.signup.termsLink, lang)}
                </Link>
                .
              </span>
            </label>

            <button
              onClick={handleFinish}
              disabled={!form.consent}
              className="w-full py-4 rounded-2xl font-bold text-white bg-[var(--color-terra)] disabled:opacity-40 transition-opacity"
            >
              {tr(t.signup.startPraying, lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
