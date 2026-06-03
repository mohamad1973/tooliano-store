"use client";

import { useCallback, useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import {
  isAndroid,
  isDesktopUa,
  isInAppBrowser,
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

const ANDROID_WAIT_MS = 6000;
const DEFAULT_WAIT_MS = 2500;

export function InstallAppPrompt() {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [iosMode, setIosMode] = useState(false);
  const [androidMode, setAndroidMode] = useState(false);
  const [desktopMode, setDesktopMode] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);

  const tryShow = useCallback(() => {
    if (isStandaloneDisplay()) return;
    if (getPwaPromptChoice()) return;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (isStandaloneDisplay()) return;
    if (getPwaPromptChoice()) return;

    const ios = isIos();
    const android = isAndroid() && !ios;
    setIosMode(ios);
    setAndroidMode(android);
    setDesktopMode(isDesktopUa() && !ios);
    setInAppBrowser(isInAppBrowser());

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      window.setTimeout(tryShow, 300);
    };

    window.addEventListener("beforeinstallprompt", onBip);

    const waitMs = android ? ANDROID_WAIT_MS : DEFAULT_WAIT_MS;
    const fallbackTimer = window.setTimeout(tryShow, waitMs);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.clearTimeout(fallbackTimer);
    };
  }, [tryShow]);

  async function handleInstall() {
    if (!deferred) return;
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

  const canNativeInstall = Boolean(deferred) && !iosMode;

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

        {inAppBrowser ? (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            يُفضّل فتح الموقع في <strong>Chrome</strong>: من القائمة اختر «فتح في
            المتصفح» ثم ثبّت التطبيق.
          </p>
        ) : null}

        <p className="mt-2 text-sm text-brand-navy/70">
          {iosMode
            ? "على الآيفون استخدم Safari ثم «إضافة إلى الشاشة الرئيسية»."
            : desktopMode
              ? "ثبّت التطبيق ليظهر في شريط المهام (Taskbar)."
              : "ثبّت التطبيق ليظهر أيقونة على الشاشة الرئيسية."}
        </p>

        {iosMode ? (
          <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm text-brand-navy/80">
            <li>اضغط زر المشاركة في Safari (أسفل أو أعلى الشاشة)</li>
            <li>اختر «إضافة إلى الشاشة الرئيسية»</li>
            <li>اضغط «إضافة»</li>
          </ol>
        ) : null}

        {androidMode ? (
          <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm text-brand-navy/80">
            <li>
              اضغط <strong>⋮</strong> (قائمة Chrome) أعلى الشاشة
            </li>
            <li>
              اختر <strong>«تثبيت التطبيق»</strong> أو{" "}
              <strong>«إضافة إلى الشاشة الرئيسية»</strong>
            </li>
            <li>اضغط «تثبيت» أو «إضافة» للتأكيد</li>
          </ol>
        ) : null}

        {desktopMode && !canNativeInstall ? (
          <p className="mt-3 text-xs text-brand-navy/60">
            من قائمة المتصفح (⋮) اختر «تثبيت {SITE_NAME}» أو Install app.
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          {canNativeInstall ? (
            <button
              type="button"
              onClick={() => void handleInstall()}
              className="rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-navy shadow-sm"
            >
              {desktopMode ? "تثبيت على شريط المهام" : "تثبيت التطبيق الآن"}
            </button>
          ) : null}

          {androidMode && !canNativeInstall ? (
            <p className="rounded-xl bg-brand-gold/15 px-3 py-2.5 text-center text-sm font-semibold text-brand-navy">
              اتبع الخطوات أعلاه من قائمة ⋮
            </p>
          ) : null}

          {iosMode ? (
            <button
              type="button"
              onClick={() => {
                setPwaPromptChoice("dismissed");
                setOpen(false);
              }}
              className="rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-navy"
            >
              فهمت الخطوات
            </button>
          ) : null}

          {!iosMode && !androidMode && !canNativeInstall ? (
            <button
              type="button"
              onClick={handleLater}
              className="rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-navy"
            >
              حسناً
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
