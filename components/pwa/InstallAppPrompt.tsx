"use client";

import { useCallback, useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import {
  isAndroid,
  isDesktopUa,
  isIos,
  isStandaloneDisplay,
} from "@/lib/pwa/detect-platform";
import {
  getPwaPromptChoice,
  setPwaPromptChoice,
} from "@/lib/pwa/install-storage";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppPrompt() {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [iosMode, setIosMode] = useState(false);
  const [desktopMode, setDesktopMode] = useState(false);

  const tryShow = useCallback(() => {
    if (isStandaloneDisplay()) return;
    const choice = getPwaPromptChoice();
    if (choice) return;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (isStandaloneDisplay()) return;

    const choice = getPwaPromptChoice();
    if (choice) return;

    setIosMode(isIos());
    setDesktopMode(isDesktopUa() && !isIos());

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(tryShow, 1500);
    };

    window.addEventListener("beforeinstallprompt", onBip);

    const t = window.setTimeout(() => {
      if (isIos() || isAndroid() || isDesktopUa()) tryShow();
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.clearTimeout(t);
    };
  }, [tryShow]);

  async function handleInstall() {
    if (iosMode) {
      setOpen(false);
      return;
    }
    if (!deferred) {
      setOpen(false);
      return;
    }
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setPwaPromptChoice("installed");
    setDeferred(null);
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

  if (!open) return null;

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
          {iosMode
            ? "على الآيفون: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية» لفتح الموقع كتطبيق."
            : desktopMode
              ? "على الكمبيوتر: ثبّت التطبيق ليظهر في شريط المهام (Taskbar) وتفتحه في نافذة مستقلة."
              : "ثبّت التطبيق على جهازك لفتح المتجر بسرعة من أيقونة على الشاشة الرئيسية."}
        </p>

        {iosMode ? (
          <ol className="mt-4 list-decimal space-y-1 ps-5 text-sm text-brand-navy/80">
            <li>افتح القائمة (زر المشاركة) في Safari</li>
            <li>اختر «إضافة إلى الشاشة الرئيسية»</li>
            <li>اضغط «إضافة»</li>
          </ol>
        ) : null}

        {!iosMode && !deferred ? (
          <p className="mt-3 text-xs text-brand-navy/60">
            إن لم يعمل الزر: من قائمة المتصفح (⋮) اختر «تثبيت {SITE_NAME}» أو
            «Install app».
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          {!iosMode && deferred ? (
            <button
              type="button"
              onClick={() => void handleInstall()}
              className="rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-navy"
            >
              {desktopMode ? "تثبيت على شريط المهام" : "تثبيت التطبيق"}
            </button>
          ) : null}
          {iosMode ? (
            <button
              type="button"
              onClick={() => {
                setPwaPromptChoice("dismissed");
                setOpen(false);
              }}
              className="rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-navy"
            >
              فهمت الخطوات
            </button>
          ) : null}
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
