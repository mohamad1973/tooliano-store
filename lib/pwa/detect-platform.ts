export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export function isMobileUa(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

export function isDesktopUa(): boolean {
  return !isMobileUa();
}

/** متصفح داخل واتساب / تيليجرام / فيسبوك — التثبيت غالباً غير متاح */
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/FBAN|FBAV|Instagram|Line\//i.test(ua)) return true;
  if (/WhatsApp|Telegram/i.test(ua)) return true;
  if (isAndroid() && /\; wv\)/.test(ua)) return true;
  return false;
}

export function isAndroidChrome(): boolean {
  return isAndroid() && /Chrome/i.test(navigator.userAgent) && !isInAppBrowser();
}
