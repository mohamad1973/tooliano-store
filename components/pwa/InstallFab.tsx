"use client";

import { usePwaInstall } from "@/components/pwa/PwaInstallProvider";
import { getPwaPromptChoice } from "@/lib/pwa/install-storage";

export function InstallFab() {
  const { canInstall, isStandalone, promptInstall } = usePwaInstall();

  if (!canInstall || isStandalone) return null;
  if (getPwaPromptChoice() === "never") return null;

  return (
    <button
      type="button"
      onClick={() => void promptInstall()}
      className="fixed bottom-4 start-4 z-[90] rounded-full bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-navy shadow-lg"
      aria-label="تثبيت التطبيق"
    >
      تثبيت التطبيق
    </button>
  );
}
