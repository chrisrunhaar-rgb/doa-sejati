"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import { t, tr } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  language: Lang;
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
    email: "",
    notifTime: "07:00",
    consent: false,
  });
  const [notifGranted, setNotifGranted] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [installed, setInstalled] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleLanguageChoice = (l: Lang) => {
    setForm((f) => ({ ...f, language: l }));
    setLang(l);
    setStep(2);
  };

  const handleEmailStep = (skip = false) => {
    if (!skip && form.email && !form.email.includes("@")) return;
    setStep(3);
  };

  const handleTimeStep = () => setStep(4);

  const handleNotifRequest = async () => {
    if (!("Notification" in window)) {
      setStep(5);
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifGranted(permission === "granted");

    // Register push subscription if granted
    if (permission === "granted" && "serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        // Push subscription stored in Supabase in production
        await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
        });
      } catch {
        // VAPID key not configured yet — continue gracefully
      }
    }

    setStep(5);
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

  const totalSteps = 5;

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
            src="/icons/logo-white.png"
            alt="Doa Sejati"
            width={60}
            height={60}
            className="mx-auto mb-3 opacity-90"
          />
          <h1 className="font-display text-2xl font-bold text-white">
            Doa Sejati
          </h1>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-5 pb-8">
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

        {step === 2 && (
          <div className="animate-float-in">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              {tr(t.signup.emailStep, lang)}
            </h2>
            <p className="text-white/60 text-sm mb-6">
              {tr(t.signup.emailHint, lang)}
            </p>

            <input
              ref={emailRef}
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@contoh.com"
              className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-white/40 mb-4"
            />

            <button
              onClick={() => handleEmailStep(false)}
              className="w-full py-4 rounded-2xl font-bold text-white bg-[var(--color-terra)] mb-3"
            >
              {tr(t.signup.continueBtn, lang)}
            </button>
            <button
              onClick={() => handleEmailStep(true)}
              className="w-full py-3 text-white/50 text-sm"
            >
              {tr(t.signup.skipEmail, lang)}
            </button>
          </div>
        )}

        {step === 3 && (
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

        {step === 4 && (
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
              onClick={() => setStep(5)}
              className="w-full max-w-xs mx-auto py-3 text-white/50 text-sm block"
            >
              {tr(t.common.cancel, lang)}
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="animate-float-in">
            {/* Install prompt — show if available */}
            {installPrompt && !installed && (
              <div className="mb-6 p-4 rounded-2xl bg-white/8 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src="/icons/logo.png"
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                  <div>
                    <div className="font-bold text-white text-sm">
                      Doa Sejati
                    </div>
                    <div className="text-white/50 text-xs">doasejati.net</div>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-1">
                  {tr(t.signup.installApp, lang)}
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  {tr(t.signup.installHint, lang)}
                </p>
                <button
                  onClick={handleInstall}
                  className="w-full py-3 rounded-xl font-bold text-white bg-[var(--color-terra)] mb-2"
                >
                  {tr(t.signup.installBtn, lang)}
                </button>
                <button
                  onClick={() => setInstallPrompt(null)}
                  className="w-full py-2 text-white/40 text-sm"
                >
                  {tr(t.signup.laterBtn, lang)}
                </button>
              </div>
            )}

            {installed && (
              <div className="mb-6 p-4 rounded-2xl bg-[var(--color-prayed)]/20 border border-[var(--color-prayed)]/30 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-white font-semibold">
                  {lang === "id"
                    ? "Aplikasi terpasang!"
                    : "App installed!"}
                </p>
              </div>
            )}

            {/* Consent + start */}
            <div className="mt-4">
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
          </div>
        )}
      </div>
    </div>
  );
}
