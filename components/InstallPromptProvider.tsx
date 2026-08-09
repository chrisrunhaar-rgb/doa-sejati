"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface InstallPromptCtx {
  prompt: Event | null;
  clear: () => void;
}

const Ctx = createContext<InstallPromptCtx>({ prompt: null, clear: () => {} });

export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const onInstalled = () => {
      const userId = localStorage.getItem("ds_user_id");
      if (userId) {
        const userToken = localStorage.getItem("ds_user_token") || "";
        fetch("/api/pwa-install", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-token": userToken },
          body: JSON.stringify({ userId }),
        }).catch(() => {});
      } else {
        // Signup not completed yet — flag it so create-profile can attach it later
        localStorage.setItem("ds_pwa_installed_pending", "1");
      }
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  return (
    <Ctx.Provider value={{ prompt, clear: () => setPrompt(null) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useInstallPrompt() {
  return useContext(Ctx);
}
