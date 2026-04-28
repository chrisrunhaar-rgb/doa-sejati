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

  return (
    <Ctx.Provider value={{ prompt, clear: () => setPrompt(null) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useInstallPrompt() {
  return useContext(Ctx);
}
