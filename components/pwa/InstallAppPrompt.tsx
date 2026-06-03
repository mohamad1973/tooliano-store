"use client";

import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import { isDesktopUa } from "@/lib/pwa/detect-platform";
import { getPwaPromptChoice, setPwaPromptChoice } from "@/lib/pwa/install-storage";
import { usePwaInstall } from "@/components/pwa/PwaInstallProvider";

export function InstallAppPrompt() {
  const { canInstall, promptInstall } = usePwaInstall();
  const [open, setOpen] = useState(false);
  const desktopMode = isDesktopUa();

  useEffect(() => {
    if (!canInstall) {
      setOpen(false);
      return;
    }
    if (getPwaPromptChoice()) return;
    const t = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(t);
  }, [canInstall]);

  if (!open || !canInstall) return null;

  async function handleInstall() {
    const ok = await promptInstall();
    if (ok) setPwaPromptChoice("installed");
    setOpen(false);
  }

  function handleLater() {
    setPwaPromptChoice("dismissed");
    setOpen(false);
  }

  function handleNever() {
    setPwaPromptChoice("never");
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-navy/50 p-4 sm:items-center"
      dir="rtl"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-brand-gray bg-brand-white p-6 shadow-xl">
        <h2
          id="pwa-install-title"
          className="text-lg font-bold text-brand-navy"
        >
          تثبيت {SITE_NAME} كتطبيق
        </h2>
        <p className="mt-2 text-sm text-brand-navy/70">
          {desktopMode
            ? "ثبّت التطبيق ليظهر في شريط المهام ويفتح في نافذة مستقلة."
            : "ثبّت التطبيق ليظهر أيقونة على شاشتك ويفتح كتطبيق بدون شريط المتصفح."}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void handleInstall()}
            className="rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-navy shadow-sm"
          >
            {desktopMode ? "تثبيت على شريط المهام" : "تثبيت التطبيق"}
          </button>
          <button
            type="button"
            onClick={handleLater}
            className="rounded-xl border border-brand-gray py-3 text-sm font-semibold text-brand-navy"
          >
            لاحقاً
          </button>
          <button
            type="button"
            onClick={handleNever}
            className="text-xs font-medium text-brand-navy/50 hover:text-brand-navy"
          >
            لا تُظهر مرة أخرى
          </button>
        </div>
      </div>
    </div>
  );
}
