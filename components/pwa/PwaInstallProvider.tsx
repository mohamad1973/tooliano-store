"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BeforeInstallPromptEvent } from "@/lib/pwa/install-prompt";
import { isIos, isStandaloneDisplay } from "@/lib/pwa/detect-platform";
import {
  getPwaPromptChoice,
  setPwaPromptChoice,
} from "@/lib/pwa/install-storage";

type PwaInstallContextValue = {
  canInstall: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<boolean>;
  dismissPromptUi: () => void;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function usePwaInstall() {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }
  return ctx;
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneDisplay());

    if (isStandaloneDisplay()) return;
    if (getPwaPromptChoice() === "installed") {
      setInstalled(true);
      return;
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setPwaPromptChoice("installed");
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setPwaPromptChoice("installed");
      setInstalled(true);
    }
    setDeferred(null);
    return outcome === "accepted";
  }, [deferred]);

  const dismissPromptUi = useCallback(() => {
    setPwaPromptChoice("dismissed");
  }, []);

  const canInstall = Boolean(deferred) && !installed && !isStandalone && !isIos();

  const value = useMemo(
    () => ({
      canInstall,
      isStandalone,
      promptInstall,
      dismissPromptUi,
    }),
    [canInstall, isStandalone, promptInstall, dismissPromptUi],
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
    </PwaInstallContext.Provider>
  );
}
